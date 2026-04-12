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
  InboxMessage,
} from "@/lib/lace/types";
import {
  MOCK_APPROVALS,
  MOCK_INBOX,
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

// Module-level singleton state, pinned to `globalThis` so Next.js dev
// hot-reload doesn't clear the store on every file edit. The cast is
// contained in this one accessor; everything else uses `ensure()`.
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

/**
 * Seed a few audit rows that match the pre-seeded approvals, so the
 * audit log has something to show on a fresh boot. In real life this
 * happens organically as createApproval() writes rows on every turn.
 */
function seedAudit(): AuditEntry[] {
  const now = Date.now();
  return MOCK_APPROVALS.map((a, i) => ({
    id: `au-seed-${i}`,
    actor_label: a.requested_by_label,
    action: "approval.created",
    entity_type: "approval",
    entity_id: a.id,
    metadata: { action_type: a.action_type, risk: a.risk },
    created_at: new Date(now - (MOCK_APPROVALS.length - i) * 60_000).toISOString(),
  }));
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

export type { AuditEntry };

// ── Inbox ──────────────────────────────────────────────────────

export function listInboxStore(): InboxMessage[] {
  return ensure().inbox;
}

export function updateInboxMessage(
  id: string,
  patch: Partial<InboxMessage>
): InboxMessage | null {
  const s = ensure();
  const idx = s.inbox.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  const updated = { ...s.inbox[idx], ...patch };
  s.inbox[idx] = updated;
  return updated;
}

// ── Approval execution (demo-mode simulator) ───────────────────
//
// When an approval is approved, `executeApproval` applies the most
// plausible side effect we can fake without real infrastructure:
//
//   - draft_inbox_reply  → flip the inbox row to "drafted" + save
//                          the reply_draft so the Inbox UI updates.
//   - refund_order, send_broadcast, mark_gift_delivered, etc. →
//     append a "system" turn to the originating session transcript
//     so the chat reflects the executed action.
//
// Everything also writes an audit entry. Returns short,
// human-readable strings describing the effects so the UI can
// surface them as toast details.

export interface ExecutionResult {
  effects: string[];
}

export function executeApproval(
  approval: ApprovalRow,
  reviewerLabel: string
): ExecutionResult {
  const effects: string[] = [];
  const payload = approval.action_payload;

  const appendToSession = (content: string) => {
    if (!approval.session_id) return;
    const turn =
      (listMessagesStore(approval.session_id).at(-1)?.turn ?? 0) + 1;
    appendMessage({
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
      const updated = updateInboxMessage(messageId, {
        status: "drafted",
        reply_draft: reply,
      });
      if (updated) {
        effects.push(`Draft saved to ${updated.name}'s message.`);
      } else {
        effects.push("Draft noted (message not found in demo data).");
      }
      appendToSession(
        `Draft reply saved to the inbox for review${
          updated ? ` (${updated.name})` : ""
        }.`
      );
      break;
    }
    case "refund_order": {
      const amount = payload.amount_cents
        ? `$${(Number(payload.amount_cents) / 100).toFixed(2)}`
        : "full amount";
      const orderNumber = payload.order_number ?? "—";
      effects.push(`Refunded ${amount} on ${orderNumber}.`);
      appendToSession(
        `Refund of ${amount} issued on order ${orderNumber} (demo).`
      );
      break;
    }
    case "send_broadcast": {
      const audience = payload.audience ?? "audience";
      effects.push(`Broadcast queued to ${audience}.`);
      appendToSession(
        `Broadcast "${payload.subject ?? "(no subject)"}" scheduled for ${audience} (demo).`
      );
      break;
    }
    case "mark_gift_delivered": {
      effects.push("Gift marked delivered.");
      appendToSession(`Gift ${payload.gift_id ?? ""} marked delivered (demo).`);
      break;
    }
    case "tag_customer": {
      effects.push(`Tagged customer with "${payload.tag ?? ""}".`);
      appendToSession(
        `Added tag "${payload.tag ?? ""}" to customer ${payload.customer_id ?? ""} (demo).`
      );
      break;
    }
    case "update_product_price": {
      const price = payload.price_cents
        ? `$${(Number(payload.price_cents) / 100).toFixed(2)}`
        : "";
      effects.push(`Price updated on ${payload.slug ?? ""} to ${price}.`);
      appendToSession(
        `Changed ${payload.slug ?? ""} price to ${price} (demo).`
      );
      break;
    }
    case "archive_product": {
      effects.push(`Archived product ${payload.slug ?? ""}.`);
      appendToSession(`Archived ${payload.slug ?? ""} (demo).`);
      break;
    }
    case "unsubscribe_customer": {
      effects.push(`Unsubscribed ${payload.email ?? ""}.`);
      appendToSession(
        `Unsubscribed ${payload.email ?? ""} from the newsletter (demo).`
      );
      break;
    }
    case "draft_journal_post": {
      effects.push(`Journal draft "${payload.title ?? ""}" saved.`);
      appendToSession(
        `Journal post draft "${payload.title ?? ""}" saved (demo).`
      );
      break;
    }
    default: {
      effects.push("Action recorded.");
      appendToSession(`${approval.action_type} executed (demo).`);
    }
  }

  writeAudit({
    actor_label: reviewerLabel,
    action: "approval.executed",
    entity_type: "approval",
    entity_id: approval.id,
    metadata: {
      action_type: approval.action_type,
      effects,
    },
  });

  return { effects };
}
