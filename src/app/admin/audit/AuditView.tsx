"use client";

import { useMemo, useState } from "react";
import { ScrollText, User, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditRow {
  id: string;
  actor_label: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  relative: string;
}

const ACTION_STYLE: Record<string, string> = {
  "approval.created": "bg-gold/10 text-gold-dark",
  "approval.approved": "bg-green-50 text-green-700",
  "approval.denied": "bg-red-50 text-red-700",
  "approval.executed": "bg-burgundy/10 text-burgundy",
  "playbook.started": "bg-blush/30 text-charcoal",
};

export default function AuditView({ rows }: { rows: AuditRow[] }) {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const actions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.action))).sort(),
    [rows]
  );
  const actors = useMemo(
    () => Array.from(new Set(rows.map((r) => r.actor_label))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (actionFilter !== "all" && r.action !== actionFilter) return false;
      if (actorFilter !== "all" && r.actor_label !== actorFilter) return false;
      if (!q) return true;
      const hay =
        `${r.action} ${r.actor_label} ${r.entity_id} ${JSON.stringify(
          r.metadata
        )}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, actionFilter, actorFilter, query]);

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border-light p-16 text-center">
        <ScrollText className="w-10 h-10 text-soft-gray mx-auto mb-3" />
        <h3 className="font-heading text-xl text-charcoal mb-1">
          Nothing audited yet
        </h3>
        <p className="text-sm text-warm-gray max-w-sm mx-auto">
          As soon as the agent proposes an action or you approve one, a trail
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actors, actions, metadata…"
            className="w-full px-3 py-2 pl-9 text-sm bg-white border border-border-light rounded-xl focus:outline-none focus:border-gold"
          />
          <Filter className="w-3.5 h-3.5 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-border-light rounded-xl focus:outline-none focus:border-gold text-charcoal"
        >
          <option value="all">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-border-light rounded-xl focus:outline-none focus:border-gold text-charcoal"
        >
          <option value="all">All actors</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-warm-gray">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-warm-gray py-12 text-center">
            Nothing matches those filters.
          </p>
        ) : (
          <ul className="divide-y divide-border-light">
            {filtered.map((row) => {
              const tone = ACTION_STYLE[row.action] ?? "bg-cream text-warm-gray";
              return (
                <li key={row.id} className="px-5 py-3 flex items-start gap-4">
                  <span
                    className={cn(
                      "inline-flex items-center text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full font-medium whitespace-nowrap mt-0.5",
                      tone,
                    )}
                  >
                    {actionLabel(row.action)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal break-words">
                      {humanizeRow(row)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-warm-gray">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span>{row.actor_label}</span>
                    </div>
                  </div>
                  <span className="text-xs text-warm-gray whitespace-nowrap mt-0.5">
                    {row.relative}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// Short label for the action chip. Keeps the structure readable
// without the dot-separated machine name dominating the row.
function actionLabel(action: string): string {
  switch (action) {
    case "approval.created":
      return "Proposed";
    case "approval.approved":
      return "Approved";
    case "approval.denied":
      return "Denied";
    case "approval.executed":
      return "Executed";
    case "order.created":
      return "Order";
    case "order.mark_shipped":
      return "Shipped";
    case "order.add_tracking":
      return "Tracking";
    case "order.refund":
    case "order.refund_requested":
      return "Refund";
    case "mission_gift.assign":
      return "Allocated";
    case "mission_gift.deliver":
      return "Delivered";
    case "customer.tag":
      return "Tag";
    case "inbox.draft_saved":
      return "Drafted";
    case "inbox.replied":
      return "Replied";
    case "inbox.archived":
      return "Archived";
    case "playbook.started":
      return "Playbook";
    case "settings.update":
      return "Settings";
    default:
      return action;
  }
}

// Convert (action + metadata) into a single mom-readable sentence.
// Falls back to a kv summary when there's no specific template.
function humanizeRow(row: AuditRow): string {
  const m = row.metadata ?? {};
  const get = (k: string) => (m as Record<string, unknown>)[k];
  const str = (k: string) => {
    const v = get(k);
    return typeof v === "string" ? v : null;
  };
  const num = (k: string) => {
    const v = get(k);
    return typeof v === "number" ? v : null;
  };
  const dollars = (cents: number | null) =>
    cents == null ? "" : `$${(cents / 100).toFixed(2)}`;
  const orderNo = str("order_number") ?? row.entity_id?.slice(0, 8);
  const simulated = get("simulated") === true ? " (simulated)" : "";

  switch (row.action) {
    case "order.created":
      return `Order ${orderNo} created${dollars(num("total_cents")) ? ` · ${dollars(num("total_cents"))}` : ""}.`;
    case "order.mark_shipped": {
      const tracking = str("tracking_number");
      const carrier = str("carrier");
      const tail = tracking
        ? ` with ${carrier ? `${carrier} ` : ""}tracking ${tracking}`
        : "";
      return `Marked ${orderNo} shipped${tail}.`;
    }
    case "order.add_tracking": {
      const tracking = str("tracking_number");
      const carrier = str("carrier");
      return `Added ${carrier ? `${carrier} ` : ""}tracking ${tracking ?? ""} to ${orderNo}.`;
    }
    case "order.refund":
    case "order.refund_requested": {
      const amt = dollars(num("amount_cents"));
      const isFull = get("full_refund") === true;
      const reason = str("reason");
      const refundType = isFull ? "Full refund" : `Refund ${amt}`;
      return `${refundType} on ${orderNo}${reason ? ` — "${reason}"` : ""}${simulated}.`;
    }
    case "mission_gift.assign":
      return `Allocated gift to a recipient community.`;
    case "mission_gift.deliver":
      return `Gift marked delivered.`;
    case "customer.tag":
      return `Tagged customer with "${str("tag") ?? ""}".`;
    case "inbox.draft_saved": {
      const len = num("length");
      return `Saved draft reply${len ? ` (${len} chars)` : ""}.`;
    }
    case "inbox.replied": {
      const to = str("recipient_email");
      const len = num("length");
      return `Replied${to ? ` to ${to}` : ""}${len ? ` (${len} chars)` : ""}${simulated}.`;
    }
    case "inbox.archived":
      return `Archived the message.`;
    case "approval.created":
      return `Proposed: ${str("action_type") ?? "an action"}.`;
    case "approval.approved":
      return `Approved.${str("comment") ? ` "${str("comment")}"` : ""}`;
    case "approval.denied":
      return `Denied.${str("comment") ? ` "${str("comment")}"` : ""}`;
    case "approval.executed": {
      const at = str("action_type");
      const path = str("executed");
      return `Executed${at ? ` ${at}` : ""}${path === "real" ? " (real)" : path === "simulated" ? " (simulated)" : ""}.`;
    }
    case "playbook.started":
      return `Playbook "${str("name") ?? row.entity_id?.slice(0, 8)}" started.`;
    case "settings.update": {
      const keys = Object.keys(m).filter((k) => k !== "approval_id");
      return `Updated ${keys.join(", ") || "settings"}.`;
    }
    default:
      return formatMeta(m) || `${row.action} on ${row.entity_type ?? "—"}`;
  }
}

function formatMeta(meta: Record<string, unknown>): string {
  return Object.entries(meta)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.join(" · ")}`;
      if (typeof v === "object" && v !== null)
        return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${String(v)}`;
    })
    .join(" · ");
}
