import Link from "next/link";
import { Inbox as InboxIcon, Sparkles } from "lucide-react";
import { listInbox } from "@/lib/lace/queries";
import type { InboxStatus } from "@/lib/lace/types";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<InboxStatus, string> = {
  new: "New",
  drafted: "Reply drafted",
  replied: "Replied",
  archived: "Archived",
};

const STATUS_DOT: Record<InboxStatus, string> = {
  new: "bg-burgundy",
  drafted: "bg-gold",
  replied: "bg-green-600",
  archived: "bg-soft-gray",
};

function timeAgo(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m ago`;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default async function InboxPage() {
  const messages = await listInbox();
  const counts = {
    new: messages.filter((m) => m.status === "new").length,
    drafted: messages.filter((m) => m.status === "drafted").length,
    replied: messages.filter((m) => m.status === "replied").length,
    archived: messages.filter((m) => m.status === "archived").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-charcoal mb-1">Inbox</h1>
        <p className="text-sm text-warm-gray">
          Customer messages from the contact form, email replies, and WhatsApp.
          Luz drafts replies you can edit and send.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.entries(counts) as [InboxStatus, number][]).map(([k, n]) => (
          <span
            key={k}
            className="inline-flex items-center gap-2 bg-white border border-border-light rounded-full px-3 py-1.5 text-xs"
          >
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[k]}`} />
            <span className="text-charcoal">{STATUS_LABELS[k]}</span>
            <span className="text-warm-gray">{n}</span>
          </span>
        ))}
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-16 text-center">
          <InboxIcon className="w-10 h-10 text-soft-gray mx-auto mb-3" />
          <h3 className="font-heading text-xl text-charcoal mb-1">
            Inbox zero
          </h3>
          <p className="text-sm text-warm-gray">
            No customer messages yet. They&apos;ll show up here when they arrive.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-border-light p-5"
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${STATUS_DOT[m.status]}`}
                  />
                  <p className="text-sm font-medium text-charcoal">{m.name}</p>
                  <p className="text-xs text-warm-gray">· {m.email}</p>
                </div>
                <span className="text-xs text-warm-gray">
                  {timeAgo(m.created_at)}
                </span>
              </div>
              {m.subject && (
                <p className="text-sm text-warm-gray italic mb-2">
                  {m.subject}
                </p>
              )}
              <p className="text-sm text-charcoal whitespace-pre-wrap mb-4">
                {m.message}
              </p>

              {m.reply_draft && (
                <div className="bg-gold/5 border-l-2 border-gold rounded-r-lg px-4 py-3 mb-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-gold" />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gold-dark">
                      Luz&apos;s draft reply
                    </p>
                  </div>
                  <p className="text-sm text-charcoal whitespace-pre-wrap">
                    {m.reply_draft}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {m.status === "new" && (
                  <Link
                    href="/admin/chat"
                    className="inline-flex items-center gap-1.5 text-xs bg-burgundy text-white px-3 py-1.5 rounded-full hover:bg-burgundy/90 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Ask Luz to draft a reply
                  </Link>
                )}
                {m.status === "drafted" && (
                  <>
                    <button className="text-xs bg-burgundy text-white px-3 py-1.5 rounded-full hover:bg-burgundy/90 transition-colors">
                      Send draft
                    </button>
                    <button className="text-xs bg-white border border-border text-charcoal px-3 py-1.5 rounded-full hover:border-charcoal transition-colors">
                      Edit draft
                    </button>
                  </>
                )}
                <button className="text-xs text-warm-gray px-3 py-1.5 rounded-full hover:text-charcoal transition-colors ml-auto">
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
