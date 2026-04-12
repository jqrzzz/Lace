import Link from "next/link";
import type { Metadata } from "next";
import { Heart, MapPin, Plane, Sparkles, ArrowRight, Globe2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import GoldShimmer from "@/components/ui/GoldShimmer";
import GlobeMap from "@/components/journey/GlobeMap";
import GiftedCounter from "@/components/journey/GiftedCounter";
import {
  GIFTED_COMMUNITIES,
  TOTAL_COMMUNITIES,
  TOTAL_COUNTRIES,
  TOTAL_CONTINENTS,
  TOTAL_GIFTED,
} from "@/lib/gifted";

export const metadata: Metadata = {
  title: "The Journey · Where Every Veil Travels",
  description:
    "Trace the path of every Lace by La Luz veil — from Bali artisans, through our Guadalajara workshop, to sisters in growing church communities around the world.",
};

export default function JourneyPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-blush/30 via-rose/5 to-ivory overflow-hidden py-24 sm:py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.gold/12)_0%,transparent_65%)] pointer-events-none" />
        <GoldShimmer density="sparse" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pearl/60 backdrop-blur-sm rounded-full border border-gold/25 mb-7">
            <Globe2 className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
            <span className="text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium">
              Global Sisterhood
            </span>
          </div>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6 leading-tight">
            The Journey of <br className="hidden sm:block" />
            <span className="italic text-burgundy">Every Veil</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            From Bali artisans to sisters across the world — trace the path
            of every veil we make, and every veil we gift.
          </p>
        </div>
      </section>

      {/* ── Global Impact Counters ── */}
      <section className="relative py-20 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                Our Reach So Far
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
                A Century of Faith,{" "}
                <span className="italic text-burgundy">Shared Across Borders</span>
              </h2>
              <div className="gold-line mx-auto mt-4 opacity-40" />
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { end: TOTAL_GIFTED, label: "Veils Gifted", accent: "burgundy" as const },
              { end: TOTAL_COMMUNITIES, label: "Communities Reached", accent: "gold" as const },
              { end: TOTAL_COUNTRIES, label: "Countries", accent: "rose" as const },
              { end: TOTAL_CONTINENTS, label: "Continents", accent: "burgundy" as const },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 0.08}>
                <div className="luxury-card rounded-2xl p-6">
                  <GiftedCounter end={c.end} label={c.label} accent={c.accent} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Map ── */}
      <section className="relative py-20 bg-gradient-to-b from-ivory via-cream to-ivory overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="lace-pattern absolute inset-0 opacity-[0.08] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                Interactive Atlas
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
                Where Every Veil <span className="italic text-burgundy">Travels</span>
              </h2>
              <div className="gold-line mx-auto mb-5" />
              <p className="text-warm-gray max-w-xl mx-auto leading-relaxed">
                Each arc connects our workshop to a community of sisters who
                received a gifted veil. Click any pin to read their story.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <GlobeMap />
          </Reveal>
        </div>
      </section>

      {/* ── Three-Step Flow ── */}
      <section className="relative py-24 bg-cream overflow-hidden">
        <div className="absolute top-0 left-0 right-0 section-divider" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,theme(colors.blush/20)_0%,transparent_55%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                The Path
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
                From Thread to <span className="italic text-burgundy">Sister</span>
              </h2>
              <div className="gold-line mx-auto mt-4 opacity-40" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[60px] left-[12%] right-[12%] h-px bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40" />

            {[
              {
                step: "01",
                flag: "🇮🇩",
                icon: Sparkles,
                title: "Bali, Indonesia",
                sub: "Where the lace begins",
                desc: "Premium Bali lace is hand-selected from artisans who have woven delicate fabrics for generations.",
              },
              {
                step: "02",
                flag: "🇲🇽",
                icon: Heart,
                title: "Guadalajara, México",
                sub: "Where the veil is finished",
                desc: "Each piece is finished, blessed, and packaged in Guadalajara — the city where La Luz del Mundo was founded in 1926.",
              },
              {
                step: "03",
                flag: "🌍",
                icon: Plane,
                title: "Around the World",
                sub: "Where the gift arrives",
                desc: "For every veil purchased, one is gifted to a sister in a growing church community — across three continents and counting.",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.12}>
                <div className="relative luxury-card rounded-2xl p-7 text-center z-10 h-full">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blush/60 to-champagne/50 border border-gold/30 flex items-center justify-center mx-auto mb-4 text-2xl">
                    <span>{s.flag}</span>
                  </div>
                  <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-1 font-semibold">
                    Step {s.step}
                  </p>
                  <h3 className="font-heading text-xl text-charcoal mb-1">
                    {s.title}
                  </h3>
                  <p className="text-[11px] italic text-burgundy/80 mb-3">
                    {s.sub}
                  </p>
                  <div className="gold-line mx-auto mb-4 opacity-40" />
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gifting Stories Gallery ── */}
      <section className="relative py-24 bg-ivory overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                Stories from the Sisterhood
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
                Every Gift Has{" "}
                <span className="italic text-burgundy">a Story</span>
              </h2>
              <div className="gold-line mx-auto mb-5" />
              <p className="text-warm-gray max-w-xl mx-auto leading-relaxed">
                From Guadalajara to Nairobi, each delivery is a small
                ceremony — blessed, welcomed, and shared.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GIFTED_COMMUNITIES.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.08}>
                <article className="luxury-card rounded-2xl overflow-hidden h-full flex flex-col">
                  {/* Photo placeholder with gradient */}
                  <div
                    className={`relative aspect-[4/3] bg-gradient-to-br ${c.accentGradient} overflow-hidden`}
                  >
                    <div className="absolute inset-0 product-lace opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white/60">
                      <span className="text-sm">{c.flag}</span>
                      <span className="text-[10px] tracking-[0.2em] uppercase text-charcoal font-semibold">
                        {c.country}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[10px] tracking-[0.25em] uppercase font-medium text-white/80">
                        {c.region}
                      </p>
                      <p className="font-heading text-xl">{c.city}</p>
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-burgundy/90 text-white text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5 shadow-md">
                      <Heart className="w-3 h-3 fill-white" />
                      {c.veilsGifted} gifted
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-heading text-lg text-charcoal mb-1">
                      {c.community}
                    </h3>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-3 font-medium">
                      {new Date(c.date + "-01").toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className="gold-line mb-3 opacity-40" />
                    <p className="text-sm text-warm-gray leading-relaxed italic">
                      &ldquo;{c.story}&rdquo;
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="text-center mt-14">
              <p className="text-sm text-warm-gray mb-4 italic">
                More stories coming as each shipment arrives.
              </p>
              <Link
                href="/mission"
                className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy/70 group transition-colors"
              >
                Learn About Our Mission
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-gradient-to-br from-charcoal via-burgundy/90 to-charcoal py-24 overflow-hidden">
        <div className="lace-overlay absolute inset-0 opacity-20 pointer-events-none" />
        <GoldShimmer density="normal" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <MapPin
              className="w-8 h-8 text-gold/80 mx-auto mb-5"
              strokeWidth={1.5}
            />
            <h2 className="font-heading text-3xl sm:text-4xl text-white mb-5">
              Put a veil on the{" "}
              <span className="text-gradient-gold italic">map</span>
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-50" />
            <p className="text-rose/70 leading-relaxed mb-9 max-w-md mx-auto">
              Every purchase plants a new pin somewhere in the world — a
              sister you may never meet, but whose worship you helped make
              possible.
            </p>
            <Link
              href="/shop"
              className="btn-luxe inline-flex items-center gap-2.5 px-10 py-4 bg-white text-burgundy text-sm font-medium tracking-[0.08em] rounded-full hover:bg-ivory"
            >
              Shop & Gift a Veil
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
