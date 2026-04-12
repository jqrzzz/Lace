// ─────────────────────────────────────────────────────────────
// Lace — Domain types used by the console.
//
// Written by hand (not generated) so we can iterate on the UI
// before the Supabase schema lands. When we generate real types
// from the DB later, these become the reference shapes.
// ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "denied"
  | "expired"
  | "cancelled";

export type ApprovalRisk = "low" | "normal" | "money" | "destructive";

export type InboxStatus = "new" | "drafted" | "replied" | "archived";

export type AgentRole = "system" | "user" | "assistant" | "tool";

export interface OrderSummary {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  total_cents: number;
  item_count: number;
  created_at: string; // ISO
  shipped_at?: string | null;
  tracking_number?: string | null;
}

export interface CustomerSummary {
  id: string;
  email: string;
  name: string | null;
  total_orders: number;
  total_spent_cents: number;
  last_ordered_at: string | null;
  tags: string[];
}

export interface InboxMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: InboxStatus;
  reply_draft: string | null;
  created_at: string;
}

export interface ApprovalRow {
  id: string;
  session_id: string | null;
  action_type: string; // tool name
  action_payload: Record<string, unknown>;
  human_summary: string;
  risk: ApprovalRisk;
  status: ApprovalStatus;
  requested_by_label: string; // "Agent", "Maria (staff)", etc.
  created_at: string;
  expires_at: string;
  executed_at?: string | null;
}

export interface AgentMessage {
  id: string;
  session_id: string;
  turn: number;
  role: AgentRole;
  content: string | null;
  tool_name?: string | null;
  tool_input?: Record<string, unknown> | null;
  tool_output?: Record<string, unknown> | null;
  approval_id?: string | null;
  created_at: string;
}

export interface AgentSession {
  id: string;
  title: string;
  actor_label: string;
  channel: "console" | "whatsapp" | "web" | "email";
  started_at: string;
  ended_at: string | null;
  message_count: number;
  approvals_pending: number;
}

export interface MissionRecipientSummary {
  id: string;
  community: string;
  city: string;
  country: string;
  flag_emoji: string | null;
  veils_requested: number;
  veils_gifted: number;
  active: boolean;
}
