import Link from "next/link";
import {
  ShoppingBag,
  ShieldCheck,
  Inbox,
  Truck,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  getTodayBriefing,
  isLiveData,
  listApprovals,
  listInbox,
  listOrders,
} from "@/lib/lace/queries";
import { briefingProse } from "@/lib/agent/format";

export const dynamic = "force-dynamic";

function cents(c: number) {
  return `$${(c / 100).toFixed(0)}`;
}

function timeAgo(iso: string) {
  const h = (Date.now() - new Date(iso).getTime()) / 3600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m ago`;
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default async function AdminOverview() {
  const [briefing, approvals, inbox, recent] = await Promise.all([
    getTodayBriefing(),
    listApprovals("pending"),
    listInbox("new"),
    listOrders({ limit: 5 }),
  ]);

  const live = isLiveData();

  const stats = [
    {
      label: "New orders today",
      value: briefing.newOrders.toString(),
      hint: cents(briefing.revenueCents) + " in revenue",
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "Pending approvals",
      value: briefing.pendingApprovals.toString(),
      hint:
        briefing.pendingApprovals > 0
          ? "waiting on you"
          : "all clear",
      icon: ShieldCheck,
      href: "/admin/approvals",
    },
    {
      label: "New messages",
      value: briefing.newInboxMessages.toString(),
      hint: "customers waiting",
      icon: Inbox,
      href: "/admin/inbox",
    },
    {
      label: "To ship",
      value: briefing.unshippedOrders.toString(),
      hint: "still in the atelier",
      icon: Truck,
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">Overview</h1>
          <p className="text-sm text-warm-gray">
            Welcome back. Here&apos;s your store at a glance.
          </p>
        </div>
        {!live && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-warm-gray bg-cream border border-border rounded-full px-3 py-1.5">
            Demo mode · no DB connected
          </span>
        )}
      </div>

      {/* Morning briefing — the AI-written one-paragraph summary */}
      <div className="bg-gradient-to-br from-burgundy to-charcoal text-pearl rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3 text-gold">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.25em]">
            Morning briefing
          </span>
        </div>
        <p className="text-lg leading-relaxed">{briefingProse(briefing)}</p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <Link
            href="/admin/chat"
            className="inline-flex items-center gap-2 bg-white text-charcoal text-sm font-medium px-4 py-2 rounded-full hover:bg-gold hover:text-charcoal transition-colors"
          >
            Ask Luz a question
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          {briefing.pendingApprovals > 0 && (
            <Link
              href="/admin/approvals"
              className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 text-pearl text-sm font-medium px-4 py-2 rounded-full hover:bg-gold/30 transition-colors"
            >
              Review {briefing.pendingApprovals} approval
              {briefing.pendingApprovals === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group bg-white rounded-2xl border border-border-light p-5 hover:border-gold transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-warm-gray uppercase tracking-wide">
                {s.label}
              </span>
              <s.icon className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-heading text-charcoal">{s.value}</p>
            <p className="text-xs text-soft-gray mt-1 group-hover:text-charcoal transition-colors">
              {s.hint}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Approvals preview */}
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl text-charcoal">
              Waiting on you
            </h2>
            <Link
              href="/admin/approvals"
              className="text-xs text-burgundy hover:underline"
            >
              See all →
            </Link>
          </div>
          {approvals.length === 0 ? (
            <p className="text-sm text-warm-gray py-8 text-center">
              No approvals pending. Enjoy the quiet.
            </p>
          ) : (
            <div className="space-y-3">
              {approvals.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 bg-cream rounded-xl"
                >
                  <div
                    className={`mt-1 w-2 h-2 rounded-full ${
                      a.risk === "money"
                        ? "bg-burgundy"
                        : a.risk === "destructive"
                        ? "bg-red-600"
                        : "bg-gold"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal font-medium">
                      {a.human_summary}
                    </p>
                    <p className="text-xs text-warm-gray mt-0.5">
                      {a.requested_by_label} · {timeAgo(a.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl text-charcoal">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-burgundy hover:underline"
            >
              See all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-warm-gray py-8 text-center">
              No orders yet. Share your store to start receiving orders.
            </p>
          ) : (
            <div className="space-y-2">
              {recent.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3 bg-cream rounded-xl"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {o.customer_name}
                    </p>
                    <p className="text-xs text-warm-gray">
                      {o.order_number} · {o.item_count} item
                      {o.item_count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-charcoal">
                      {cents(o.total_cents)}
                    </p>
                    <p className="text-xs text-warm-gray capitalize">
                      {o.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inbox preview */}
      {inbox.length > 0 && (
        <div className="bg-white rounded-2xl border border-border-light p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl text-charcoal">
              New messages
            </h2>
            <Link
              href="/admin/inbox"
              className="text-xs text-burgundy hover:underline"
            >
              Open inbox →
            </Link>
          </div>
          <div className="space-y-3">
            {inbox.slice(0, 3).map((m) => (
              <div key={m.id} className="p-4 bg-cream rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-charcoal">
                    {m.name}{" "}
                    <span className="text-warm-gray font-normal">
                      · {m.email}
                    </span>
                  </p>
                  <span className="text-xs text-warm-gray">
                    {timeAgo(m.created_at)}
                  </span>
                </div>
                {m.subject && (
                  <p className="text-xs text-warm-gray mb-1">{m.subject}</p>
                )}
                <p className="text-sm text-charcoal line-clamp-2">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
