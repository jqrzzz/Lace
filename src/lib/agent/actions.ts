// ─────────────────────────────────────────────────────────────
// Lace — Concrete state-mutation handlers.
//
// Each function here is a single small DB write the agent or the
// admin UI can run. The agent calls these via tryRealExecution()
// in store.ts when an approval is approved; the admin API routes
// call them directly when mom takes action from a page.
//
// Every handler:
//   - takes a typed payload + db client + actor label
//   - writes the change with a single UPDATE
//   - writes one audit_log row
//   - returns { ok, effects, sessionNote, error? }
//
// Returns are uniform so callers (approval simulator, REST routes)
// can share the same response shape.
// ─────────────────────────────────────────────────────────────

import Stripe from "stripe";
import type { LaceServiceClient } from "@/lib/db";
import { sendRefundEmail } from "@/lib/email";
import { writeAudit } from "./store";

export interface ActionResult {
  ok: boolean;
  effects: string[];
  sessionNote: string;
  error?: string;
}

export interface ActionContext {
  actorLabel: string;
  /** 'user' for mom / staff / approver; 'agent' if the agent is acting. */
  actorType?: "user" | "agent";
  /** Optional approval id to thread into the audit row. */
  approvalId?: string | null;
}

function nowIso() {
  return new Date().toISOString();
}

// ── Orders ─────────────────────────────────────────────────────

export interface MarkOrderShippedPayload {
  order_number: string;
  tracking_number?: string;
  carrier?: string;
}

export async function markOrderShipped(
  db: LaceServiceClient,
  payload: MarkOrderShippedPayload,
  ctx: ActionContext,
): Promise<ActionResult> {
  const orderNumber = payload.order_number;
  if (!orderNumber) {
    return notOk("Missing order number.");
  }
  const update: Record<string, unknown> = {
    status: "shipped",
    shipped_at: nowIso(),
  };
  if (payload.tracking_number) update.tracking_number = payload.tracking_number;
  if (payload.carrier) update.carrier = payload.carrier;

  const { data, error } = await db
    .from("orders")
    .update(update)
    .eq("order_number", orderNumber)
    .select("id, order_number")
    .maybeSingle();
  if (error || !data) {
    return notOk(
      `Couldn't mark ${orderNumber} shipped${error ? `: ${error.message}` : " — not found"}.`,
    );
  }
  const human = `Marked ${data.order_number ?? orderNumber} shipped${
    payload.tracking_number ? ` (tracking ${payload.tracking_number})` : ""
  }.`;
  await writeAudit({
    actor_type: ctx.actorType ?? "user",
    actor_label: ctx.actorLabel,
    action: "order.mark_shipped",
    entity_type: "order",
    entity_id: data.id,
    metadata: {
      order_number: data.order_number,
      tracking_number: payload.tracking_number ?? null,
      carrier: payload.carrier ?? null,
      approval_id: ctx.approvalId ?? null,
    },
  });
  return { ok: true, effects: [human], sessionNote: human };
}

export interface AddTrackingPayload {
  order_number: string;
  tracking_number: string;
  carrier?: string;
}

export async function addTrackingNumber(
  db: LaceServiceClient,
  payload: AddTrackingPayload,
  ctx: ActionContext,
): Promise<ActionResult> {
  if (!payload.order_number || !payload.tracking_number) {
    return notOk("Order number and tracking number are required.");
  }
  const update: Record<string, unknown> = {
    tracking_number: payload.tracking_number,
  };
  if (payload.carrier) update.carrier = payload.carrier;
  const { data, error } = await db
    .from("orders")
    .update(update)
    .eq("order_number", payload.order_number)
    .select("id, order_number")
    .maybeSingle();
  if (error || !data) {
    return notOk(
      `Couldn't update ${payload.order_number}${error ? `: ${error.message}` : " — not found"}.`,
    );
  }
  const human = `Tracking ${payload.tracking_number} added to ${data.order_number ?? payload.order_number}.`;
  await writeAudit({
    actor_type: ctx.actorType ?? "user",
    actor_label: ctx.actorLabel,
    action: "order.add_tracking",
    entity_type: "order",
    entity_id: data.id,
    metadata: {
      order_number: data.order_number,
      tracking_number: payload.tracking_number,
      carrier: payload.carrier ?? null,
      approval_id: ctx.approvalId ?? null,
    },
  });
  return { ok: true, effects: [human], sessionNote: human };
}

