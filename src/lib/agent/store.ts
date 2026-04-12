// ─────────────────────────────────────────────────────────────
// Lace — In-memory agent store (dev + demo).
//
// Holds approvals, agent messages, and audit entries in process
// memory while we iterate on the console. Every function here gets
// a DB-backed sibling once the lace.* tables are live; callers
// (chat, API, cron) keep their shape.
//
// Seeds from mock.ts on first access so the console boots with a
// live-feeling queue. Subsequent writes (from /admin/chat, from
// /api/agent/turn, from cron jobs) append to the same store.
//
// Note: this is process-local, so it resets on server reload and
// does not survive across serverless invocations in prod. That is
// intentional — the minute you set SUPABASE_SERVICE_ROLE_KEY, the
// sibling write-through module takes over.
// ─────────────────────────────────────────────────────────────

import type {
  AgentMessage,
  AgentSession,
  ApprovalRow,
  ApprovalRisk,
  ApprovalStatus,
} from "@/lib/lace/types";
import {
  MOCK_APPROVALS,
  MOCK_MESSAGES,
  MOCK_SESSIONS,
} from "@/lib/lace/mock";

type AuditEntry = {
  id: string;
  actor_label: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

// `globalThis` so Next.js dev hot-reload does not wipe the store.
const g = globalThis as unknown as {
  __lace_store?: {
    approvals: ApprovalRow[];
    messages: AgentMessage[];
    sessions: AgentSession[];
    audit: AuditEntry[];
  };
};

function ensure() {
  if (!g.__lace_store) {
    g.__lace_store = {
      approvals: [...MOCK_APPROVALS],
      messages: [...MOCK_MESSAGES],
      sessions: [...MOCK_SESSIONS],
      audit: [],
    };
  }
  return g.__lace_store;
}

// ── Approvals ──────────────────────────────────────────────────

export function listApprovalsStore(status?: ApprovalStatus): ApprovalRow[] {
  const s = ensure();
  return status ? s.approvals.filter((a) => a.status === status) : s.approvals;
}

export function createApproval(row: {
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
  writeAudit({
    actor_label: row.requested_by_label,
    action: "approval.created",
    entity_type: "approval",
    entity_id: approval.id,
    metadata: { action_type: row.action_type, risk: row.risk },
  });
  return approval;
}

export function decideApproval(
  id: string,
  decision: "approved" | "denied",
  reviewer_label: string,
  comment?: string
): ApprovalRow | null {
  const s = ensure();
  const idx = s.approvals.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const updated: ApprovalRow = {
    ...s.approvals[idx],
    status: decision,
    executed_at:
      decision === "approved" ? new Date().toISOString() : null,
  };
  s.approvals[idx] = updated;
  writeAudit({
    actor_label: reviewer_label,
    action: `approval.${decision}`,
    entity_type: "approval",
    entity_id: id,
    metadata: { comment },
  });
  return updated;
}

// ── Sessions + messages ────────────────────────────────────────

export function listSessionsStore(): AgentSession[] {
  return ensure().sessions;
}

export function getSession(id: string): AgentSession | undefined {
  return ensure().sessions.find((s) => s.id === id);
}

export function createSession(opts: {
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

export function listMessagesStore(sessionId: string): AgentMessage[] {
  return ensure()
    .messages.filter((m) => m.session_id === sessionId)
    .sort((a, b) => a.turn - b.turn);
}

export function appendMessage(msg: Omit<AgentMessage, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
}): AgentMessage {
  const s = ensure();
  const full: AgentMessage = {
    id: msg.id ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: msg.created_at ?? new Date().toISOString(),
    ...msg,
  };
  s.messages.push(full);
  const sess = s.sessions.find((x) => x.id === msg.session_id);
  if (sess) sess.message_count += 1;
  return full;
}

// ── Audit log ──────────────────────────────────────────────────

export function writeAudit(entry: Omit<AuditEntry, "id" | "created_at">) {
  const s = ensure();
  s.audit.push({
    id: `au-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
    ...entry,
  });
}

export function listAudit(limit = 100): AuditEntry[] {
  const s = ensure();
  return s.audit.slice(-limit).reverse();
}
