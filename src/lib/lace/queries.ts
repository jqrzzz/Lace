// ─────────────────────────────────────────────────────────────
// Lace — Query layer (DB when configured, mock data otherwise).
//
// The console, email workers, and agent tools all call through
// these functions. They're the seam between the UI and storage.
//
// Dev-mode contract: if SUPABASE_SERVICE_ROLE_KEY is missing, we
// return in-memory mock data so the console renders fully without
// any env vars. Once the lace.* migrations are applied, each function
// switches to a real select transparently.
//
// Every function is async even when currently mocked, so we can
// add real DB calls later without touching the call sites.
// ─────────────────────────────────────────────────────────────

import { getLaceDb, isLaceDbConfigured } from "@/lib/db";
import { MOCK_BRIEFING, MOCK_CUSTOMERS, MOCK_ORDERS } from "./mock";
import {
  listApprovalsStore,
  listInboxStore,
  listMessagesStore,
  listSessionsStore,
} from "@/lib/agent/store";
import type {
  AgentMessage,
  AgentSession,
  ApprovalRow,
  CustomerSummary,
  InboxMessage,
  MissionRecipientSummary,
  OrderStatus,
  OrderSummary,
} from "./types";
import { GIFTED_COMMUNITIES } from "@/lib/gifted";
import { PRODUCTS, type Product } from "@/lib/products";

/** Is the live DB backing the queries? Useful for UI hints ("demo mode"). */
export function isLiveData(): boolean {
  return isLaceDbConfigured();
}

// ── Catalog ────────────────────────────────────────────────────

// Catalog migration (lace.products as source of truth) is Phase 1.B.
// For now we keep the hardcoded PRODUCTS so storefront SSG keeps working.
export async function listProducts(): Promise<Product[]> {
  return PRODUCTS;
}

// ── Orders ─────────────────────────────────────────────────────

// Statuses we count as "shipped or earlier in the fulfilment funnel".
const FULFILLED_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

interface OrderRow {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  shipped_at: string | null;
  tracking_number: string | null;
  order_items: { id: string }[] | null;
}

function toOrderSummary(r: OrderRow): OrderSummary {
  return {
    id: r.id,
    order_number: r.order_number ?? r.id.slice(0, 8),
    customer_name: r.customer_name ?? "",
    customer_email: r.customer_email,
    status: r.status,
    total_cents: r.total_cents,
    item_count: r.order_items?.length ?? 0,
    created_at: r.created_at,
    shipped_at: r.shipped_at,
    tracking_number: r.tracking_number,
  };
}

export async function listOrders(opts?: {
  status?: OrderSummary["status"];
  limit?: number;
}): Promise<OrderSummary[]> {
  const db = getLaceDb();
  if (!db) {
    const rows = opts?.status
      ? MOCK_ORDERS.filter((o) => o.status === opts.status)
      : MOCK_ORDERS;
    return rows.slice(0, opts?.limit ?? rows.length);
  }

  let q = db
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, status, total_cents, created_at, shipped_at, tracking_number, order_items(id)",
    )
    .order("created_at", { ascending: false });
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    console.error("[queries] listOrders failed:", error);
    return [];
  }
  return ((data ?? []) as OrderRow[]).map(toOrderSummary);
}

export async function getOrder(
  orderNumber: string,
): Promise<OrderSummary | null> {
  const db = getLaceDb();
  if (!db) {
    return MOCK_ORDERS.find((o) => o.order_number === orderNumber) ?? null;
  }
  const { data, error } = await db
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, status, total_cents, created_at, shipped_at, tracking_number, order_items(id)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) {
    console.error("[queries] getOrder failed:", error);
    return null;
  }
  return data ? toOrderSummary(data as OrderRow) : null;
}

// ── Customers ──────────────────────────────────────────────────

interface CustomerRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  total_orders: number;
  total_spent_cents: number;
  last_ordered_at: string | null;
  tags: string[] | null;
}

function toCustomerSummary(r: CustomerRow): CustomerSummary {
  const name = [r.first_name, r.last_name].filter(Boolean).join(" ").trim();
  return {
    id: r.id,
    email: r.email,
    name: name || null,
    total_orders: r.total_orders,
    total_spent_cents: r.total_spent_cents,
    last_ordered_at: r.last_ordered_at,
    tags: r.tags ?? [],
  };
}