export interface RefundOrderPayload {
  order_number: string;
  amount_cents?: number;
  reason: string;
}

/**
 * Refund a Stripe-paid order. Calls stripe.refunds.create when
 * STRIPE_SECRET_KEY is configured; otherwise records the intent and
 * marks the audit row simulated=true so local dev keeps working.
 *
 * Full refunds flip the order status to 'refunded'. Partial refunds
 * leave the status alone and rely on the audit row + Stripe to keep
 * the truth.
 */
export async function refundOrder(
  db: LaceServiceClient,
  payload: RefundOrderPayload,
  ctx: ActionContext,
): Promise<ActionResult> {
  if (!payload.order_number || !payload.reason?.trim()) {
    return notOk("Order number and reason are required for refunds.");
  }

  const { data: order, error: readErr } = await db
    .from("orders")
    .select(
      "id, order_number, total_cents, stripe_payment_intent, status, customer_email, customer_name",
    )
    .eq("order_number", payload.order_number)
    .maybeSingle();
  if (readErr || !order) {
    return notOk(`Couldn't find order ${payload.order_number}.`);
  }

  const amount = payload.amount_cents ?? order.total_cents;
  if (amount <= 0 || amount > order.total_cents) {
    return notOk(
      `Refund amount must be between $0.01 and $${(order.total_cents / 100).toFixed(2)}.`,
    );
  }
  if (order.status === "refunded") {
    return notOk(`${order.order_number} has already been refunded.`);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  let stripeRefundId: string | null = null;
  let simulated = true;

  if (stripeKey) {
    if (!order.stripe_payment_intent) {
      return notOk(
        `${order.order_number} has no Stripe payment recorded — can't refund.`,
      );
    }
    try {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2026-03-25.dahlia",
      });
      const refund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent,
        amount,
        reason: "requested_by_customer",
        metadata: {
          order_number: order.order_number ?? "",
          reason: payload.reason.slice(0, 500),
          actor: ctx.actorLabel.slice(0, 200),
        },
      });
      stripeRefundId = refund.id;
      simulated = false;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[actions/refundOrder] Stripe refund failed:", err);
      return notOk(`Stripe refund failed: ${message}`);
    }
  }

  const isFull = amount === order.total_cents;
  if (isFull) {
    const { error: statusErr } = await db
      .from("orders")
      .update({ status: "refunded" })
      .eq("id", order.id);
    if (statusErr) {
      console.error(
        "[actions/refundOrder] status update failed:",
        statusErr,
      );
    }
  }

  // Customer notice — only when the refund actually happened (skip
  // in the simulated/no-Stripe-key path so we don't email people
  // about money that didn't move).
  let emailNoticed: { id: string | null; simulated: boolean } | null = null;
  if (!simulated && order.customer_email) {
    emailNoticed = await sendRefundEmail({
      to: order.customer_email,
      firstName:
        (typeof order.customer_name === "string"
          ? order.customer_name.split(" ")[0]
          : null) ?? null,
      orderNumber: order.order_number ?? "",
      amountCents: amount,
      isFull,
    });
  }

  const human = simulated
    ? `Refund recorded: $${(amount / 100).toFixed(2)} on ${order.order_number} (no Stripe key set — audit only).`
    : `Refunded $${(amount / 100).toFixed(2)} on ${order.order_number} via Stripe.`;

  await writeAudit({
    actor_type: ctx.actorType ?? "user",
    actor_label: ctx.actorLabel,
    action: "order.refund",
    entity_type: "order",
    entity_id: order.id,
    metadata: {
      order_number: order.order_number,
      amount_cents: amount,
      full_refund: isFull,
      reason: payload.reason,
      stripe_refund_id: stripeRefundId,
      simulated,
      customer_email_sent: emailNoticed
        ? { resend_id: emailNoticed.id, simulated: emailNoticed.simulated }
        : null,
      approval_id: ctx.approvalId ?? null,
    },
  });

  return { ok: true, effects: [human], sessionNote: human };
}

