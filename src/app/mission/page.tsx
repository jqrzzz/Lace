import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Gift,
  Package,
  Sparkles,
  MapPin,
  Camera,
  Bell,
  Globe,
} from "lucide-react";
import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import GoldShimmer from "@/components/ui/GoldShimmer";

export const metadata: Metadata = {
  title: "Our Mission",
  description:
    "Buy one, give one. Learn how every Lace by La Luz purchase gifts a veil to a sister in need at churches around the world.",
};

export default function MissionPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-b from-blush/50 via-rose/5 to-ivory border-b border-border-light overflow-hidden">
        {/* Layered backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-blush/40 via-ivory via-60% to-champagne/20" />
        <div className="absolute inset-0 lace-pattern opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/35)_0%,transparent_65%)] pointer-events-none" />

        {/* Decorative orbs — hidden on mobile */}
        <div className="hidden sm:block absolute top-16 left-[12%] w-[320px] h-[320px] rounded-full bg-rose/15 blur-[90px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 right-[10%] w-[260px] h-[260px] rounded-full bg-gold/8 blur-[80px] pointer-events-none" />

        {/* Gold border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

        <div className="relative w-full max-w-3xl mx-auto px-4 py-28 text-center animate-fade-up">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-border-light mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium">
              Our Mission
            </span>
          </div>

          <div className="gold-line mx-auto mb-8" />

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl text-charcoal mb-6 leading-[1.05]">
            Buy One.{" "}
            <em className="text-burgundy italic">Give One.</em>
          </h1>

          <p className="text-lg sm:text-xl text-warm-gray leading-relaxed max-w-xl mx-auto">
            Every purchase helps place a veil in the hands of a sister who needs
            one. This isn&apos;t charity — it&apos;s sisterhood.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 bg-ivory relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                Simple by Design
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
                How It Works
              </h2>
              <div className="gold-line mx-auto" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-7 mb-24">
            {[
              {
                icon: Sparkles,
                step: "01",
                title: "You Choose a Veil",
                desc: "Browse our collection and pick a style that speaks to your heart. Every veil is crafted with the same love.",
              },
              {
                icon: Package,
                step: "02",
                title: "We Prepare & Ship",
                desc: "Your veil is prepared with boutique care. Beautiful packaging, personal attention, shipped to your door.",
              },
              {
                icon: Gift,
                step: "03",
                title: "A Sister Receives One Too",
                desc: "We batch donated veils and ship them to sister church communities around the world. One for you, one for her.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.12} direction="scale">
                <div className="luxury-card rounded-2xl p-8 text-center group">
                  {/* Step number — large ghosted */}
                  <p className="font-heading text-6xl text-gold/8 mb-2 leading-none select-none group-hover:text-gold/15 transition-colors duration-500">
                    {item.step}
                  </p>
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-blush/30 border border-rose/20 flex items-center justify-center group-hover:border-rose/40 group-hover:bg-blush/40 transition-all duration-300">
                    <item.icon className="w-6 h-6 text-burgundy" strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2 font-medium">
                    Step {item.step}
                  </p>
                  <h3 className="font-heading text-xl text-charcoal mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* ── Mission Journey ── */}
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="text-center mb-14">
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                  From Purchase to Impact
                </p>
                <h3 className="font-heading text-2xl sm:text-3xl text-charcoal mb-4">
                  Your Mission Journey
                </h3>
                <div className="gold-line mx-auto" />
              </div>
            </Reveal>

            <div className="space-y-0">
              {[
                {
                  icon: Heart,
                  title: "You Purchase a Veil",
                  desc: "Instantly, a second veil is marked for donation. You'll see this in your order confirmation.",
                },
                {
                  icon: Bell,
                  title: "We Notify You",
                  desc: "Once we have enough veils, we select a destination church. You'll get an alert: \"Your gifted veil is on its way to [Church Name] in [Location].\"",
                },
                {
                  icon: MapPin,
                  title: "Veils Arrive at Their Destination",
                  desc: "We ship batches of donated veils to sister churches — startup communities in Africa, Latin America, and beyond.",
                },
                {
                  icon: Camera,
                  title: "You See the Impact",
                  desc: "You'll receive a photo and update of the sisters wearing their new veils. Real faces, real joy, real sisterhood.",
                },
              ].map((step, i) => (
                <Reveal key={step.title} delay={i * 0.1}>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-burgundy/8 border border-burgundy/15 flex items-center justify-center flex-shrink-0 hover:bg-burgundy/12 hover:border-burgundy/25 transition-all duration-300">
                        <step.icon className="w-5 h-5 text-burgundy" strokeWidth={1.5} />
                      </div>
                      {i < 3 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-border to-transparent mt-2 min-h-[2.5rem]" />
                      )}
                    </div>
                    <div className="pb-9">
                      <h4 className="font-heading text-lg text-charcoal mb-1.5">
                        {step.title}
                      </h4>
                      <p className="text-sm text-warm-gray leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="relative bg-charcoal py-24 overflow-hidden">
        {/* Lace overlay */}
        <div className="lace-overlay absolute inset-0 opacity-25 pointer-events-none" />
        <GoldShimmer density="sparse" />

        {/* Gold border lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Warm glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.gold/8)_0%,transparent_60%)] pointer-events-none" />
        <div className="hidden sm:block absolute top-10 left-[25%] w-[280px] h-[280px] rounded-full bg-rose/8 blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-[11px] tracking-[0.35em] uppercase text-gradient-gold font-medium mb-4">
                The Numbers
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl text-white mb-4">
                Growing Together
              </h2>
              <div className="gold-line mx-auto opacity-50" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-10 text-center">
            {[
              { number: "0", label: "Veils Gifted", note: "Launching soon" },
              { number: "0", label: "Churches Reached", note: "First shipment pending" },
              { number: "0", label: "Countries", note: "Global mission coming" },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.12}>
                <div>
                  <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-5" />
                  <p className="text-gradient-gold font-heading text-6xl mb-2 leading-none">
                    {stat.number}
                  </p>
                  <p className="text-white text-sm font-medium tracking-wider mb-1.5">
                    {stat.label}
                  </p>
                  <p className="text-soft-gray text-xs tracking-wide">{stat.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who Receives ── */}
      <section className="relative py-28 bg-cream overflow-hidden">
        {/* Layered backgrounds */}
        <div className="lace-pattern absolute inset-0 opacity-[0.14] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,theme(colors.blush/15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Decorative orb — hidden on mobile */}
        <div className="hidden sm:block absolute bottom-0 right-[5%] w-[300px] h-[300px] rounded-full bg-champagne/30 blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                The Giving Circle
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
                Where Every Veil Goes
              </h2>
              <div className="gold-line mx-auto" />
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-7">
            <Reveal delay={0} direction="left">
              <div className="luxury-card rounded-2xl p-9 group">
                <div className="w-12 h-12 rounded-xl bg-gold/8 border border-gold/15 flex items-center justify-center mb-5 group-hover:bg-gold/12 group-hover:border-gold/25 transition-all duration-300">
                  <Globe className="w-5 h-5 text-gold" strokeWidth={1.5} />
                </div>
                <div className="h-px w-12 bg-gradient-to-r from-gold/60 to-transparent mb-5 group-hover:w-16 transition-all duration-500" />
                <h3 className="font-heading text-2xl text-charcoal mb-4">
                  Who Receives Gifted Veils?
                </h3>
                <p className="text-warm-gray leading-[1.85] mb-4">
                  Gifted veils go to sisters at startup and growing church
                  communities — places where women worship with deep faith but may
                  not have access to quality veils.
                </p>
                <p className="text-warm-gray leading-[1.85]">
                  We work with church leaders to identify communities in need. As
                  our mission grows, we&apos;ll share every destination, every story,
                  every face transparently.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12} direction="right">
              <div className="luxury-card rounded-2xl p-9 group">
                <div className="w-12 h-12 rounded-xl bg-rose/10 border border-rose/15 flex items-center justify-center mb-5 group-hover:bg-rose/15 group-hover:border-rose/25 transition-all duration-300">
                  <Heart className="w-5 h-5 text-burgundy" strokeWidth={1.5} />
                </div>
                <div className="h-px w-12 bg-gradient-to-r from-gold/60 to-transparent mb-5 group-hover:w-16 transition-all duration-500" />
                <h3 className="font-heading text-2xl text-charcoal mb-4">
                  Why It Matters
                </h3>
                <p className="text-warm-gray leading-[1.85] mb-4">
                  A veil can be small in size but immense in meaning. For many
                  women, wearing a veil to worship is an act of devotion, dignity,
                  and identity.
                </p>
                <p className="text-warm-gray leading-[1.85]">
                  When a sister receives a beautiful veil — not a generic one, but
                  one crafted with the same love as yours — she feels seen. She
                  feels valued. She feels connected to a sisterhood that spans
                  continents.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Pull quote */}
          <Reveal delay={0.1}>
            <div className="max-w-2xl mx-auto mt-16 text-center">
              <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8" />
              <p className="font-heading text-2xl text-charcoal italic leading-snug mb-4">
                &ldquo;Every thread carries a promise — beauty shared forward,
                across continents, between sisters.&rdquo;
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Burgundy CTA ── */}
      <section className="relative bg-gradient-to-br from-burgundy via-burgundy to-burgundy/90 py-28 overflow-hidden">
        {/* Lace overlay */}
        <div className="lace-overlay absolute inset-0 opacity-15 pointer-events-none" />
        <GoldShimmer density="sparse" />

        {/* Gold border lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {/* Glow orbs — hidden on mobile */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.rose/15)_0%,transparent_65%)] pointer-events-none" />
        <div className="hidden sm:block absolute top-10 right-[20%] w-[250px] h-[250px] rounded-full bg-rose/10 blur-[80px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 left-[15%] w-[200px] h-[200px] rounded-full bg-gold/5 blur-[70px] pointer-events-none" />

        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Heart className="w-6 h-6 text-rose/80" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5">
              Share Beauty Forward
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-50" />
            <p className="text-rose/70 leading-relaxed mb-10 max-w-sm mx-auto text-lg">
              Thank you for making this mission real, one order at a time.
            </p>
            <Link
              href="/shop"
              className="btn-luxe inline-flex items-center gap-2.5 px-10 py-4 bg-white text-burgundy text-sm font-medium tracking-[0.08em] rounded-full hover:bg-ivory"
            >
              Shop Veils
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
