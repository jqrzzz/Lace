// ─────────────────────────────────────────────────────────────
// Lace — Agent state store.
//
// Two co-located backends behind one async public API:
//
//   In-memory (fallback)
//     - Holds approvals, agent messages, sessions, inbox, audit.
//     - Process-local. Resets on server reload. Used when
//       SUPABASE_SERVICE_ROLE_KEY is missing so the console boots
//       with live-feeling mock data.
//
//   lace.* DB (Phase 2.A)
//     - Writes through to lace.agent_sessions / agent_messages /
//       agent_approvals / audit_log. Survives reloads and serves
//       the multi-instance prod deploy.
//
// The contact form route writes inbox messages directly to
// lace.contact_messages (Phase 1); this module's listInbox /
// updateInboxMessage read and mutate the same table.
// ─────────────────────────────────────────────────────────────

import type {
  AgentMessage,
  AgentSession,
  ApprovalRow,
  ApprovalRisk,
  ApprovalStatus,
  InboxMessage,
} from "@/lib/lace/types";
import {
  MOCK_APPROVALS,
  MOCK_INBOX,
  MOCK_MESSAGES,
  MOCK_SESSIONS,
} from "@/lib/lace/mock";
import { getLaceDb, type LaceServiceClient } from "@/lib/db";

export type ActorType =
  | "user"
  | "agent"
  | "system"
  | "customer"
  | "webhook";

export type AuditEntry = {
  id: string;
  actor_label: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────
// In-memory state (fallback)
// ─────────────────────────────────────────────────────────────

interface LaceStore {
  approvals: ApprovalRow[];
  messages: AgentMessage[];
  sessions: AgentSession[];
  inbox: InboxMessage[];
  audit: AuditEntry[];
}

const STORE_KEY = "__lace_store" as const;
type GlobalWithStore = typeof globalThis & { [STORE_KEY]?: LaceStore };

function ensure(): LaceStore {
  const g = globalThis as GlobalWithStore;
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = {
      approvals: [...MOCK_APPROVALS],
      messages: [...MOCK_MESSAGES],
      sessions: [...MOCK_SESSIONS],
      inbox: [...MOCK_INBOX],
      audit: seedAudit(),
    };
  }
  return g[STORE_KEY]!;
}

function seedAudit(): AuditEntry[] {
  const now = Date.now();
  return MOCK_APPROVALS.map((a, i) => ({
    id: `au-seed-${i}`,
    actor_label: a.requested_by_label,
    action: "approval.created",
    entity_type: "approval",
    entity_id: a.id,
    metadata: { action_type: a.action_type, risk: a.risk },
    created_at: new Date(
      now - (MOCK_APPROVALS.length - i) * 60_000,
    ).toISOString(),
  }));
}

// ─────────────────────────────────────────────────────────────
// In-memory implementations
// ─────────────────────────────────────────────────────────────

function listApprovalsMemory(status?: ApprovalStatus): ApprovalRow[] {
  const s = ensure();
  return status ? s.approvals.filter((a) => a.status === status) : s.approvals;
}

