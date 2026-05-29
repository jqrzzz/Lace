"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  X,
  Clock,
  ShieldAlert,
  DollarSign,
  Pencil,
  RotateCcw,
} from "lucide-react";
import type { ApprovalRow, ApprovalRisk } from "@/lib/lace/types";
import { cn } from "@/lib/utils";
import { humanizePayload, timeLeft } from "@/lib/format";
import { ApiClientError } from "@/lib/client";
import { adminFetchJSON } from "@/lib/admin-fetch";
import { useToast } from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";

// How long an approved/denied decision sits in a reversible "about to run"
// state before it actually executes. Short enough not to feel like a wait,
// long enough to catch a mis-tap — the safety net for a nervous owner.
const GRACE_MS = 10_000;
const GRACE_SECONDS = GRACE_MS / 1000;

type ScheduledItem = {
  row: ApprovalRow;
  decision: "approved" | "denied";
  note: string;
  secondsLeft: number;
};

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
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([]);
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  // Timers for in-flight grace windows + a live mirror of `scheduled` so the
  // timer/unmount closures always read current items, not a stale snapshot.
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const scheduledRef = useRef<ScheduledItem[]>([]);
  // Mirror `scheduled` into a ref (in an effect, never during render) so the
  // timer + unmount closures always read the latest items.
  useEffect(() => {
    scheduledRef.current = scheduled;
  }, [scheduled]);

  // Count each scheduled item down once a second (display only — the actual
  // execution is driven by its setTimeout). No wall-clock reads, so render
  // and these helpers stay pure.
  useEffect(() => {
    if (scheduled.length === 0) return;
    const iv = setInterval(() => {
      setScheduled((items) =>
        items.map((it) => ({
          ...it,
          secondsLeft: Math.max(0, it.secondsLeft - 1),
        })),
      );
    }, 1000);
    return () => clearInterval(iv);
  }, [scheduled.length]);

  // On unmount, honor any decision still in its grace window by firing it —
  // she tapped Approve/Deny, so leaving the page shouldn't silently drop it.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const [id, t] of timers) {
        clearTimeout(t);
        const item = scheduledRef.current.find((s) => s.row.id === id);
        if (!item) continue;
        void adminFetchJSON("/api/agent/approvals/decide", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: item.row.id,
            decision: item.decision,
            note: item.note || undefined,
          }),
        }).catch(() => {
          /* best effort on the way out */
        });
      }
      timers.clear();
    };
  }, []);

  // Actually send the decision to the server + reconcile the history tab.
  async function postDecision(
    row: ApprovalRow,
    decision: "approved" | "denied",
    savedNote: string,
  ) {
    const optimistic: ApprovalRow = {
      ...row,
      status: decision,
      executed_at: decision === "approved" ? new Date().toISOString() : null,
    };
    if (decision === "approved") setApproved((a) => [optimistic, ...a]);
    else setDenied((d) => [optimistic, ...d]);

    try {
      const { data } = await adminFetchJSON<{
        approval: ApprovalRow;
        effects: string[];
      }>("/api/agent/approvals/decide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: row.id, decision, note: savedNote || undefined }),
      });
      if (decision === "approved") {
        setApproved((a) => a.map((r) => (r.id === row.id ? data.approval : r)));
        toast(
          data.effects.length > 0 ? `Done — ${data.effects[0]}` : "Approved.",
          "success",
        );
      } else {
        setDenied((d) => d.map((r) => (r.id === row.id ? data.approval : r)));
        toast("Denied.", "info");
      }
    } catch (err) {
      if (decision === "approved") {
        setApproved((a) => a.filter((r) => r.id !== row.id));
      } else {
        setDenied((d) => d.filter((r) => r.id !== row.id));
      }
      setPending((p) => (p.some((r) => r.id === row.id) ? p : [row, ...p]));
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Couldn't save that decision.";
      toast(msg, "error");
    }
  }

  // Tap Approve/Deny → move the card into a 10s reversible window.
  function schedule(id: string, decision: "approved" | "denied") {
    const row = pending.find((r) => r.id === id);
    if (!row || timersRef.current.has(id)) return;
    const savedNote = noteFor === id ? note : "";
    setPending((p) => p.filter((r) => r.id !== id));
    setNoteFor(null);
    setNote("");
    setScheduled((s) => [
      { row, decision, note: savedNote, secondsLeft: GRACE_SECONDS },
      ...s,
    ]);
    const t = setTimeout(() => commit(id), GRACE_MS);
    timersRef.current.set(id, t);
  }

  // Window elapsed or "Do it now" → run it for real.
  function commit(id: string) {
    const item = scheduledRef.current.find((s) => s.row.id === id);
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    if (!item) return;
    setScheduled((s) => s.filter((x) => x.row.id !== id));
    void postDecision(item.row, item.decision, item.note);
  }

  // Pull it back before it runs — nothing was sent.
  function undoSchedule(id: string) {
    const item = scheduledRef.current.find((s) => s.row.id === id);
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    if (!item) return;
    setScheduled((s) => s.filter((x) => x.row.id !== id));
    setPending((p) =>
      p.some((r) => r.id === item.row.id) ? p : [item.row, ...p],
    );
    toast("Cancelled — nothing was sent.", "info");
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
          {/* Grace window — decisions you can still pull back before they run */}
          {scheduled.length > 0 && (
            <div className="space-y-2 mb-4">
              {scheduled.map((item) => {
                const secs = item.secondsLeft;
                return (
                  <div
                    key={item.row.id}
                    className="bg-white rounded-xl border border-gold/40 px-4 py-3 flex items-center gap-3 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal truncate">
                        {item.row.human_summary}
                      </p>
                      <p className="text-xs text-warm-gray">
                        {item.decision === "approved" ? "Approving" : "Denying"}{" "}
                        in {secs}s — you can still undo
                      </p>
                    </div>
                    <button
                      onClick={() => undoSchedule(item.row.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-burgundy hover:underline flex-shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Undo
                    </button>
                    <button
                      onClick={() => commit(item.row.id)}
                      className="text-xs text-warm-gray hover:text-charcoal flex-shrink-0"
                    >
                      Do it now
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {pending.length === 0 && scheduled.length === 0 ? (
            <EmptyState
              icon={Check}
              title="All caught up"
              description="No approvals waiting. Vela will bring anything that needs your yes or no right here."
              tone="warm"
            />
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

                      {(() => {
                        const details = humanizePayload(row.action_payload);
                        if (details.length === 0) return null;
                        return (
                          <div className="bg-cream rounded-xl p-4 mb-5">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray mb-2">
                              Details
                            </p>
                            <dl className="space-y-1.5 text-sm">
                              {details.map(({ label, value }) => (
                                <div key={label} className="flex gap-2">
                                  <dt className="text-warm-gray min-w-[140px]">
                                    {label}
                                  </dt>
                                  <dd className="text-charcoal flex-1 break-words">
                                    {value}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        );
                      })()}

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
                          onClick={() => schedule(row.id, "approved")}
                          className="inline-flex items-center gap-2 bg-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => schedule(row.id, "denied")}
                          className="inline-flex items-center gap-2 bg-white border border-border text-charcoal px-5 py-2.5 rounded-xl text-sm font-medium hover:border-red-600 hover:text-red-700 transition-colors"
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

