import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ClipboardList,
  Inbox,
  Mail,
  Phone,
  ScrollText,
  User,
} from "lucide-react";
import { getCustomerFull } from "@/lib/lace/queries";
import { listAuditForEntity } from "@/lib/agent/store";
import { formatCents, timeAgo } from "@/lib/format";
import type { OrderStatus } from "@/lib/lace/types";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-cream text-warm-gray border-border",
  paid: "bg-blush/30 text-burgundy border-burgundy/20",
  processing: "bg-gold/15 text-gold-dark border-gold/30",
  shipped: "bg-emerald-50 text-emerald-700 border-emerald-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
  cancelled: "bg-stone-100 text-stone-700 border-stone-300",
  refunded: "bg-amber-100 text-amber-800 border-amber-300",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const INBOX_TONE: Record<string, string> = {
  new: "bg-blush/30 text-burgundy",
  drafted: "bg-gold/20 text-gold-dark",
  replied: "bg-emerald-100 text-emerald-800",
  archived: "bg-stone-100 text-stone-700",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const customer = await getCustomerFull(id);
  if (!customer) notFound();

  const audit = await listAuditForEntity("customer", customer.id);
  const aov =
    customer.total_orders > 0
      ? Math.round(customer.total_spent_cents / customer.total_orders)
      : 0;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All customers
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl text-charcoal mb-1">
              {customer.name || customer.email}
            </h1>
            <p className="text-sm text-warm-gray">
              Customer since {formatDate(customer.created_at)}
            </p>
          </div>
          {customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {customer.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] uppercase tracking-wide bg-cream text-warm-gray border border-border-light px-2 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Lifetime stats */}
          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Lifetime orders"
              value={customer.total_orders.toString()}
            />
            <Stat
              label="Lifetime spend"
              value={formatCents(customer.total_spent_cents)}
            />
            <Stat label="Avg order" value={formatCents(aov)} />
          </div>

          {/* Order history */}
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gold" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Order history
              </h2>
              <span className="ml-auto text-xs text-warm-gray">
                {customer.orders.length} order
                {customer.orders.length === 1 ? "" : "s"}
              </span>
            </div>
            {customer.orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-warm-gray text-center">
                No orders yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {customer.orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-border-light/60 first:border-t-0 hover:bg-cream/30"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(o.order_number)}`}
                          className="text-charcoal font-medium hover:text-burgundy"
                        >
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-warm-gray">
                        {o.item_count} item{o.item_count === 1 ? "" : "s"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full border capitalize ${STATUS_TONE[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-warm-gray">
                        {timeAgo(o.created_at)}
                      </td>
                      <td className="px-5 py-3 text-right text-charcoal font-medium">
                        {formatCents(o.total_cents)}
                      </td>
                      <td className="px-5 py-3 w-8">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(o.order_number)}`}
                          aria-label={`Open ${o.order_number}`}
                          className="text-warm-gray hover:text-burgundy"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Inbox conversations */}
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
              <Inbox className="w-4 h-4 text-gold" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Inbox conversations
              </h2>
              <span className="ml-auto text-xs text-warm-gray">
                {customer.inbox_messages.length} message
                {customer.inbox_messages.length === 1 ? "" : "s"}
              </span>
            </div>
            {customer.inbox_messages.length === 0 ? (
              <p className="px-5 py-8 text-sm text-warm-gray text-center">
                No messages from this customer.
              </p>
            ) : (
              <ul className="divide-y divide-border-light/60">
                {customer.inbox_messages.map((m) => (
                  <li key={m.id} className="px-5 py-4">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <p className="text-sm text-charcoal font-medium truncate">
                        {m.subject || "(no subject)"}
                      </p>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${INBOX_TONE[m.status] ?? INBOX_TONE.new}`}
                        >
                          {m.status}
                        </span>
                        <span className="text-xs text-warm-gray">
                          {timeAgo(m.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-warm-gray line-clamp-2">
                      {m.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Audit timeline */}
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-warm-gray" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Timeline
              </h2>
            </div>
            {audit.length === 0 ? (
              <p className="px-5 py-8 text-sm text-warm-gray text-center">
                Nothing logged for this customer yet.
              </p>
            ) : (
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
            )}
          </div>
        </div>

        {/* Right: contact + meta */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gold" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Contact
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-warm-gray mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${customer.email}`}
                  className="text-burgundy hover:underline break-all"
                >
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-warm-gray mt-0.5 flex-shrink-0" />
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-charcoal hover:text-burgundy"
                  >
                    {customer.phone}
                  </a>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border-light text-xs">
              <p className="text-warm-gray">
                Marketing opt-in:{" "}
                <span className="text-charcoal">
                  {customer.marketing_opt_in ? "yes" : "no"}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="text-[11px] uppercase tracking-wide text-warm-gray mb-2">
              Order window
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-warm-gray">First order</p>
                <p className="text-charcoal">
                  {customer.first_ordered_at
                    ? formatDate(customer.first_ordered_at)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-warm-gray">Last order</p>
                <p className="text-charcoal">
                  {customer.last_ordered_at
                    ? formatDate(customer.last_ordered_at)
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="bg-white rounded-2xl border border-border-light p-5">
              <div className="text-[11px] uppercase tracking-wide text-warm-gray mb-2">
                Notes
              </div>
              <p className="text-sm text-charcoal whitespace-pre-line">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border-light p-4">
      <p className="text-[10px] uppercase tracking-wide text-warm-gray">
        {label}
      </p>
      <p className="text-2xl font-heading text-charcoal mt-1">{value}</p>
    </div>
  );
}