function createApprovalMemory(row: {
  session_id: string | null;
  action_type: string;
  action_payload: Record<string, unknown>;
  human_summary: string;
  risk: ApprovalRisk;
  requested_by_label: string;
}): ApprovalRow {
  const s = ensure();
  const now = new Date();
  const approval: ApprovalRow = {
    id: `a-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    status: "pending",
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 24 * 3600_000).toISOString(),
    ...row,
  };
  s.approvals.unshift(approval);
  return approval;
}

function decideApprovalMemory(
  id: string,
  decision: "approved" | "denied",
): ApprovalRow | null {
  const s = ensure();
  const idx = s.approvals.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const updated: ApprovalRow = {
    ...s.approvals[idx],
    status: decision,
    executed_at: decision === "approved" ? new Date().toISOString() : null,
  };
  s.approvals[idx] = updated;
  return updated;
}

function listSessionsMemory(): AgentSession[] {
  return ensure().sessions;
}

function getSessionMemory(id: string): AgentSession | undefined {
  return ensure().sessions.find((s) => s.id === id);
}

function createSessionMemory(opts: {
  title: string;
  actor_label: string;
  channel?: AgentSession["channel"];
}): AgentSession {
  const s = ensure();
  const now = new Date().toISOString();
  const session: AgentSession = {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: opts.title,
    actor_label: opts.actor_label,
    channel: opts.channel ?? "console",
    started_at: now,
    ended_at: null,
    message_count: 0,
    approvals_pending: 0,
  };
  s.sessions.unshift(session);
  return session;
}

function listMessagesMemory(sessionId: string): AgentMessage[] {
  return ensure()
    .messages.filter((m) => m.session_id === sessionId)
    .sort((a, b) => a.turn - b.turn);
}

function appendMessageMemory(
  msg: Omit<AgentMessage, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
): AgentMessage {
  const s = ensure();
  const full: AgentMessage = {
    id:
      msg.id ??
      `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: msg.created_at ?? new Date().toISOString(),
    ...msg,
  };
  s.messages.push(full);
  const sess = s.sessions.find((x) => x.id === msg.session_id);
  if (sess) sess.message_count += 1;
  return full;
}

