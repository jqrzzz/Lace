"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  Check,
  Inbox as InboxIcon,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import type { InboxStatus } from "@/lib/lace/types";

interface ReplyPaneProps {
  messageId: string;
  status: InboxStatus;
  initialDraft: string | null;
  replySent: string | null;
  customerName: string;
}

export default function ReplyPane({
  messageId,
  status,
  initialDraft,
  replySent,
  customerName,
}: ReplyPaneProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    null | "draft" | "send" | "archive"
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function post(
    action: "draft" | "send" | "archive",
    body: Record<string, unknown>,
    successText: string,
  ) {
    setError(null);
    setSuccess(null);
    setPendingAction(action);
    try {
      const res = await fetch(`/api/admin/inbox/${messageId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error ?? "Something didn't go through.");
        return;
      }
      setSuccess(successText);
      startTransition(() => router.refresh());
    } finally {
      setPendingAction(null);
    }
  }

  // Already replied — read-only view + archive option
  if (status === "replied" && replySent) {
    return (
      <div className="bg-white rounded-2xl border border-border-light p-5">
        <div className="flex items-center gap-2 mb-3">
          <Check className="w-4 h-4 text-emerald-600" />
          <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
            Your reply
          </h2>
        </div>
        <p className="text-sm text-charcoal whitespace-pre-wrap bg-cream/40 rounded-xl px-4 py-3 mb-4">
          {replySent}
        </p>
        <button
          onClick={() =>
            post("archive", {}, "Tucked away in archive.")
          }
          disabled={pending || pendingAction !== null}
          className="text-xs text-warm-gray hover:text-charcoal"
        >
          Move to archive
        </button>
        {success && (
          <p className="text-xs text-emerald-700 mt-2">{success}</p>
        )}
      </div>
    );
  }

  if (status === "archived") {
    return (
      <div className="bg-cream/50 rounded-2xl border border-border-light p-5 text-center">
        <InboxIcon className="w-5 h-5 text-soft-gray mx-auto mb-2" />
        <p className="text-sm text-warm-gray">
          This message is archived. Need to do something? Reply or change the
          state from the agent chat.
        </p>
      </div>
    );
  }

  const askLuzHref = `/admin/chat?prefill=${encodeURIComponent(
    `Please draft a warm reply to ${customerName} about their message (id: ${messageId}). Keep it under 120 words.`,
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-border-light p-5">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
          {status === "drafted" ? "Edit the draft" : "Write a reply"}
        </h2>
        <Link
          href={askLuzHref}
          className="inline-flex items-center gap-1.5 text-xs text-burgundy hover:underline"
        >
          <Sparkles className="w-3 h-3" />
          Ask Luz to draft for me
        </Link>
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={8}
        placeholder={`Hola ${customerName.split(" ")[0] || "there"} — thank you for writing in…`}
        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold mb-3"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            post("send", { reply: draft }, "Sent. Reply on its way.")
          }
          disabled={pending || pendingAction !== null || draft.trim().length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
        >
          {pendingAction === "send" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send reply
        </button>
        <button
          onClick={() => post("draft", { reply: draft }, "Draft saved.")}
          disabled={pending || pendingAction !== null || draft.trim().length === 0}
          className="px-4 py-2.5 bg-white border border-border text-charcoal text-sm rounded-xl hover:border-charcoal transition-colors disabled:opacity-60"
        >
          {pendingAction === "draft" ? (
            <Loader2 className="w-4 h-4 animate-spin inline -mt-0.5 mr-1" />
          ) : null}
          Save draft
        </button>
        <button
          onClick={() => post("archive", {}, "Tucked away in archive.")}
          disabled={pending || pendingAction !== null}
          className="ml-auto px-4 py-2.5 text-sm text-warm-gray hover:text-charcoal"
        >
          Archive
        </button>
      </div>

      <p className="text-[11px] text-warm-gray mt-3">
        Send goes to the customer&apos;s email. Phase 2.C wires the real send
        — for now the draft saves and an audit entry is written.
      </p>

      {success && (
        <div className="mt-3 flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-3 py-2 text-sm">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-3 py-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