export async function listCustomers(opts?: {
  search?: string;
  limit?: number;
}): Promise<CustomerSummary[]> {
  const db = getLaceDb();
  if (!db) {
    const q = opts?.search?.toLowerCase();
    const rows = q
      ? MOCK_CUSTOMERS.filter(
          (c) =>
            c.email.toLowerCase().includes(q) ||
            (c.name ?? "").toLowerCase().includes(q),
        )
      : MOCK_CUSTOMERS;
    return rows.slice(0, opts?.limit ?? rows.length);
  }
  let q = db
    .from("customers")
    .select(
      "id, email, first_name, last_name, total_orders, total_spent_cents, last_ordered_at, tags",
    )
    .order("last_ordered_at", { ascending: false, nullsFirst: false });
  if (opts?.search) {
    const s = opts.search.replace(/[%_]/g, "\\$&");
    q = q.or(`email.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%`);
  }
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    console.error("[queries] listCustomers failed:", error);
    return [];
  }
  return ((data ?? []) as CustomerRow[]).map(toCustomerSummary);
}

// ── Inbox ──────────────────────────────────────────────────────

export async function listInbox(
  status?: InboxMessage["status"],
): Promise<InboxMessage[]> {
  // Phase 2: read contact_messages from lace.* and merge with the
  // in-process agent store. For now we stick to the store; the
  // store will be backed by lace.contact_messages in the next phase.
  const rows = listInboxStore();
  return status ? rows.filter((m) => m.status === status) : rows;
}

// ── Mission ────────────────────────────────────────────────────

interface MissionRecipientRow {
  id: string;
  community: string;
  city: string;
  country: string;
  flag_emoji: string | null;
  veils_requested: number;
  veils_gifted: number;
  active: boolean;
}

export async function listMissionRecipients(): Promise<
  MissionRecipientSummary[]
> {
  const db = getLaceDb();
  if (!db) {
    return GIFTED_COMMUNITIES.map((c) => ({
      id: c.id,
      community: c.community,
      city: c.city,
      country: c.country,
      flag_emoji: c.flag,
      veils_requested: c.veilsGifted,
      veils_gifted: c.veilsGifted,
      active: true,
    }));
  }
  const { data, error } = await db
    .from("mission_recipients")
    .select(
      "id, community, city, country, flag_emoji, veils_requested, veils_gifted, active",
    )
    .eq("active", true)
    .order("community", { ascending: true });
  if (error) {
    console.error("[queries] listMissionRecipients failed:", error);
    return [];
  }
  return ((data ?? []) as MissionRecipientRow[]).map((r) => ({
    id: r.id,
    community: r.community,
    city: r.city,
    country: r.country,
    flag_emoji: r.flag_emoji,
    veils_requested: r.veils_requested,
    veils_gifted: r.veils_gifted,
    active: r.active,
  }));
}

// ── Approvals ──────────────────────────────────────────────────

export async function listApprovals(
  status: ApprovalRow["status"] = "pending",
): Promise<ApprovalRow[]> {
  return listApprovalsStore(status);
}

// ── Agent sessions + messages ──────────────────────────────────

export async function listSessions(): Promise<AgentSession[]> {
  return listSessionsStore();
}

export async function listMessages(
  sessionId: string,
): Promise<AgentMessage[]> {
  return listMessagesStore(sessionId);
}

// ── Briefing (today's numbers) ─────────────────────────────────

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function dayLabel(d: Date): string {
  return `${DAY_LABELS[d.getDay()]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}

export async function getTodayBriefing() {
  const db = getLaceDb();
  if (!db) return MOCK_BRIEFING;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();

  const [
    todaysOrders,
    todaysRevenue,
    unshipped,
    pendingApprovals,
    newInbox,
    newSubs,
  ] = await Promise.all([
    db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday),
    db
      .from("orders")
      .select("total_cents")
      .gte("created_at", startOfToday)
      .in("status", FULFILLED_STATUSES),
    db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing"]),
    db
      .from("agent_approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    db
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    db
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfToday)
      .eq("status", "active"),
  ]);

  const revenueCents = (todaysRevenue.data ?? []).reduce(
    (s, r) => s + ((r as { total_cents?: number }).total_cents ?? 0),
    0,
  );

  return {
    dayLabel: dayLabel(now),
    newOrders: todaysOrders.count ?? 0,
    revenueCents,
    unshippedOrders: unshipped.count ?? 0,
    pendingApprovals: pendingApprovals.count ?? 0,
    newInboxMessages: newInbox.count ?? 0,
    newSubscribers: newSubs.count ?? 0,
    // Real sparkline trends come with a daily-rollup view in a later phase.
    // Empty arrays render nothing (Sparkline returns null on values < 2).
    trends: {
      newOrders: [] as number[],
      pendingApprovals: [] as number[],
      newInboxMessages: [] as number[],
      unshippedOrders: [] as number[],
    },
  };
}
