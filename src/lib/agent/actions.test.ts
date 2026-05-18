// Tests for the shared state-mutation handlers. Each handler does
// one DB write + one audit row; we assert the right calls fire with
// the right shape. Stripe and Resend are not exercised here — the
// refund test runs the no-key fallback path (audit only, simulated).

import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMockDb, findCall, type MockCall } from "@/test/supabase-mock";
import type { ActionContext } from "./actions";

let calls: MockCall[];
let dbInstance: unknown;

vi.mock("@/lib/db", () => ({
  getLaceDb: () => dbInstance,
  isLaceDbConfigured: () => true,
}));

// writeAudit lives on @/lib/agent/store and goes back through getLaceDb.
// We don't need to stub it explicitly — the same mock client receives
// the audit insert and we can assert on it.

import {
  addTrackingNumber,
  assignMissionGift,
  markGiftDelivered,
  markOrderShipped,
  refundOrder,
  tagCustomer,
} from "./actions";

const ctx: ActionContext = {
  actorLabel: "Luz Maria (owner)",
  actorType: "user",
  approvalId: null,
};

beforeEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
});

function setup(scenarioOverrides: Parameters<typeof makeMockDb>[0] = {}) {
  const handle = makeMockDb(scenarioOverrides);
  dbInstance = handle.db;
  calls = handle.calls;
  return handle;
}

