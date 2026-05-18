import Link from "next/link";
import { ClipboardList, ArrowUpRight } from "lucide-react";
import { isLiveData, listOrders } from "@/lib/lace/queries";
import { formatCents, timeAgo } from "@/lib/format";
import type { OrderStatus } from "@/lib/lace/types";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

function isOrderStatus(s: string | undefined): s is OrderStatus {
  return (
    s === "pending" ||
    s === "paid" ||
    s === "processing" ||
    s === "shipped" ||
    s === "delivered" ||
    s === "cancelled" ||
    s === "refunded" ||
    s === "failed"
  );
}

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const params = await searchParams;
  const statusFilter = isOrderStatus(params.status) ? params.status : undefined;
  const orders = await listOrders({ status: statusFilter, limit: 100 });
  const live = isLiveData();

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">Orders</h1>
          <p className="text-sm text-warm-gray">
            {orders.length} order{orders.length === 1 ? "" : "s"}
            {statusFilter ? ` with status ${statusFilter}` : ""}.
          </p>
        </div>
        {!live && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-warm-gray bg-cream border border-border rounded-full px-3 py-1.5">
            Demo mode · no DB connected
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((opt) => {
          const active =
            opt.value === "all" ? !statusFilter : statusFilter === opt.value;
          const href =
            opt.value === "all"
              ? "/admin/orders"
              : `/admin/orders?status=${opt.value}`;
          return (
            <Link
              key={opt.value}
              href={href}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-charcoal text-pearl border-charcoal"
                  : "bg-white text-warm-gray border-border hover:border-gold hover:text-charcoal"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={`No orders ${statusFilter ? `with status ${statusFilter}` : "yet"}`}
          description={
            statusFilter
              ? "Try a different filter."
              : "When customers place orders, they'll appear here."
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-[11px] uppercase tracking-wide text-warm-gray">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Items</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-right px-4 py-3 font-medium">Placed</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-border-light/60 hover:bg-cream/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(o.order_number)}`}
                      className="hover:text-burgundy"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-charcoal">
                      {o.customer_name || "—"}
                    </div>
                    <div className="text-xs text-warm-gray">
                      {o.customer_email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-warm-gray">{o.item_count}</td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="order" status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal font-medium">
                    {formatCents(o.total_cents)}
                  </td>
                  <td className="px-4 py-3 text-right text-warm-gray">
                    {timeAgo(o.created_at)}
                  </td>
                  <td className="px-4 py-3">
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
        </div>
      )}
    </div>
  );
}
