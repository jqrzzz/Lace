// ─────────────────────────────────────────────────────────────
// Lace — Realistic mock data for the console demo.
//
// Used whenever getLaceDb() returns null (no Supabase configured
// locally). Also seeds the in-browser console so mom can click
// through a live-looking store before a single real order lands.
//
// Nothing here gets deleted when the real DB comes online — the
// query layer picks DB vs mock based on config, and this mock stays
// useful for Storybook / tests / demos.
// ─────────────────────────────────────────────────────────────

import type {
  AgentMessage,
  AgentSession,
  ApprovalRow,
  CustomerSummary,
  InboxMessage,
  OrderSummary,
} from "./types";

// Stable ids so React keys don't thrash between renders.
const id = (s: string) => `mock-${s}`;

// "Now" for relative dates — set to today so the UI feels fresh.
const NOW = new Date("2026-04-12T14:30:00Z");
const hoursAgo = (h: number) =>
  new Date(NOW.getTime() - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

// ── Orders ─────────────────────────────────────────────────────

export const MOCK_ORDERS: OrderSummary[] = [
  {
    id: id("o-0042"),
    order_number: "LL-2026-1042",
    customer_name: "Maria López",
    customer_email: "maria.lopez@example.com",
    status: "paid",
    total_cents: 5800,
    item_count: 1,
    created_at: hoursAgo(2),
  },
  {
    id: id("o-0041"),
    order_number: "LL-2026-1041",
    customer_name: "Elena Ruiz",
    customer_email: "elena.ruiz@example.com",
    status: "paid",
    total_cents: 10800,
    item_count: 2,
    created_at: hoursAgo(5),
  },
  {
    id: id("o-0040"),
    order_number: "LL-2026-1040",
    customer_name: "Sarah Chen",
    customer_email: "sarah.c@example.com",
    status: "processing",
    total_cents: 5400,
    item_count: 1,
    created_at: hoursAgo(18),
  },
  {
    id: id("o-0039"),
    order_number: "LL-2026-1039",
    customer_name: "Ana Martínez",
    customer_email: "ana.m@example.com",
    status: "shipped",
    total_cents: 4900,
    item_count: 1,
    created_at: daysAgo(2),
    shipped_at: daysAgo(1),
    tracking_number: "9405511899223456789001",
  },
  {
    id: id("o-0038"),
    order_number: "LL-2026-1038",
    customer_name: "Rebecca Thompson",
    customer_email: "rt@example.com",
    status: "delivered",
    total_cents: 4900,
    item_count: 1,
    created_at: daysAgo(5),
    shipped_at: daysAgo(4),
  },
  {
    id: id("o-0037"),
    order_number: "LL-2026-1037",
    customer_name: "Luz Hernández",
    customer_email: "luz.h@example.com",
    status: "delivered",
    total_cents: 15600,
    item_count: 3,
    created_at: daysAgo(7),
    shipped_at: daysAgo(6),
  },
];

// ── Customers ──────────────────────────────────────────────────

export const MOCK_CUSTOMERS: CustomerSummary[] = [
  {
    id: id("c-1"),
    email: "maria.lopez@example.com",
    name: "Maria López",
    total_orders: 3,
    total_spent_cents: 16700,
    last_ordered_at: hoursAgo(2),
    tags: ["vip"],
  },
  {
    id: id("c-2"),
    email: "elena.ruiz@example.com",
    name: "Elena Ruiz",
    total_orders: 1,
    total_spent_cents: 10800,
    last_ordered_at: hoursAgo(5),
    tags: ["centennial-buyer"],
  },
  {
    id: id("c-3"),
    email: "sarah.c@example.com",
    name: "Sarah Chen",
    total_orders: 2,
    total_spent_cents: 10300,
    last_ordered_at: hoursAgo(18),
    tags: [],
  },
  {
    id: id("c-4"),
    email: "luz.h@example.com",
    name: "Luz Hernández",
    total_orders: 5,
    total_spent_cents: 28400,
    last_ordered_at: daysAgo(7),
    tags: ["vip", "bulk-ordered"],
  },
];

// ── Inbox ──────────────────────────────────────────────────────

export const MOCK_INBOX: InboxMessage[] = [
  {
    id: id("m-1"),
    name: "Patricia Gómez",
    email: "patricia.g@example.com",
    subject: "Question about the Esperanza veil",
    message:
      "Hello — my daughter's quinceañera is in June. Would the Esperanza veil arrive in time if I ordered this week? She has a warm skin tone, which do you recommend?",
    status: "new",
    reply_draft: null,
    created_at: hoursAgo(1),
  },
  {
    id: id("m-2"),
    name: "Rachel Brooks",
    email: "rachel@example.com",
    subject: "Wholesale inquiry",
    message:
      "Hi! I run a small boutique in Austin and would love to carry your veils. Do you offer wholesale terms?",
    status: "new",
    reply_draft: null,
    created_at: hoursAgo(6),
  },
  {
    id: id("m-3"),
    name: "Sister Grace Njoroge",
    email: "sistergrace@laluznairobi.org",
    subject: "Thank you from Nairobi",
    message:
      "We received the veils safely. The sisters prayed for you through the night. Forty-seven women wore them at service on Sunday. Thank you, truly.",
    status: "drafted",
    reply_draft:
      "Dear Sister Grace, thank you for such beautiful words — we cried reading them. Please send our love to the sisters…",
    created_at: daysAgo(2),
  },
];

// ── Approvals queue ────────────────────────────────────────────

export const MOCK_APPROVALS: ApprovalRow[] = [
  {
    id: id("a-1"),
    session_id: id("s-1"),
    action_type: "refund_order",
    action_payload: {
      order_number: "LL-2026-1038",
      amount_cents: 4900,
      reason:
        "Customer reports the veil arrived with a small tear near the edge — asked for a full refund rather than replacement.",
    },
    human_summary: "Full refund on order LL-2026-1038.",
    risk: "money",
    status: "pending",
    requested_by_label: "Agent",
    created_at: hoursAgo(0.5),
    expires_at: new Date(NOW.getTime() + 23 * 3600_000).toISOString(),
  },
  {
    id: id("a-2"),
    session_id: id("s-1"),
    action_type: "send_broadcast",
    action_payload: {
      template: "centennial_invite",
      subject: "A letter from our family — 100 years of light",
      audience: "all active subscribers (2,341 people)",
    },
    human_summary:
      'Send "A letter from our family — 100 years of light" to all active subscribers (2,341 people).',
    risk: "money",
    status: "pending",
    requested_by_label: "Agent",
    created_at: hoursAgo(3),
    expires_at: new Date(NOW.getTime() + 21 * 3600_000).toISOString(),
  },
  {
    id: id("a-3"),
    session_id: id("s-2"),
    action_type: "draft_inbox_reply",
    action_payload: {
      message_id: id("m-1"),
      reply:
        "Hola Patricia — congratulations on your daughter's quinceañera! Yes, the Esperanza veil will comfortably arrive in time…",
    },
    human_summary: "Draft reply to Patricia Gómez (quinceañera question).",
    risk: "normal",
    status: "pending",
    requested_by_label: "Agent",
    created_at: hoursAgo(0.2),
    expires_at: new Date(NOW.getTime() + 23.8 * 3600_000).toISOString(),
  },
];

// ── Agent sessions + messages ──────────────────────────────────

export const MOCK_SESSIONS: AgentSession[] = [
  {
    id: id("s-1"),
    title: "Morning briefing + refund request",
    actor_label: "Luz Maria (owner)",
    channel: "console",
    started_at: hoursAgo(4),
    ended_at: null,
    message_count: 12,
    approvals_pending: 2,
  },
  {
    id: id("s-2"),
    title: "Customer inquiry triage",
    actor_label: "Luz Maria (owner)",
    channel: "whatsapp",
    started_at: hoursAgo(0.3),
    ended_at: null,
    message_count: 4,
    approvals_pending: 1,
  },
];

export const MOCK_MESSAGES: AgentMessage[] = [
  {
    id: id("msg-1"),
    session_id: id("s-1"),
    turn: 1,
    role: "user",
    content: "Good morning. How are we looking today?",
    created_at: hoursAgo(4),
  },
  {
    id: id("msg-2"),
    session_id: id("s-1"),
    turn: 2,
    role: "assistant",
    content:
      "Good morning — here is Sunday, April 12. 2 new orders — $166 in revenue. 1 order still to ship. 2 things waiting for your approval. 1 new message from a customer.",
    created_at: hoursAgo(4),
  },
  {
    id: id("msg-3"),
    session_id: id("s-1"),
    turn: 3,
    role: "user",
    content:
      "Rebecca from order 1038 emailed saying the veil came with a tear. Can you offer her a full refund?",
    created_at: hoursAgo(0.55),
  },
  {
    id: id("msg-4"),
    session_id: id("s-1"),
    turn: 4,
    role: "assistant",
    content:
      "I'd like to issue a full $49 refund on order LL-2026-1038 for the tear. Waiting on your approval — tap the card in the sidebar when you're ready.",
    tool_name: "refund_order",
    tool_input: {
      order_number: "LL-2026-1038",
      amount_cents: 4900,
      reason:
        "Customer reports the veil arrived with a small tear near the edge — asked for a full refund rather than replacement.",
    },
    approval_id: id("a-1"),
    created_at: hoursAgo(0.5),
  },
];

// ── Daily numbers (for the briefing card) ──────────────────────

export const MOCK_BRIEFING = {
  dayLabel: "Sunday, April 12",
  newOrders: 2,
  revenueCents: 16600,
  unshippedOrders: 1,
  pendingApprovals: 3,
  newInboxMessages: 2,
  newSubscribers: 7,
};
