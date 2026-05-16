import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, ScrollText, User } from "lucide-react";
import { getInboxMessageWithContext } from "@/lib/lace/queries";
import { listAuditForEntity } from "@/lib/agent/store";
import { formatCents, timeAgo } from "@/lib/format";
import type { InboxStatus, OrderStatus } from "@/lib/lace/types";
import ReplyPane from "./ReplyPane";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<InboxStatus, string> = {
  new: "bg-blush/30 text-burgundy border-burgundy/20",
  drafted: "bg-gold/20 text-gold-dark border-gold/40",
  replied: "bg-emerald-100 text-emerald-800 border-emerald-300",
  archived: "bg-stone-100 text-stone-700 border-stone-300",
};

const STATUS_LABEL: Record<InboxStatus, string> = {
  new: "Needs a reply",
  drafted: "Draft saved",
  replied: "Replied",
  archived: "Archived",
};

const ORDER_TONE: Record<OrderStatus, string> = {
  pending: "bg-cream text-warm-gray border-border",
  paid: "bg-blush/30 text-burgundy border-burgundy/20",
  processing: "bg-gold/15 text-gold-dark border-gold/30",
  shipped: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-stone-100 text-stone-700 border-stone-300",
  refunded: "bg-amber-100 text-amber-800 border-amber-300",
  failed: "bg-red-50 text-red-700 border-red-200",
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InboxDetailPage({ params }: PageProps) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw);
  const m = await getInboxMessageWithContext(id);
  if (!m) notFound();

  const audit = await listAuditForEntity("inbox_message", m.id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/inbox"
          className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to inbox
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl text-charcoal mb-1">
              {m.subject || "Message from a customer"}
            </h1>
            <p className="text-sm text-warm-gray">
              From {m.name} · {formatDateTime(m.created_at)}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full border capitalize ${STATUS_TONE[m.status]}`}
          >
            {STATUS_LABEL[m.status]}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Message body */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-gold" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Their message
              </h2>
            </div>
            <p className="text-sm text-charcoal whitespace-pre-wrap leading-relaxed">
              {m.message}
            </p>
          </div>

          {/* Reply pane */}
          <ReplyPane
            messageId={m.id}
            status={m.status}
            initialDraft={m.reply_draft}
            replySent={m.reply_sent}
            customerName={m.name}
          />

          {/* Timeline */}
          {audit.length > 0 && (
            <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
              <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-warm-gray" />
                <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                  Timeline
                </h2>
              </div>
              <ol className="divide-y divide-border-light/60">
                {audit.map((e) => (
                  <li key={e.id} className="px-5 py-3 text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-charcoal">{e.action}</span>
                      <span className="text-xs text-warm-gray whitespace-nowrap">
                        {timeAgo(e.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-warm-gray mt-0.5">
                      {e.actor_label}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right: sender context */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gold" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Sender
              </h2>
            </div>
            <p className="text-charcoal font-medium">{m.name}</p>
            <a
              href={`mailto:${m.email}`}
              className="text-sm text-burgundy hover:underline break-all"
            >
              {m.email}
            </a>
          </div>

          {m.customer ? (
            <div className="bg-white rounded-2xl border border-border-light p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-wide text-warm-gray">
                  Customer profile
                </p>
                <Link
                  href={`/admin/customers/${encodeURIComponent(m.customer.id)}`}
                  className="text-[11px] text-burgundy hover:underline"
                >
                  Open profile →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-warm-gray">
                    Orders
                  </p>
                  <p className="text-lg font-heading text-charcoal">
                    {m.customer.total_orders}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-warm-gray">
                    Spend
                  </p>
                  <p className="text-lg font-heading text-charcoal">
                    {formatCents(m.customer.total_spent_cents)}
                  </p>
                </div>
              </div>
              {m.customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {m.customer.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase tracking-wide bg-cream text-warm-gray border border-border-light px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {m.customer.recent_orders.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-wide text-warm-gray mb-1.5">
                    Recent orders
                  </p>
                  <ul className="space-y-1.5">
                    {m.customer.recent_orders.map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <Link
                          href={`/admin/orders/${encodeURIComponent(o.order_number)}`}
                          className="text-charcoal hover:text-burgundy truncate"
                        >
                          {o.order_number}
                        </Link>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${ORDER_TONE[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div className="bg-cream/40 rounded-2xl border border-border-light p-5 text-center">
              <p className="text-xs text-warm-gray">
                Not a customer yet — first time writing in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
