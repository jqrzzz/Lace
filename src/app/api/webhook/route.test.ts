// Vitest unit test for the Stripe → lace.* webhook handler.
//
// We mock the Supabase client to a thenable builder that records
// every (table, op, payload) it receives. The test asserts on the
// recorded calls — no real DB, no Stripe, no network.

import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import type { LaceServiceClient } from "@/lib/db";
import { handleCheckoutCompleted } from "./route";

interface MockCall {
  table: string;
  op: "select" | "insert" | "upsert";
  payload?: unknown;
}

/** Minimal stub of the Supabase query builder shape this handler uses. */
function makeDb(
  overrides: {
    existingOrder?: { id: string } | null;
  } = {},
): { db: LaceServiceClient; calls: MockCall[] } {
  const calls: MockCall[] = [];
  const existingOrder = overrides.existingOrder ?? null;

  const ok = <T,>(data: T) => Promise.resolve({ data, error: null });

  const from = (table: string) => {
    return {
      select: () => ({
        eq: () => ({
          maybeSingle: () => {
            calls.push({ table, op: "select" });
            return ok(table === "orders" ? existingOrder : null);
          },
        }),
      }),
      insert: (payload: unknown) => {
        calls.push({ table, op: "insert", payload });
        const rows = Array.isArray(payload) ? payload : [payload];
        const fakeRows = rows.map((r, i) => ({
          id: `${table}-${i + 1}`,
          quantity:
            (r as Record<string, unknown>).quantity !== undefined
              ? (r as Record<string, unknown>).quantity
              : 1,
        }));
        const arrResp = { data: fakeRows, error: null };
        return {
          select: () => {
            return {
              single: () =>
                Promise.resolve({ data: fakeRows[0], error: null }),
              then: <R,>(
                cb: (v: typeof arrResp) => R | PromiseLike<R>,
              ) => Promise.resolve(arrResp).then(cb),
            };
          },
          then: <R,>(cb: (v: typeof arrResp) => R | PromiseLike<R>) =>
            Promise.resolve(arrResp).then(cb),
        };
      },
      upsert: (payload: unknown) => {
        calls.push({ table, op: "upsert", payload });
        const row = Array.isArray(payload) ? payload[0] : payload;
        const fakeRow = { id: `${table}-1`, ...(row as object) };
        return {
          select: () => ({
            single: () => Promise.resolve({ data: fakeRow, error: null }),
          }),
        };
      },
    };
  };

  return {
    db: { from } as unknown as LaceServiceClient,
    calls,
  };
}

function buildSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    customer_email: "Maria@example.com",
    customer_details: {
      email: "maria@example.com",
      name: "Maria López",
      address: null,
      phone: null,
      tax_exempt: "none",
      tax_ids: [],
    },
    customer: "cus_test_456",
    amount_subtotal: 10800,
    amount_total: 10800,
    currency: "usd",
    payment_intent: "pi_test_789",
    metadata: { total_veils: "2" },
    total_details: {
      amount_discount: 0,
      amount_shipping: 0,
      amount_tax: 0,
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

function buildLineItems(): Stripe.LineItem[] {
  return [
    {
      id: "li_1",
      description: "Grace Veil",
      quantity: 1,
      price: {
        unit_amount: 4900,
        product: {
          id: "prod_grace",
          name: "Grace Veil",
          metadata: { product_id: "grace-veil", color: "Ivory" },
        } as unknown as Stripe.Product,
      } as Stripe.Price,
    } as Stripe.LineItem,
    {
      id: "li_2",
      description: "Rosa Veil",
      quantity: 1,
      price: {
        unit_amount: 5200,
        product: {
          id: "prod_rosa",
          name: "Rosa Veil",
          metadata: { product_id: "rosa-veil", color: "Blush" },
        } as unknown as Stripe.Product,
      } as Stripe.Price,
    } as Stripe.LineItem,
  ];
}

describe("handleCheckoutCompleted", () => {
  it("writes customer, order, items, gifts, and audit log on first delivery", async () => {
    const { db, calls } = makeDb();
    const result = await handleCheckoutCompleted(
      buildSession(),
      buildLineItems(),
      db,
    );

    expect(result.skipped).toBeUndefined();
    expect(result.orderId).toBe("orders-1");

    const opsByTable = calls.reduce<Record<string, MockCall[]>>((acc, c) => {
      (acc[c.table] ??= []).push(c);
      return acc;
    }, {});

    // Idempotency probe came first.
    expect(opsByTable.orders[0].op).toBe("select");

    // Customer upserted by email, normalized to lower case.
    const customerUpsert = opsByTable.customers[0];
    expect(customerUpsert.op).toBe("upsert");
    const cp = customerUpsert.payload as Record<string, unknown>;
    expect(cp.email).toBe("maria@example.com");
    expect(cp.first_name).toBe("Maria");
    expect(cp.last_name).toBe("López");
    expect(cp.stripe_customer_id).toBe("cus_test_456");

    // Order insert with cents-based totals and 'paid' status.
    const orderInsert = opsByTable.orders[1];
    expect(orderInsert.op).toBe("insert");
    const op = orderInsert.payload as Record<string, unknown>;
    expect(op.stripe_session_id).toBe("cs_test_123");
    expect(op.stripe_payment_intent).toBe("pi_test_789");
    expect(op.status).toBe("paid");
    expect(op.total_cents).toBe(10800);
    expect(op.subtotal_cents).toBe(10800);
    expect(op.currency).toBe("USD");
    expect(op.customer_id).toBe("customers-1");
    expect(op.customer_email).toBe("maria@example.com");

    // Two order item rows, snapshotted from Stripe line items.
    const itemsInsert = opsByTable.order_items[0];
    expect(itemsInsert.op).toBe("insert");
    const items = itemsInsert.payload as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      sku: "grace-veil",
      name: "Grace Veil",
      variant_name: "Ivory",
      unit_price_cents: 4900,
      quantity: 1,
      line_total_cents: 4900,
      gifts_matched: 1,
    });
    expect(items[1]).toMatchObject({
      sku: "rosa-veil",
      variant_name: "Blush",
      unit_price_cents: 5200,
    });

    // One mission gift per order item, status pending.
    const giftsInsert = opsByTable.mission_gifts[0];
    expect(giftsInsert.op).toBe("insert");
    const gifts = giftsInsert.payload as Array<Record<string, unknown>>;
    expect(gifts).toHaveLength(2);
    expect(gifts[0].status).toBe("pending");
    expect(gifts[0].order_id).toBe("orders-1");
    expect(gifts[0].order_item_id).toBe("order_items-1");

    // Audit log row.
    const auditInsert = opsByTable.audit_log[0];
    expect(auditInsert.op).toBe("insert");
    expect(auditInsert.payload).toMatchObject({
      actor_type: "webhook",
      action: "order.created",
      entity_type: "order",
      entity_id: "orders-1",
    });
  });

  it("is idempotent — duplicate delivery returns existing order without writes", async () => {
    const { db, calls } = makeDb({
      existingOrder: { id: "orders-existing" },
    });
    const result = await handleCheckoutCompleted(
      buildSession(),
      buildLineItems(),
      db,
    );

    expect(result.skipped).toBe("duplicate");
    expect(result.orderId).toBe("orders-existing");
    expect(calls.filter((c) => c.op !== "select")).toEqual([]);
  });

  it("skips line item, gift, and customer inserts when the session has no email or items", async () => {
    const { db, calls } = makeDb();
    const session = buildSession({
      customer_email: null,
      customer_details: null,
    });
    await handleCheckoutCompleted(session, [], db);

    const tables = calls.map((c) => `${c.table}.${c.op}`);
    expect(tables).not.toContain("customers.upsert");
    expect(tables).not.toContain("order_items.insert");
    expect(tables).not.toContain("mission_gifts.insert");
    expect(tables).toContain("orders.insert");
    expect(tables).toContain("audit_log.insert");
  });
});
