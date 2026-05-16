"use client";

import { useState } from "react";
import { Check, X, Clock, ShieldAlert, DollarSign, Pencil } from "lucide-react";
import type { ApprovalRow, ApprovalRisk } from "@/lib/lace/types";
import { cn } from "@/lib/utils";
import { formatValue, timeLeft } from "@/lib/format";
import { ApiClientError } from "@/lib/client";
import { adminFetchJSON } from "@/lib/admin-fetch";
import { useToast } from "@/components/ui/Toast";

const RISK_STYLE: Record<
  ApprovalRisk,
  { badge: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  low: {
    badge: "bg-soft-gray/10 text-warm-gray",
    dot: "bg-soft-gray",
    icon: Pencil,
  },
  normal: {
    badge: "bg-gold/10 text-gold-dark",
    dot: "bg-gold",
    icon: Pencil,
  },
  money: {
    badge: "bg-burgundy/10 text-burgundy",
    dot: "bg-burgundy",
    icon: DollarSign,
  },
  destructive: {
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-600",
    icon: ShieldAlert,
  },
};

export default function ApprovalsQueue({
  initialPending,
  initialApproved,
  initialDenied,
}: {
  initialPending: ApprovalRow[];
  initialApproved: ApprovalRow[];
  initialDenied: ApprovalRow[];
}) {
  const [pending, setPending] = useState(initialPending);
  const [approved, setApproved] = useState(initialApproved);
  const [denied, setDenied] = useState(initialDenied);
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [deciding, setDeciding] = useState<string | null>(null);
  const { toast } = useToast();

  async function decide(id: string, decision: "approved" | "denied") {
    const row = pending.find((r) => r.id === id);
    if (!row || deciding) return;

    // Optimistic: remove from pending, tuck into the right history tab.
    const optimistic: ApprovalRow = {
      ...row,
      status: decision,
      executed_at: decision === "approved" ? new Date().toISOString() : null,
    };
    setPending((p) => p.filter((r) => r.id !== id));
    if (decision === "approved") setApproved((a) => [optimistic, ...a]);
    else setDenied((d) => [optimistic, ...d]);
    setNoteFor(null);
    const savedNote = note;
    setNote("");
    setDeciding(id);

    try {
      const { data } = await adminFetchJSON<{
        approval: ApprovalRow;
        effects: string[];
      }>("/api/agent/approvals/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, decision, note: savedNote || undefined }),
      });

      // Reconcile with server truth (keeps executed_at consistent).
      if (decision === "approved") {
        setApproved((a) =>
          a.map((r) => (r.id === id ? data.approval : r))
        );
        toast(
          data.effects.length > 0
            ? `Approved — ${data.effects[0]}`
            : "Approved.",
          "success"
        );
      } else {
        setDenied((d) =>
          d.map((r) => (r.id === id ? data.approval : r))
        );
        toast("Denied.", "info");
      }
    } catch (err) {
      // Roll back the optimistic move.
      setPending((p) => [row, ...p]);
      if (decision === "approved") {
        setApproved((a) => a.filter((r) => r.id !== id));
      } else {
        setDenied((d) => d.filter((r) => r.id !== id));
      }
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Couldn't save that decision.";
      toast(msg, "error");
    } finally {
      setDeciding(null);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-cream p-1 rounded-xl w-fit mb-6 border border-border-light">
        <button
          onClick={() => setTab("pending")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm transition-colors",
            tab === "pending"
              ? "bg-white text-charcoal shadow-sm"
              : "text-warm-gray"
          )}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm transition-colors",
            tab === "history"
              ? "bg-white text-charcoal shadow-sm"
              : "text-warm-gray"
          )}
        >
          History ({approved.length + denied.length})
        </button>
      </div>

      {tab === "pending" && (
        <>
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-16 text-center">
              <div className="w-12 h-12 rounded-full bg-gold/10 mx-auto mb-4 flex items-center justify-center">
                <Check className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-heading text-xl text-charcoal mb-1">
                All caught up
              </h3>
              <p className="text-sm text-warm-gray">
                No approvals waiting. The agent will ping you here when
                something needs your tap.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((row) => {
                const style = RISK_STYLE[row.risk];
                const Icon = style.icon;
                const showNote = noteFor === row.id;
                return (
                  <div
                    key={row.id}
                    className="bg-white rounded-2xl border border-border-light overflow-hidden"
                  >
                    {/* Header strip */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-border-light bg-cream">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full font-medium",
                          style.badge
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {row.risk}
                      </span>
                      <span className="text-xs text-warm-gray">
                        {row.action_type}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-warm-gray">
                        <Clock className="w-3 h-3" />
                        {timeLeft(row.expires_at)}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-5">
                      <h3 className="font-heading text-lg text-charcoal mb-2">
                        {row.human_summary}
                      </h3>
                      <p className="text-xs text-warm-gray mb-4">
                        Requested by {row.requested_by_label}
                      </p>

                      <div className="bg-cream rounded-xl p-4 mb-5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray mb-2">
                          Details
                        </p>
                        <dl className="space-y-1.5 text-sm">
                          {Object.entries(row.action_payload).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <dt className="text-warm-gray min-w-[140px] capitalize">
                                {k.replace(/_/g, " ")}
                              </dt>
                              <dd className="text-charcoal flex-1 break-words">
                                {formatValue(v)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      {showNote && (
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Optional note (why you approved / denied)"
                          rows={2}
                          className="w-full border border-border rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-gold bg-ivory"
                        />
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(row.id, "approved")}
                          disabled={deciding === row.id}
                          className="inline-flex items-center gap-2 bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-colors disabled:opacity-60"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => decide(row.id, "denied")}
                          disabled={deciding === row.id}
                          className="inline-flex items-center gap-2 bg-white border border-border text-charcoal px-5 py-2.5 rounded-xl text-sm font-medium hover:border-red-600 hover:text-red-700 transition-colors disabled:opacity-60"
                        >
                          <X className="w-4 h-4" />
                          Deny
                        </button>
                        <button
                          onClick={() => {
                            setNoteFor(showNote ? null : row.id);
                            setNote("");
                          }}
                          className="ml-auto text-xs text-warm-gray hover:text-charcoal"
                        >
                          {showNote ? "Hide note" : "Add a note"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "history" && (
        <div className="space-y-2">
          {[...approved, ...denied]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-xl border border-border-light px-4 py-3 flex items-center gap-3"
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    row.status === "approved" ? "bg-green-600" : "bg-red-600"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal truncate">
                    {row.human_summary}
                  </p>
                  <p className="text-xs text-warm-gray">
                    {row.status} · {row.requested_by_label}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-warm-gray">
                  {row.risk}
                </span>
              </div>
            ))}
          {approved.length + denied.length === 0 && (
            <p className="text-sm text-warm-gray py-8 text-center">
              Nothing decided yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

