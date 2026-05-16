import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Package,
  Receipt,
  ScrollText,
  Truck,
  User,
} from "lucide-react";
import { getOrderFull } from "@/lib/lace/queries";
import { listAuditForEntity } from "@/lib/agent/store";
import { formatCents, formatCentsExact, timeAgo } from "@/lib/format";
import type { OrderStatus, OrderShippingAddress } from "@/lib/lace/types";
import OrderActions from "./OrderActions";

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

function formatAddress(a: OrderShippingAddress | null): string | null {
  if (!a) return null;
  const lines = [
    a.line1,
    a.line2,
    [a.city, a.state, a.zip].filter(Boolean).join(", "),
    a.country,
  ].filter(Boolean) as string[];
  return lines.join("\n");
}

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
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderNumber: rawOrderNumber } = await params;
  const orderNumber = decodeURIComponent(rawOrderNumber);
  const order = await getOrderFull(orderNumber);
  if (!order) notFound();

  const audit = await listAuditForEntity("order", order.id);
  const address = formatAddress(order.shipping_address);
  const totalGifted = order.gifts.reduce((s, g) => s + g.quantity, 0);

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All orders
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl text-charcoal mb-1">
              {order.order_number}
            </h1>
            <p className="text-sm text-warm-gray">
              Placed {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1.5 rounded-full border capitalize ${STATUS_TONE[order.status]}`}
            >
              {order.status}
            </span>
            <span className="font-heading text-2xl text-charcoal">
              {formatCentsExact(order.total_cents)}
            </span>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: items + totals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
              <Package className="w-4 h-4 text-gold" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Items
              </h2>
            </div>
            {order.items.length === 0 ? (
              <p className="px-5 py-8 text-sm text-warm-gray text-center">
                No line items recorded for this order.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-border-light/60 first:border-t-0"
                    >
                      <td className="px-5 py-3">
                        <div className="text-charcoal font-medium">
                          {item.name}
                        </div>
                        <div className="text-xs text-warm-gray">
                          {item.variant_name && `${item.variant_name} · `}
                          {item.sku ?? "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-warm-gray w-24">
                        {formatCentsExact(item.unit_price_cents)} × {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-right text-charcoal font-medium w-28">
                        {formatCentsExact(item.line_total_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="border-t border-border-light px-5 py-4 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatCentsExact(order.subtotal_cents)} />
              <Row label="Shipping" value={formatCentsExact(order.shipping_cents)} />
              {order.tax_cents > 0 && (
                <Row label="Tax" value={formatCentsExact(order.tax_cents)} />
              )}
              {order.discount_cents > 0 && (
                <Row
                  label="Discount"
                  value={`−${formatCentsExact(order.discount_cents)}`}
                />
              )}
              <div className="pt-2 mt-2 border-t border-border-light">
                <Row
                  label={<span className="text-charcoal font-medium">Total</span>}
                  value={
                    <span className="text-charcoal font-medium">
                      {formatCentsExact(order.total_cents)}
                    </span>
                  }
                />
              </div>
            </div>
          </div>

          {/* Mission gifts */}
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
              <Heart className="w-4 h-4 text-burgundy fill-burgundy/30" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Mission gifts
              </h2>
              <span className="ml-auto text-xs text-warm-gray">
                {totalGifted} veil{totalGifted === 1 ? "" : "s"} committed
              </span>
            </div>
            {order.gifts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-warm-gray text-center">
                No matching gifts recorded.
              </p>
            ) : (
              <ul className="divide-y divide-border-light/60">
                {order.gifts.map((g) => (
                  <li key={g.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-burgundy/60" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal">
                        {g.recipient_community
                          ? `${g.recipient_community} · ${g.recipient_city}, ${g.recipient_country}`
                          : "Awaiting recipient assignment"}
                      </p>
                      <p className="text-[11px] text-warm-gray capitalize">
                        {g.status}
                        {g.delivered_at &&
                          ` · delivered ${timeAgo(g.delivered_at)}`}
                        {g.shipped_at &&
                          !g.delivered_at &&
                          ` · shipped ${timeAgo(g.shipped_at)}`}
                      </p>
                    </div>
                    <span className="text-sm text-warm-gray">
                      ×{g.quantity}
                    </span>
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
                Nothing logged for this order yet.
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

        {/* Right: actions + customer + shipping + meta */}
        <div className="space-y-4">
          <OrderActions
            orderNumber={order.order_number}
            status={order.status}
            totalCents={order.total_cents}
          />

          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gold" />
                <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                  Customer
                </h2>
              </div>
              {order.customer.id && (
                <Link
                  href={`/admin/customers/${encodeURIComponent(order.customer.id)}`}
                  className="text-[11px] text-burgundy hover:underline"
                >
                  View profile →
                </Link>
              )}
            </div>
            <p className="text-charcoal font-medium">
              {order.customer.name || "—"}
            </p>
            <a
              href={`mailto:${order.customer.email}`}
              className="text-sm text-burgundy hover:underline break-all"
            >
              {order.customer.email}
            </a>
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border-light text-xs">
              <div>
                <p className="text-warm-gray uppercase tracking-wide">
                  Lifetime orders
                </p>
                <p className="text-charcoal text-lg font-heading">
                  {order.customer.total_orders}
                </p>
              </div>
              <div>
                <p className="text-warm-gray uppercase tracking-wide">
                  Lifetime spend
                </p>
                <p className="text-charcoal text-lg font-heading">
                  {formatCents(order.customer.total_spent_cents)}
                </p>
              </div>
            </div>
            {order.customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border-light">
                {order.customer.tags.map((t) => (
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

          <div className="bg-white rounded-2xl border border-border-light p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gold" />
              <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                Shipping
              </h2>
            </div>
            {address ? (
              <p className="text-sm text-charcoal whitespace-pre-line">
                {address}
              </p>
            ) : (
              <p className="text-sm text-warm-gray">No address on file.</p>
            )}
            {(order.tracking_number || order.carrier) && (
              <div className="mt-4 pt-4 border-t border-border-light flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-warm-gray" />
                <div className="text-xs">
                  <p className="text-warm-gray uppercase tracking-wide">
                    Tracking
                  </p>
                  <p className="text-charcoal">
                    {order.carrier && `${order.carrier} · `}
                    {order.tracking_number ?? "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(order.gift_note || order.internal_notes) && (
            <div className="bg-white rounded-2xl border border-border-light p-5">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-warm-gray" />
                <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
                  Notes
                </h2>
              </div>
              {order.gift_note && (
                <div className="mb-3">
                  <p className="text-[11px] uppercase tracking-wide text-warm-gray mb-1">
                    Gift note
                  </p>
                  <p className="text-sm text-charcoal italic">
                    “{order.gift_note}”
                  </p>
                </div>
              )}
              {order.internal_notes && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-warm-gray mb-1">
                    Internal
                  </p>
                  <p className="text-sm text-charcoal">
                    {order.internal_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-warm-gray">{label}</span>
      <span className="text-charcoal tabular-nums">{value}</span>
    </div>
  );
}
