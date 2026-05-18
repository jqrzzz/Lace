import Link from "next/link";
import { Users, ArrowUpRight, Search } from "lucide-react";
import { isLiveData, listCustomers } from "@/lib/lace/queries";
import { formatCents, timeAgo } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

interface CustomersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const customers = await listCustomers({ search, limit: 100 });
  const live = isLiveData();

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">
            Customers
          </h1>
          <p className="text-sm text-warm-gray">
            {customers.length} customer{customers.length === 1 ? "" : "s"}
            {search ? ` matching "${search}"` : ""}.
          </p>
        </div>
        {!live && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-warm-gray bg-cream border border-border rounded-full px-3 py-1.5">
            Demo mode · no DB connected
          </span>
        )}
      </div>

      <form className="mb-6" action="/admin/customers" method="get">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
          <input
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold bg-white"
          />
        </div>
      </form>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? `No matches for "${search}"` : "No customers yet"}
          description={
            search
              ? "Try a different search."
              : "Customer records are created automatically when orders come in."
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-[11px] uppercase tracking-wide text-warm-gray">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-right px-4 py-3 font-medium">Orders</th>
                <th className="text-right px-4 py-3 font-medium">Spend</th>
                <th className="text-right px-4 py-3 font-medium">Last ordered</th>
                <th className="text-left px-4 py-3 font-medium">Tags</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-border-light/60 hover:bg-cream/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(c.id)}`}
                      className="hover:text-burgundy"
                    >
                      {c.name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-warm-gray break-all">
                    {c.email}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal">
                    {c.total_orders}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal font-medium">
                    {formatCents(c.total_spent_cents)}
                  </td>
                  <td className="px-4 py-3 text-right text-warm-gray">
                    {c.last_ordered_at ? timeAgo(c.last_ordered_at) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wide bg-cream text-warm-gray border border-border-light px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${encodeURIComponent(c.id)}`}
                      aria-label={`Open ${c.email}`}
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
