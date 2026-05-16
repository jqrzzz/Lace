import Link from "next/link";
import { Heart, Gift, MapPin, PackageCheck, Sparkles } from "lucide-react";
import {
  isLiveData,
  listMissionGifts,
  listMissionRecipients,
} from "@/lib/lace/queries";
import { timeAgo } from "@/lib/format";
import PendingGiftRow from "./PendingGiftRow";
import AllocatedGiftRow from "./AllocatedGiftRow";

export const dynamic = "force-dynamic";

export default async function AdminMissionPage() {
  const [pending, inflight, delivered, recipients] = await Promise.all([
    listMissionGifts({ status: "pending", limit: 100 }),
    listMissionGifts({ statuses: ["allocated", "shipped"], limit: 100 }),
    listMissionGifts({ status: "delivered", limit: 10 }),
    listMissionRecipients(),
  ]);
  const live = isLiveData();

  const totalCommitted =
    pending.reduce((s, g) => s + g.quantity, 0) +
    inflight.reduce((s, g) => s + g.quantity, 0) +
    delivered.reduce((s, g) => s + g.quantity, 0);
  const totalInFlight = inflight.reduce((s, g) => s + g.quantity, 0);
  const totalDelivered = recipients.reduce((s, r) => s + r.veils_gifted, 0);

  const stats = [
    {
      icon: Gift,
      label: "Committed",
      value: totalCommitted,
      hint:
        pending.length > 0
          ? `${pending.length} waiting for a home`
          : "all matched up",
    },
    {
      icon: PackageCheck,
      label: "In flight",
      value: totalInFlight,
      hint: inflight.length === 0 ? "nothing on the road" : "on their way",
    },
    {
      icon: Heart,
      label: "Delivered",
      value: totalDelivered,
      hint: totalDelivered === 0 ? "your first is coming" : "to sister hands",
    },
    {
      icon: MapPin,
      label: "Communities",
      value: recipients.length,
      hint: recipients.length === 0 ? "add your first" : "active churches",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">
            Mission
          </h1>
          <p className="text-sm text-warm-gray max-w-2xl">
            One veil sold, one veil given. Match each new gift to a sister
            community, then mark it delivered when it arrives so the original
            buyer hears the story.
          </p>
        </div>
        {!live && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-warm-gray bg-cream border border-border rounded-full px-3 py-1.5">
            Demo mode · no DB connected
          </span>
        )}
      </div>

      {/* Stat tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-border-light p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wide text-warm-gray">
                {s.label}
              </span>
              <s.icon className="w-4 h-4 text-gold" />
            </div>
            <p className="text-3xl font-heading text-charcoal">{s.value}</p>
            <p className="text-xs text-warm-gray mt-1">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Pending — needs you */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl text-charcoal">
            Waiting for a home
          </h2>
          {pending.length > 0 && (
            <span className="text-xs text-burgundy bg-blush/40 px-2.5 py-1 rounded-full">
              {pending.length} pending
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-10 text-center">
            <Sparkles className="w-7 h-7 text-gold mx-auto mb-2" />
            <p className="text-sm text-charcoal mb-1">All matched up.</p>
            <p className="text-xs text-warm-gray">
              Every gift has a destination — beautiful work.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((g) => (
              <PendingGiftRow
                key={g.id}
                gift={{
                  id: g.id,
                  quantity: g.quantity,
                  created_at: g.created_at,
                  order_number: g.order_number,
                  customer_email: g.customer_email,
                }}
                recipients={recipients.map((r) => ({
                  id: r.id,
                  community: r.community,
                  city: r.city,
                  country: r.country,
                }))}
              />
            ))}
          </div>
        )}
      </section>

      {/* In flight — allocated or shipped, not yet delivered */}
      {inflight.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-xl text-charcoal">On their way</h2>
            <span className="text-xs text-warm-gray bg-cream px-2.5 py-1 rounded-full border border-border-light">
              {inflight.length}
            </span>
          </div>
          <div className="space-y-2">
            {inflight.map((g) => (
              <AllocatedGiftRow
                key={g.id}
                gift={{
                  id: g.id,
                  quantity: g.quantity,
                  status: g.status as "allocated" | "shipped",
                  allocated_at: g.allocated_at,
                  shipped_at: g.shipped_at,
                  order_number: g.order_number,
                  customer_email: g.customer_email,
                  recipient_community: g.recipient_community,
                  recipient_city: g.recipient_city,
                  recipient_country: g.recipient_country,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recipient communities */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl text-charcoal">
            Sister communities
          </h2>
          <span className="text-xs text-warm-gray">
            {recipients.length} active
          </span>
        </div>
        {recipients.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
            <MapPin className="w-7 h-7 text-soft-gray mx-auto mb-2" />
            <p className="text-sm text-charcoal mb-1">
              No communities set up yet
            </p>
            <p className="text-xs text-warm-gray max-w-sm mx-auto">
              Recipients are stored in lace.mission_recipients. Add the first
              church through Supabase Studio or ask Luz to add one for you.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recipients.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-border-light p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{r.flag_emoji ?? "🤍"}</span>
                  <p className="text-sm font-medium text-charcoal truncate">
                    {r.community}
                  </p>
                </div>
                <p className="text-xs text-warm-gray mb-3">
                  {r.city}, {r.country}
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-warm-gray">
                    Veils gifted
                  </span>
                  <span className="text-2xl font-heading text-charcoal">
                    {r.veils_gifted}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently delivered — warmth */}
      {delivered.length > 0 && (
        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">
            Recently delivered
          </h2>
          <div className="space-y-2">
            {delivered.slice(0, 5).map((g) => (
              <div
                key={g.id}
                className="bg-blush/20 border border-rose/20 rounded-2xl p-4 flex items-center gap-3"
              >
                <Heart className="w-4 h-4 text-burgundy flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal">
                    {g.quantity} veil{g.quantity === 1 ? "" : "s"} arrived in{" "}
                    <span className="font-medium">
                      {g.recipient_community ?? "the community"}
                    </span>
                    .
                  </p>
                  {g.story && (
                    <p className="text-xs text-warm-gray italic mt-0.5 line-clamp-2">
                      &ldquo;{g.story}&rdquo;
                    </p>
                  )}
                </div>
                <span className="text-xs text-warm-gray whitespace-nowrap">
                  {g.delivered_at && timeAgo(g.delivered_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 pt-6 border-t border-border-light text-center">
        <Link
          href="/mission"
          className="text-xs text-warm-gray hover:text-charcoal"
        >
          See the public mission page →
        </Link>
      </div>
    </div>
  );
}
