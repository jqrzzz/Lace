// ─────────────────────────────────────────────────────────────
// Lace — Query layer (DB when configured, mock data otherwise).
//
// The console, email workers, and agent tools all call through
// these functions. They're the seam between the UI and storage.
//
// Dev-mode contract: if SUPABASE_SERVICE_ROLE_KEY is missing, we
// return in-memory mock data so the console renders fully without
// any env vars. When Phase 2 applies the migrations, flipping the
// env var is the ONLY thing that needs to change — callers don't.
//
// Every function is async even when currently mocked, so we can
// add real DB calls later without touching the call sites.
// ─────────────────────────────────────────────────────────────

import { getLaceDb, isLaceDbConfigured } from "@/lib/db";
import {
  MOCK_APPROVALS,
  MOCK_BRIEFING,
  MOCK_CUSTOMERS,
  MOCK_INBOX,
  MOCK_MESSAGES,
  MOCK_ORDERS,
  MOCK_SESSIONS,
} from "./mock";
import type {
  AgentMessage,
  AgentSession,
  ApprovalRow,
  CustomerSummary,
  InboxMessage,
  MissionRecipientSummary,
  OrderSummary,
} from "./types";
import { GIFTED_COMMUNITIES } from "@/lib/gifted";
import { PRODUCTS, type Product } from "@/lib/products";

/** Is the live DB backing the queries? Useful for UI hints ("demo mode"). */
export function isLiveData(): boolean {
  return isLaceDbConfigured();
}

// ── Catalog ────────────────────────────────────────────────────

export async function listProducts(): Promise<Product[]> {
  const db = getLaceDb();
  if (!db) return PRODUCTS;
  // TODO(phase2): read from lace.products once the schema is applied.
  return PRODUCTS;
}

// ── Orders ─────────────────────────────────────────────────────

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
  // TODO(phase2): real select + row mapping.
  return MOCK_ORDERS;
}

export async function getOrder(
  orderNumber: string
): Promise<OrderSummary | null> {
  const all = await listOrders();
  return all.find((o) => o.order_number === orderNumber) ?? null;
}

// ── Customers ──────────────────────────────────────────────────

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
            (c.name ?? "").toLowerCase().includes(q)
        )
      : MOCK_CUSTOMERS;
    return rows.slice(0, opts?.limit ?? rows.length);
  }
  return MOCK_CUSTOMERS;
}

// ── Inbox ──────────────────────────────────────────────────────

export async function listInbox(
  status?: InboxMessage["status"]
): Promise<InboxMessage[]> {
  const db = getLaceDb();
  if (!db) {
    return status
      ? MOCK_INBOX.filter((m) => m.status === status)
      : MOCK_INBOX;
  }
  return MOCK_INBOX;
}

// ── Mission ────────────────────────────────────────────────────

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
  return [];
}

// ── Approvals ──────────────────────────────────────────────────

export async function listApprovals(
  status: ApprovalRow["status"] = "pending"
): Promise<ApprovalRow[]> {
  const db = getLaceDb();
  if (!db) return MOCK_APPROVALS.filter((a) => a.status === status);
  return MOCK_APPROVALS.filter((a) => a.status === status);
}

// ── Agent sessions + messages ──────────────────────────────────

export async function listSessions(): Promise<AgentSession[]> {
  const db = getLaceDb();
  if (!db) return MOCK_SESSIONS;
  return MOCK_SESSIONS;
}

export async function listMessages(
  sessionId: string
): Promise<AgentMessage[]> {
  const db = getLaceDb();
  if (!db)
    return MOCK_MESSAGES.filter((m) => m.session_id === sessionId).sort(
      (a, b) => a.turn - b.turn
    );
  return MOCK_MESSAGES.filter((m) => m.session_id === sessionId);
}

// ── Briefing (today's numbers) ─────────────────────────────────

export async function getTodayBriefing() {
  const db = getLaceDb();
  if (!db) return MOCK_BRIEFING;
  return MOCK_BRIEFING;
}

// Re-export types for convenience.
export type {
  AgentMessage,
  AgentSession,
  ApprovalRow,
  CustomerSummary,
  InboxMessage,
  MissionRecipientSummary,
  OrderSummary,
} from "./types";
