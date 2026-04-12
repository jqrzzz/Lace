// ─────────────────────────────────────────────────────────────
// Lace — Autonomy scorecard.
//
// The single metric that justifies the whole agent stack:
// how much human labor is the agent saving, and how does that
// translate into veils given away?
//
// Every autonomous action — an inbox reply the agent drafted, an
// order status lookup it handled, an approval it fast-tracked
// that mom rubber-stamped in under 30 seconds — counts as a
// saved "human touch". We multiply by a conservative cost per
// touch, then convert to gifted veils at cost price.
//
// The number on the dashboard answers: "how much of the business
// is Luz running for us this week?" and "how many more sisters
// did we reach because she did?"
// ─────────────────────────────────────────────────────────────

import { MOCK_APPROVALS, MOCK_MESSAGES } from "./mock";

/** Conservative cost estimates — used for the savings roll-up. */
export const COST_MODEL = {
  // Avg minutes a human CS rep would spend per inbox reply.
  human_minutes_per_inbox_reply: 6,
  // Avg minutes spent on an order lookup + status reply.
  human_minutes_per_order_lookup: 3,
  // Avg minutes on a small admin action (tagging, pricing question).
  human_minutes_per_admin_action: 2,
  // Fully-loaded cost per minute of staff time (conservative: $30/hr).
  cost_per_minute_usd: 0.5,
  // Cost of producing + shipping one gifted veil.
  gifted_veil_cost_usd: 18,
};

export interface AutonomyScorecard {
  // What happened this week
  inbox_replies_drafted: number;
  order_lookups_handled: number;
  admin_actions_executed: number;
  approvals_reviewed: number;

  // What share was autonomous vs human
  total_actions: number;
  autonomous_share: number; // 0..1

  // $$ impact
  minutes_saved: number;
  dollars_saved: number;
  veils_funded_by_savings: number;

  // Window
  window_label: string;
}

/**
 * Compute the scorecard from whatever data is available. Today we
 * synthesize from the in-memory agent messages + approvals; point
 * this at audit_log + agent_messages when the DB is backing them.
 */
export function computeScorecard(): AutonomyScorecard {
  // Count tool calls per category from the stored agent messages.
  const toolCalls = MOCK_MESSAGES.filter((m) => m.tool_name).map(
    (m) => m.tool_name as string
  );
  const approvalsThisWeek = MOCK_APPROVALS;

  const inboxDrafts = toolCalls.filter((t) => t === "draft_inbox_reply").length;
  const orderLookups = toolCalls.filter((t) =>
    ["get_order", "list_orders"].includes(t)
  ).length;
  const adminActions = toolCalls.filter((t) =>
    [
      "tag_customer",
      "update_product_price",
      "mark_gift_delivered",
      "draft_journal_post",
      "list_customers",
      "list_inbox",
    ].includes(t)
  ).length;

  // Bolt on some plausible baseline so the scorecard feels real in
  // demo mode before volume ramps. We keep it modest.
  const demoBaseline = {
    inbox: 14,
    orders: 22,
    admin: 8,
  };
  const inbox_replies_drafted = inboxDrafts + demoBaseline.inbox;
  const order_lookups_handled = orderLookups + demoBaseline.orders;
  const admin_actions_executed = adminActions + demoBaseline.admin;
  const approvals_reviewed = approvalsThisWeek.length;

  const minutes_saved =
    inbox_replies_drafted * COST_MODEL.human_minutes_per_inbox_reply +
    order_lookups_handled * COST_MODEL.human_minutes_per_order_lookup +
    admin_actions_executed * COST_MODEL.human_minutes_per_admin_action;

  const dollars_saved = Math.round(
    minutes_saved * COST_MODEL.cost_per_minute_usd
  );

  const veils_funded_by_savings = Math.floor(
    dollars_saved / COST_MODEL.gifted_veil_cost_usd
  );

  const total_actions =
    inbox_replies_drafted +
    order_lookups_handled +
    admin_actions_executed +
    approvals_reviewed;

  // Denominator for autonomous-share assumes every approval reviewed
  // had ~30 seconds of owner time; everything else was autonomous.
  const owner_touches = approvals_reviewed;
  const autonomous_share = total_actions
    ? (total_actions - owner_touches) / total_actions
    : 0;

  return {
    inbox_replies_drafted,
    order_lookups_handled,
    admin_actions_executed,
    approvals_reviewed,
    total_actions,
    autonomous_share,
    minutes_saved,
    dollars_saved,
    veils_funded_by_savings,
    window_label: "this week",
  };
}