function writeAuditMemory(entry: Omit<AuditEntry, "id" | "created_at">) {
  const s = ensure();
  s.audit.push({
    id: `au-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
    ...entry,
  });
}

function listAuditMemory(limit: number): AuditEntry[] {
  const s = ensure();
  return s.audit.slice(-limit).reverse();
}

// ─────────────────────────────────────────────────────────────
// DB-backed implementations
// ─────────────────────────────────────────────────────────────

interface ApprovalDbRow {
  id: string;
  session_id: string | null;
  action_type: string;
  action_payload: Record<string, unknown> | null;
  human_summary: string;
  risk: string;
  status: string;
  requested_by_label: string | null;
  created_at: string;
  expires_at: string;
  executed_at: string | null;
}

const APPROVAL_COLS =
  "id, session_id, action_type, action_payload, human_summary, risk, status, requested_by_label, created_at, expires_at, executed_at";

function toApprovalRow(r: ApprovalDbRow): ApprovalRow {
  return {
    id: r.id,
    session_id: r.session_id,
    action_type: r.action_type,
    action_payload: r.action_payload ?? {},
    human_summary: r.human_summary,
    risk: r.risk as ApprovalRisk,
    status: r.status as ApprovalStatus,
    requested_by_label: r.requested_by_label ?? "Agent",
    created_at: r.created_at,
    expires_at: r.expires_at,
    executed_at: r.executed_at,
  };
}

async function listApprovalsDb(
  db: LaceServiceClient,
  status?: ApprovalStatus,
): Promise<ApprovalRow[]> {
  let q = db
    .from("agent_approvals")
    .select(APPROVAL_COLS)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) {
    console.error("[agent/store] listApprovals DB failed:", error);
    return [];
  }
  return ((data ?? []) as ApprovalDbRow[]).map(toApprovalRow);
}

async function createApprovalDb(
  db: LaceServiceClient,
  row: {
    session_id: string | null;
    action_type: string;
    action_payload: Record<string, unknown>;
    human_summary: string;
    risk: ApprovalRisk;
    requested_by_label: string;
  },
): Promise<ApprovalRow> {
  const { data, error } = await db
    .from("agent_approvals")
    .insert({
      session_id: row.session_id,
      action_type: row.action_type,
      action_payload: row.action_payload,
      human_summary: row.human_summary,
      risk: row.risk,
      requested_by_label: row.requested_by_label,
      status: "pending",
    })
    .select(APPROVAL_COLS)
    .single();
  if (error || !data) {
    console.error("[agent/store] createApproval DB failed:", error);
    throw error ?? new Error("createApproval returned no row");
  }
  return toApprovalRow(data as ApprovalDbRow);
}

async function decideApprovalDb(
  db: LaceServiceClient,
  id: string,
  decision: "approved" | "denied",
  reviewerLabel: string,
  comment?: string,
): Promise<ApprovalRow | null> {
  const { data, error } = await db
    .from("agent_approvals")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      review_comment: comment ?? null,
      executed_at: decision === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select(APPROVAL_COLS)
    .maybeSingle();
  if (error) {
    console.error("[agent/store] decideApproval DB failed:", error);
    return null;
  }
  if (!data) return null;
  // reviewer label moves into the audit row that decideApproval's
  // public dispatcher writes below; the column on the table is uuid.
  void reviewerLabel;
  return toApprovalRow(data as ApprovalDbRow);
}

interface SessionDbRow {
  id: string;
  title: string | null;
  actor_label: string | null;
  channel: string;
  started_at: string;
  ended_at: string | null;
  approvals_pending: number;
  agent_messages: { id: string }[] | null;
}

const SESSION_COLS =
  "id, title, actor_label, channel, started_at, ended_at, approvals_pending, agent_messages(id)";

function toAgentSession(r: SessionDbRow): AgentSession {
  return {
    id: r.id,
    title: r.title ?? "Untitled session",
    actor_label: r.actor_label ?? "",
    channel: r.channel as AgentSession["channel"],
    started_at: r.started_at,
    ended_at: r.ended_at,
    message_count: r.agent_messages?.length ?? 0,
    approvals_pending: r.approvals_pending,
  };
}

async function listSessionsDb(db: LaceServiceClient): Promise<AgentSession[]> {
  const { data, error } = await db
    .from("agent_sessions")
    .select(SESSION_COLS)
    .order("started_at", { ascending: false });
  if (error) {
    console.error("[agent/store] listSessions DB failed:", error);
    return [];
  }
  return ((data ?? []) as SessionDbRow[]).map(toAgentSession);
}

async function createSessionDb(
  db: LaceServiceClient,
  opts: {
    title: string;
    actor_label: string;
    channel?: AgentSession["channel"];
  },
): Promise<AgentSession> {
  const { data, error } = await db
    .from("agent_sessions")
    .insert({
      title: opts.title,
      actor_label: opts.actor_label,
      channel: opts.channel ?? "console",
    })
    .select(SESSION_COLS)
    .single();
  if (error || !data) {
    console.error("[agent/store] createSession DB failed:", error);
    throw error ?? new Error("createSession returned no row");
  }
  return toAgentSession(data as SessionDbRow);
}

interface MessageDbRow {
  id: string;
  session_id: string;
  turn: number;
  role: string;
  content: string | null;
  tool_name: string | null;
  tool_input: Record<string, unknown> | null;
  tool_output: Record<string, unknown> | null;
  approval_id: string | null;
  created_at: string;
}

const MESSAGE_COLS =
  "id, session_id, turn, role, content, tool_name, tool_input, tool_output, approval_id, created_at";

function toAgentMessage(r: MessageDbRow): AgentMessage {
  return {
    id: r.id,
    session_id: r.session_id,
    turn: r.turn,
    role: r.role as AgentMessage["role"],
    content: r.content,
    tool_name: r.tool_name,
    tool_input: r.tool_input,
    tool_output: r.tool_output,
    approval_id: r.approval_id,
    created_at: r.created_at,
  };
}

async function listMessagesDb(
  db: LaceServiceClient,
  sessionId: string,
): Promise<AgentMessage[]> {
  const { data, error } = await db
    .from("agent_messages")
    .select(MESSAGE_COLS)
    .eq("session_id", sessionId)
    .order("turn", { ascending: true });
  if (error) {
    console.error("[agent/store] listMessages DB failed:", error);
    return [];
  }
  return ((data ?? []) as MessageDbRow[]).map(toAgentMessage);
}

async function appendMessageDb(
  db: LaceServiceClient,
  msg: Omit<AgentMessage, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
): Promise<AgentMessage> {
  const { data, error } = await db
    .from("agent_messages")
    .insert({
      session_id: msg.session_id,
      turn: msg.turn,
      role: msg.role,
      content: msg.content,
      tool_name: msg.tool_name,
      tool_input: msg.tool_input,
      tool_output: msg.tool_output,
      approval_id: msg.approval_id,
    })
    .select(MESSAGE_COLS)
    .single();
  if (error || !data) {
    console.error("[agent/store] appendMessage DB failed:", error);
    throw error ?? new Error("appendMessage returned no row");
  }
  return toAgentMessage(data as MessageDbRow);
}

async function writeAuditDb(
  db: LaceServiceClient,
  entry: Omit<AuditEntry, "id" | "created_at"> & { actor_type?: ActorType },
): Promise<void> {
  const { error } = await db.from("audit_log").insert({
    actor_type: entry.actor_type ?? "agent",
    actor_label: entry.actor_label,
    action: entry.action,
    entity_type: entry.entity_type ?? null,
    entity_id: entry.entity_id ?? null,
    metadata: entry.metadata,
  });
  if (error) {
    console.error("[agent/store] writeAudit DB failed:", error);
  }
}

interface ContactMessageDbRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  reply_draft: string | null;
  created_at: string;
}

const CONTACT_COLS =
  "id, name, email, subject, message, status, reply_draft, created_at";

function toInboxMessage(r: ContactMessageDbRow): InboxMessage {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    message: r.message,
    status: r.status as InboxMessage["status"],
    reply_draft: r.reply_draft,
    created_at: r.created_at,
  };
}

async function listInboxDb(
  db: LaceServiceClient,
): Promise<InboxMessage[]> {
  const { data, error } = await db
    .from("contact_messages")
    .select(CONTACT_COLS)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[agent/store] listInbox DB failed:", error);
    return [];
  }
  return ((data ?? []) as ContactMessageDbRow[]).map(toInboxMessage);
}

async function updateInboxMessageDb(
  db: LaceServiceClient,
  id: string,
  patch: Partial<InboxMessage>,
): Promise<InboxMessage | null> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.reply_draft !== undefined) dbPatch.reply_draft = patch.reply_draft;
  if (patch.subject !== undefined) dbPatch.subject = patch.subject;
  if (patch.message !== undefined) dbPatch.message = patch.message;
  if (Object.keys(dbPatch).length === 0) {
    const { data } = await db
      .from("contact_messages")
      .select(CONTACT_COLS)
      .eq("id", id)
      .maybeSingle();
    return data ? toInboxMessage(data as ContactMessageDbRow) : null;
  }
  const { data, error } = await db
    .from("contact_messages")
    .update(dbPatch)
    .eq("id", id)
    .select(CONTACT_COLS)
    .maybeSingle();
  if (error) {
    console.error("[agent/store] updateInboxMessage DB failed:", error);
    return null;
  }
  return data ? toInboxMessage(data as ContactMessageDbRow) : null;
}

interface AuditDbRow {
  id: string;
  actor_label: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

async function listAuditDb(
  db: LaceServiceClient,
  limit: number,
): Promise<AuditEntry[]> {
  const { data, error } = await db
    .from("audit_log")
    .select(
      "id, actor_label, action, entity_type, entity_id, metadata, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[agent/store] listAudit DB failed:", error);
    return [];
  }
  return ((data ?? []) as AuditDbRow[]).map((r) => ({
    id: r.id,
    actor_label: r.actor_label ?? "—",
    action: r.action,
    entity_type: r.entity_type ?? undefined,
    entity_id: r.entity_id ?? undefined,
    metadata: r.metadata ?? {},
    created_at: r.created_at,
  }));
}

// ─────────────────────────────────────────────────────────────
// Public async API (DB when configured, in-memory otherwise)
// ─────────────────────────────────────────────────────────────

export async function listApprovalsStore(
  status?: ApprovalStatus,
): Promise<ApprovalRow[]> {
  const db = getLaceDb();
  return db ? listApprovalsDb(db, status) : listApprovalsMemory(status);
}

export async function createApproval(row: {
  session_id: string | null;
  action_type: string;
  action_payload: Record<string, unknown>;
  human_summary: string;
  risk: ApprovalRisk;
  requested_by_label: string;
}): Promise<ApprovalRow> {
  const db = getLaceDb();
  const approval = db
    ? await createApprovalDb(db, row)
    : createApprovalMemory(row);
  await writeAudit({
    actor_type: "agent",
    actor_label: row.requested_by_label,
    action: "approval.created",
    entity_type: "approval",
    entity_id: approval.id,
    metadata: { action_type: row.action_type, risk: row.risk },
  });
  return approval;
}

export async function decideApproval(
  id: string,
  decision: "approved" | "denied",
  reviewerLabel: string,
  comment?: string,
): Promise<ApprovalRow | null> {
  const db = getLaceDb();
  const updated = db
    ? await decideApprovalDb(db, id, decision, reviewerLabel, comment)
    : decideApprovalMemory(id, decision);
  if (!updated) return null;
  await writeAudit({
    actor_type: "user",
    actor_label: reviewerLabel,
    action: `approval.${decision}`,
    entity_type: "approval",
    entity_id: id,
    metadata: { comment },
  });
  return updated;
}

export async function listSessionsStore(): Promise<AgentSession[]> {
  const db = getLaceDb();
  return db ? listSessionsDb(db) : listSessionsMemory();
}

export async function getSession(
  id: string,
): Promise<AgentSession | undefined> {
  const db = getLaceDb();
  if (!db) return getSessionMemory(id);
  const { data, error } = await db
    .from("agent_sessions")
    .select(SESSION_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[agent/store] getSession DB failed:", error);
    return undefined;
  }
  return data ? toAgentSession(data as SessionDbRow) : undefined;
}

export async function createSession(opts: {
  title: string;
  actor_label: string;
  channel?: AgentSession["channel"];
}): Promise<AgentSession> {
  const db = getLaceDb();
  return db ? createSessionDb(db, opts) : createSessionMemory(opts);
}

export async function listMessagesStore(
  sessionId: string,
): Promise<AgentMessage[]> {
  const db = getLaceDb();
  return db ? listMessagesDb(db, sessionId) : listMessagesMemory(sessionId);
}

export async function appendMessage(
  msg: Omit<AgentMessage, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  },
): Promise<AgentMessage> {
  const db = getLaceDb();
  return db ? appendMessageDb(db, msg) : appendMessageMemory(msg);
}

export async function writeAudit(
  entry: Omit<AuditEntry, "id" | "created_at"> & { actor_type?: ActorType },
): Promise<void> {
  const db = getLaceDb();
  if (db) {
    await writeAuditDb(db, entry);
    return;
  }
  writeAuditMemory(entry);
}

export async function listAudit(limit = 100): Promise<AuditEntry[]> {
  const db = getLaceDb();
  return db ? listAuditDb(db, limit) : listAuditMemory(limit);
}

// ── Inbox (lace.contact_messages when DB configured, mock otherwise) ──

function listInboxMemory(): InboxMessage[] {
  return ensure().inbox;
}

function updateInboxMessageMemory(
  id: string,
  patch: Partial<InboxMessage>,
): InboxMessage | null {
  const s = ensure();
  const idx = s.inbox.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  const updated = { ...s.inbox[idx], ...patch };
  s.inbox[idx] = updated;
  return updated;
}

export async function listInboxStore(): Promise<InboxMessage[]> {
  const db = getLaceDb();
  return db ? listInboxDb(db) : listInboxMemory();
}

export async function updateInboxMessage(
  id: string,
  patch: Partial<InboxMessage>,
): Promise<InboxMessage | null> {
  const db = getLaceDb();
  return db ? updateInboxMessageDb(db, id, patch) : updateInboxMessageMemory(id, patch);
}

// ─────────────────────────────────────────────────────────────
// Approval execution (demo simulator)
//
// Phase 2.A only persists agent state; the side effects of an
// "approved" action — Stripe refund, broadcast send, customer tag
// — are still simulated. Phase 2.C wires them up for real.
//
// The simulator's session-transcript append now lands in DB
// because appendMessage is dispatched. The inbox update stays
// in-memory until Phase 2.B.
// ─────────────────────────────────────────────────────────────

export interface ExecutionResult {
  effects: string[];
}

export async function executeApproval(
  approval: ApprovalRow,
  reviewerLabel: string,
): Promise<ExecutionResult> {
  const effects: string[] = [];
  const payload = approval.action_payload;

  const appendToSession = async (content: string) => {
    if (!approval.session_id) return;
    const prior = await listMessagesStore(approval.session_id);
    const turn = (prior.at(-1)?.turn ?? 0) + 1;
    await appendMessage({
      session_id: approval.session_id,
      turn,
      role: "system",
      content,
      tool_name: approval.action_type,
      tool_input: payload,
      tool_output: null,
      approval_id: approval.id,
    });
  };

  switch (approval.action_type) {
    case "draft_inbox_reply": {
      const messageId = String(payload.message_id ?? "");
      const reply = String(payload.reply ?? "");
      const updated = await updateInboxMessage(messageId, {
        status: "drafted",
        reply_draft: reply,
      });
      if (updated) {
        effects.push(`Draft saved to ${updated.name}'s message.`);
      } else {
        effects.push("Draft noted (message not found in demo data).");
      }
      await appendToSession(
        `Draft reply saved to the inbox for review${
          updated ? ` (${updated.name})` : ""
        }.`,
      );
      break;
    }
    case "refund_order": {
      const amount = payload.amount_cents
        ? `$${(Number(payload.amount_cents) / 100).toFixed(2)}`
        : "full amount";
      const orderNumber = payload.order_number ?? "—";
      effects.push(`Refunded ${amount} on ${orderNumber}.`);
      await appendToSession(
        `Refund of ${amount} issued on order ${orderNumber} (demo).`,
      );
      break;
    }
    case "send_broadcast": {
      const audience = payload.audience ?? "audience";
      effects.push(`Broadcast queued to ${audience}.`);
      await appendToSession(
        `Broadcast "${payload.subject ?? "(no subject)"}" scheduled for ${audience} (demo).`,
      );
      break;
    }
    case "mark_gift_delivered": {
      effects.push("Gift marked delivered.");
      await appendToSession(
        `Gift ${payload.gift_id ?? ""} marked delivered (demo).`,
      );
      break;
    }
    case "tag_customer": {
      effects.push(`Tagged customer with "${payload.tag ?? ""}".`);
      await appendToSession(
        `Added tag "${payload.tag ?? ""}" to customer ${payload.customer_id ?? ""} (demo).`,
      );
      break;
    }
    case "update_product_price": {
      const price = payload.price_cents
        ? `$${(Number(payload.price_cents) / 100).toFixed(2)}`
        : "";
      effects.push(`Price updated on ${payload.slug ?? ""} to ${price}.`);
      await appendToSession(
        `Changed ${payload.slug ?? ""} price to ${price} (demo).`,
      );
      break;
    }
    case "archive_product": {
      effects.push(`Archived product ${payload.slug ?? ""}.`);
      await appendToSession(`Archived ${payload.slug ?? ""} (demo).`);
      break;
    }
    case "unsubscribe_customer": {
      effects.push(`Unsubscribed ${payload.email ?? ""}.`);
      await appendToSession(
        `Unsubscribed ${payload.email ?? ""} from the newsletter (demo).`,
      );
      break;
    }
    case "draft_journal_post": {
      effects.push(`Journal draft "${payload.title ?? ""}" saved.`);
      await appendToSession(
        `Journal post draft "${payload.title ?? ""}" saved (demo).`,
      );
      break;
    }
    default: {
      effects.push("Action recorded.");
      await appendToSession(`${approval.action_type} executed (demo).`);
    }
  }

  await writeAudit({
    actor_type: "user",
    actor_label: reviewerLabel,
    action: "approval.executed",
    entity_type: "approval",
    entity_id: approval.id,
    metadata: { action_type: approval.action_type, effects },
  });

  return { effects };
}