describe("markOrderShipped", () => {
  it("updates the order and writes one audit row", async () => {
    setup({
      updates: {
        orders: { data: { id: "order-1", order_number: "LL-2026-1042" } },
      },
    });

    const r = await markOrderShipped(
      dbInstance as never,
      {
        order_number: "LL-2026-1042",
        tracking_number: "9405511899223456789001",
        carrier: "usps",
      },
      ctx,
    );

    expect(r.ok).toBe(true);
    expect(r.effects[0]).toContain("shipped");

    const update = findCall(calls, { table: "orders", op: "update" });
    expect(update?.payload).toMatchObject({
      status: "shipped",
      tracking_number: "9405511899223456789001",
      carrier: "usps",
    });
    expect((update?.payload as Record<string, unknown>).shipped_at).toEqual(
      expect.any(String),
    );
    expect(update?.filters).toMatchObject({ order_number: "LL-2026-1042" });

    const audit = findCall(calls, { table: "audit_log", op: "insert" });
    expect(audit?.payload).toMatchObject({
      actor_type: "user",
      actor_label: "Luz Maria (owner)",
      action: "order.mark_shipped",
      entity_type: "order",
    });
  });

  it("returns ok=false when the order isn't found", async () => {
    setup({ updates: { orders: { data: null } } });
    const r = await markOrderShipped(
      dbInstance as never,
      { order_number: "LL-2026-9999" },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("LL-2026-9999");
    // No audit row when the action didn't actually happen.
    expect(findCall(calls, { table: "audit_log", op: "insert" })).toBeUndefined();
  });

  it("rejects empty order number with a friendly message", async () => {
    setup();
    const r = await markOrderShipped(
      dbInstance as never,
      { order_number: "" },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("Missing order number");
  });
});

describe("addTrackingNumber", () => {
  it("updates tracking_number + carrier without touching status", async () => {
    setup({
      updates: {
        orders: { data: { id: "order-1", order_number: "LL-2026-1042" } },
      },
    });
    const r = await addTrackingNumber(
      dbInstance as never,
      {
        order_number: "LL-2026-1042",
        tracking_number: "TRK-1",
        carrier: "ups",
      },
      ctx,
    );
    expect(r.ok).toBe(true);
    const update = findCall(calls, { table: "orders", op: "update" });
    expect(update?.payload).toMatchObject({
      tracking_number: "TRK-1",
      carrier: "ups",
    });
    // Status MUST NOT be in the patch — adding tracking doesn't ship.
    expect((update?.payload as Record<string, unknown>).status).toBeUndefined();
    expect(findCall(calls, { table: "audit_log", op: "insert" })?.payload)
      .toMatchObject({ action: "order.add_tracking" });
  });

  it("requires both order number and tracking number", async () => {
    setup();
    const a = await addTrackingNumber(
      dbInstance as never,
      { order_number: "", tracking_number: "TRK-1" },
      ctx,
    );
    expect(a.ok).toBe(false);
    const b = await addTrackingNumber(
      dbInstance as never,
      { order_number: "LL-1", tracking_number: "" },
      ctx,
    );
    expect(b.ok).toBe(false);
  });
});

describe("refundOrder (no Stripe key — simulated path)", () => {
  it("records the intent in audit_log when STRIPE_SECRET_KEY is missing", async () => {
    setup({
      selects: {
        orders: {
          data: {
            id: "order-1",
            order_number: "LL-2026-1042",
            total_cents: 4900,
            stripe_payment_intent: "pi_test",
            status: "paid",
          },
        },
      },
      updates: { orders: { data: { id: "order-1" } } },
    });

    const r = await refundOrder(
      dbInstance as never,
      {
        order_number: "LL-2026-1042",
        amount_cents: 4900,
        reason: "Customer complaint",
      },
      ctx,
    );

    expect(r.ok).toBe(true);
    expect(r.effects[0]).toContain("audit only");

    const audit = findCall(calls, { table: "audit_log", op: "insert" });
    expect(audit?.payload).toMatchObject({
      action: "order.refund",
      entity_type: "order",
    });
    const meta = (audit?.payload as { metadata: Record<string, unknown> })
      .metadata;
    expect(meta).toMatchObject({
      amount_cents: 4900,
      full_refund: true,
      simulated: true,
      stripe_refund_id: null,
      reason: "Customer complaint",
    });
  });

  it("rejects amount > total_cents", async () => {
    setup({
      selects: {
        orders: {
          data: {
            id: "order-1",
            order_number: "LL-2026-1042",
            total_cents: 4900,
            stripe_payment_intent: "pi_test",
            status: "paid",
          },
        },
      },
    });
    const r = await refundOrder(
      dbInstance as never,
      {
        order_number: "LL-2026-1042",
        amount_cents: 9999,
        reason: "test",
      },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("between $0.01");
  });

  it("rejects already-refunded orders", async () => {
    setup({
      selects: {
        orders: {
          data: {
            id: "order-1",
            order_number: "LL-2026-1042",
            total_cents: 4900,
            stripe_payment_intent: "pi_test",
            status: "refunded",
          },
        },
      },
    });
    const r = await refundOrder(
      dbInstance as never,
      { order_number: "LL-2026-1042", reason: "twice" },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("already been refunded");
  });

  it("requires a reason", async () => {
    setup();
    const r = await refundOrder(
      dbInstance as never,
      { order_number: "LL-2026-1042", reason: "  " },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("required for refunds");
  });
});

describe("assignMissionGift", () => {
  it("updates the gift, status='allocated', timestamps allocated_at", async () => {
    setup({
      updates: {
        mission_gifts: { data: { id: "gift-1" } },
      },
    });
    const r = await assignMissionGift(
      dbInstance as never,
      { gift_id: "gift-1", recipient_id: "rec-xyz" },
      ctx,
    );
    expect(r.ok).toBe(true);
    const update = findCall(calls, {
      table: "mission_gifts",
      op: "update",
    });
    expect(update?.payload).toMatchObject({
      recipient_id: "rec-xyz",
      status: "allocated",
    });
    expect((update?.payload as Record<string, unknown>).allocated_at).toEqual(
      expect.any(String),
    );
    expect(findCall(calls, { table: "audit_log", op: "insert" })?.payload)
      .toMatchObject({ action: "mission_gift.assign" });
  });
});

describe("markGiftDelivered", () => {
  it("updates the gift with status='delivered' and stores the story", async () => {
    setup({
      updates: {
        mission_gifts: { data: { id: "gift-1" } },
      },
    });
    const r = await markGiftDelivered(
      dbInstance as never,
      { gift_id: "gift-1", story: "47 women wore them at Sunday service." },
      ctx,
    );
    expect(r.ok).toBe(true);
    const update = findCall(calls, {
      table: "mission_gifts",
      op: "update",
    });
    expect(update?.payload).toMatchObject({
      status: "delivered",
      story: "47 women wore them at Sunday service.",
    });
    expect((update?.payload as Record<string, unknown>).delivered_at).toEqual(
      expect.any(String),
    );
  });
});

describe("tagCustomer", () => {
  it("reads existing tags, dedupes, writes back", async () => {
    setup({
      selects: {
        customers: { data: { id: "cust-1", tags: ["vip"] } },
      },
      // The update is awaited as a thenable without .select() on customers.
    });
    const r = await tagCustomer(
      dbInstance as never,
      { customer_id: "cust-1", tag: "centennial-buyer" },
      ctx,
    );
    expect(r.ok).toBe(true);
    const update = findCall(calls, { table: "customers", op: "update" });
    expect(update?.payload).toMatchObject({
      tags: ["vip", "centennial-buyer"],
    });
  });

  it("does not duplicate a tag that already exists", async () => {
    setup({
      selects: {
        customers: { data: { id: "cust-1", tags: ["vip"] } },
      },
    });
    await tagCustomer(
      dbInstance as never,
      { customer_id: "cust-1", tag: "vip" },
      ctx,
    );
    const update = findCall(calls, { table: "customers", op: "update" });
    expect(update?.payload).toMatchObject({ tags: ["vip"] });
  });
});
