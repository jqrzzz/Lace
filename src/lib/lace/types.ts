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

/** One exchange in the public storefront concierge chat. */
export interface ConciergeMessage {
  role: "user" | "assistant";
  content: string;
}

/** Lightweight order row shown in a customer's order history. */
export interface CustomerOrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  item_count: number;
}

/** Inbox message attached to a customer (matched by email). */
export interface CustomerInboxRow {
  id: string;
  subject: string | null;
  message: string;
  status: InboxStatus;
  created_at: string;
}

/** Full customer graph for the admin detail page. */
export interface CustomerFull {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
  notes: string | null;
  tags: string[];
  total_orders: number;
  total_spent_cents: number;
  first_ordered_at: string | null;
  last_ordered_at: string | null;
  created_at: string;
  orders: CustomerOrderRow[];
  inbox_messages: CustomerInboxRow[];
}

export interface OrderItemRow {
  id: string;
  sku: string | null;
  name: string;
  variant_name: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

export type MissionGiftStatus = "pending" | "allocated" | "shipped" | "delivered";

export interface OrderGiftRow {
  id: string;
  quantity: number;
  status: MissionGiftStatus;
  recipient_community: string | null;
  recipient_city: string | null;
  recipient_country: string | null;
  allocated_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderShippingAddress {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

export interface OrderCustomerCard {
  id: string | null;
  email: string;
  name: string | null;
  total_orders: number;
  total_spent_cents: number;
  tags: string[];
}

/** Full order graph for the admin detail page. */
export interface OrderFull {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  carrier: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
  shipping_address: OrderShippingAddress | null;
  gift_note: string | null;
  internal_notes: string | null;
  customer: OrderCustomerCard;
  items: OrderItemRow[];
  gifts: OrderGiftRow[];
}

/** A single mission gift row shown on the mission console. */
export interface MissionGiftConsoleRow {
  id: string;
  quantity: number;
  status: MissionGiftStatus;
  created_at: string;
  allocated_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  story: string | null;
  // Source order — so mom knows whose purchase committed this gift.
  order_id: string | null;
  order_number: string | null;
  customer_email: string | null;
  // Recipient — null when status='pending'.
  recipient_id: string | null;
  recipient_community: string | null;
  recipient_city: string | null;
  recipient_country: string | null;
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
