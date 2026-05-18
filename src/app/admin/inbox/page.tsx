import Link from "next/link";
import { Inbox as InboxIcon, Sparkles, ArrowUpRight } from "lucide-react";
import { listInbox } from "@/lib/lace/queries";
import { timeAgo } from "@/lib/format";
import { INBOX_STATUS_DOT } from "@/lib/status-styles";
import EmptyState from "@/components/ui/EmptyState";
import type { InboxStatus } from "@/lib/lace/types";

export const dynamic = "force-dynamic";

// Different from INBOX_STATUS_LABEL in status-styles.ts on purpose:
// the list-strip uses a tight one-word label, while the detail
// page header uses the more conversational "Needs a reply" phrasing.
const LIST_STATUS_LABEL: Record<InboxStatus, string> = {
  new: "New",
  drafted: "Draft saved",
  replied: "Replied",
  archived: "Archived",
};

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
          Open one to read it and write your reply.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.entries(counts) as [InboxStatus, number][]).map(([k, n]) => (
          <span
            key={k}
            className="inline-flex items-center gap-2 bg-white border border-border-light rounded-full px-3 py-1.5 text-xs"
          >
            <span className={`w-2 h-2 rounded-full ${INBOX_STATUS_DOT[k]}`} />
            <span className="text-charcoal">{LIST_STATUS_LABEL[k]}</span>
            <span className="text-warm-gray">{n}</span>
          </span>
        ))}
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="Inbox zero"
          description="No customer messages yet. They'll show up here when they arrive."
          tone="warm"
        />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Link
              key={m.id}
              href={`/admin/inbox/${encodeURIComponent(m.id)}`}
              className="block bg-white rounded-2xl border border-border-light p-5 hover:border-gold transition-colors"
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full ${INBOX_STATUS_DOT[m.status]}`}
                  />
                  <p className="text-sm font-medium text-charcoal truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-warm-gray truncate">
                    · {m.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-xs text-warm-gray">
                    {timeAgo(m.created_at)}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-warm-gray" />
                </div>
              </div>
              {m.subject && (
                <p className="text-sm text-warm-gray italic mb-2 truncate">
                  {m.subject}
                </p>
              )}
              <p className="text-sm text-charcoal line-clamp-2 mb-2">
                {m.message}
              </p>
              {m.reply_draft && (
                <div className="flex items-center gap-1.5 text-[11px] text-gold-dark">
                  <Sparkles className="w-3 h-3" />
                  Draft saved — click to review and send.
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