// ── Mission ────────────────────────────────────────────────────

export interface AssignMissionGiftPayload {
  gift_id: string;
  recipient_id: string;
}

export async function assignMissionGift(
  db: LaceServiceClient,
  payload: AssignMissionGiftPayload,
  ctx: ActionContext,
): Promise<ActionResult> {
  if (!payload.gift_id || !payload.recipient_id) {
    return notOk("Gift id and recipient id are required.");
  }
  const { data, error } = await db
    .from("mission_gifts")
    .update({
      recipient_id: payload.recipient_id,
      status: "allocated",
      allocated_at: nowIso(),
    })
    .eq("id", payload.gift_id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return notOk(
      `Couldn't assign gift${error ? `: ${error.message}` : " — not found"}.`,
    );
  }
  const human = `Gift assigned to recipient ${payload.recipient_id.slice(0, 8)}….`;
  await writeAudit({
    actor_type: ctx.actorType ?? "user",
    actor_label: ctx.actorLabel,
    action: "mission_gift.assign",
    entity_type: "mission_gift",
    entity_id: data.id,
    metadata: {
      recipient_id: payload.recipient_id,
      approval_id: ctx.approvalId ?? null,
    },
  });
  return { ok: true, effects: [human], sessionNote: human };
}

export interface MarkGiftDeliveredPayload {
  gift_id: string;
  story?: string;
}

export async function markGiftDelivered(
  db: LaceServiceClient,
  payload: MarkGiftDeliveredPayload,
  ctx: ActionContext,
): Promise<ActionResult> {
  if (!payload.gift_id) {
    return notOk("Gift id is required.");
  }
  const update: Record<string, unknown> = {
    status: "delivered",
    delivered_at: nowIso(),
  };
  if (typeof payload.story === "string") update.story = payload.story;
  const { data, error } = await db
    .from("mission_gifts")
    .update(update)
    .eq("id", payload.gift_id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    return notOk(
      `Couldn't mark gift delivered${error ? `: ${error.message}` : " — not found"}.`,
    );
  }
  const human = "Gift marked delivered.";
  await writeAudit({
    actor_type: ctx.actorType ?? "user",
    actor_label: ctx.actorLabel,
    action: "mission_gift.deliver",
    entity_type: "mission_gift",
    entity_id: data.id,
    metadata: { approval_id: ctx.approvalId ?? null },
  });
  return { ok: true, effects: [human], sessionNote: human };
}

// ── Customers ─────────────────────────────────────────────────

export interface TagCustomerPayload {
  customer_id: string;
  tag: string;
}

export async function tagCustomer(
  db: LaceServiceClient,
  payload: TagCustomerPayload,
  ctx: ActionContext,
): Promise<ActionResult> {
  if (!payload.customer_id || !payload.tag) {
    return notOk("Customer id and tag are required.");
  }
  const { data: row, error: readErr } = await db
    .from("customers")
    .select("id, tags")
    .eq("id", payload.customer_id)
    .maybeSingle();
  if (readErr || !row) {
    return notOk(
      `Couldn't tag customer${readErr ? `: ${readErr.message}` : " — not found"}.`,
    );
  }
  const existing: string[] = Array.isArray(
    (row as { tags?: unknown }).tags,
  )
    ? ((row as { tags: string[] }).tags as string[])
    : [];
  const tags = Array.from(new Set([...existing, payload.tag]));
  const { error: writeErr } = await db
    .from("customers")
    .update({ tags })
    .eq("id", payload.customer_id);
  if (writeErr) {
    return notOk(`Couldn't tag customer: ${writeErr.message}.`);
  }
  const human = `Tagged customer with "${payload.tag}".`;
  await writeAudit({
    actor_type: ctx.actorType ?? "user",
    actor_label: ctx.actorLabel,
    action: "customer.tag",
    entity_type: "customer",
    entity_id: payload.customer_id,
    metadata: { tag: payload.tag, approval_id: ctx.approvalId ?? null },
  });
  return { ok: true, effects: [human], sessionNote: human };
}

function notOk(message: string): ActionResult {
  return {
    ok: false,
    effects: [message],
    sessionNote: message,
    error: message,
  };
}
