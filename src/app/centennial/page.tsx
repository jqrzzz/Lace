import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Crown,
  Church,
  Calendar,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import GoldShimmer from "@/components/ui/GoldShimmer";

export const metadata: Metadata = {
  title: "Centennial · 100 Years of La Luz del Mundo",
  description:
    "Celebrating one hundred years (1926–2026) of La Luz del Mundo. Discover our commemorative centennial edition and the story behind a century of faith, beauty, and sisterhood.",
};

const TIMELINE = [
  {
    year: "1926",
    title: "A Community Begins",
    body: "La Luz del Mundo is founded in Guadalajara, México. A small gathering of believers — the first seeds of what will become a global community.",
  },
  {
    year: "1950s",
    title: "Veils in Worship",
    body: "The veil becomes a treasured expression of reverence in worship — a quiet language of faith passed from mother to daughter.",
  },
  {
    year: "1970s",
    title: "Our Family Joins",
    body: "Our grandmother becomes part of the church. She sews her own veil, a piece our mother still keeps folded in tissue.",
  },
  {
    year: "1990s",
    title: "Second Generation",
    body: "Our mother is raised in the faith — her first veil gifted by her mother, a thread unbroken across decades.",
  },
  {
    year: "2020s",
    title: "Lace by La Luz Begins",
    body: "A daughter's dream: to share the beauty of the veil with sisters around the world who have none. One for you, one for a sister.",
  },
  {
    year: "2026",
    title: "A Century of Faith",
    body: "We celebrate one hundred years. Our centennial edition — a single, limited commemorative veil — honors every sister who has worshipped before us.",
  },
];

export default function CentennialPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-charcoal via-burgundy/70 to-charcoal overflow-hidden">
        <div className="lace-overlay absolute inset-0 opacity-25 pointer-events-none" />
        <GoldShimmer density="dense" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.burgundy/30)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        {/* Warm orbs */}
        <div className="hidden sm:block absolute top-10 right-[15%] w-[400px] h-[400px] rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 left-[10%] w-[340px] h-[340px] rounded-full bg-rose/10 blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-4xl mx-auto px-4 py-24 text-center animate-fade-up">
          {/* Century seal */}
          <div className="inline-flex flex-col items-center gap-2 mb-8">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold-dark/40 border border-gold/60 flex items-center justify-center shadow-[0_0_40px_rgba(224,180,112,0.25)]">
              <div className="absolute inset-2 rounded-full border border-gold/30" />
              <Crown className="w-9 h-9 text-gold-light" strokeWidth={1.3} />
            </div>
            <span className="text-[10px] tracking-[0.4em] uppercase text-gold font-semibold">
              1926 · 2026
            </span>
          </div>

          <div className="gold-line mx-auto mb-8 opacity-80" />

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-8xl text-white mb-6 leading-[1.05]">
            One Hundred
            <br />
            <span className="text-gradient-gold italic">Years of Light</span>
          </h1>

          <p className="text-lg sm:text-xl text-rose/70 leading-relaxed max-w-2xl mx-auto mb-10">
            A century since the founding of La Luz del Mundo in Guadalajara —
            a century of faith, prayer, beauty, and quiet sisterhood. We
            celebrate with a single, limited commemorative veil.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#commemorative"
              className="btn-luxe inline-flex items-center gap-2.5 px-9 py-4 bg-white text-burgundy text-sm font-medium tracking-[0.08em] rounded-full hover:bg-ivory"
            >
              Commemorative Edition
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="#timeline"
              className="inline-flex items-center gap-2.5 px-9 py-4 border border-gold/40 text-gold hover:bg-gold/10 text-sm tracking-[0.08em] rounded-full transition-colors"
            >
              Our Timeline
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Ribbon ── */}
      <section className="relative bg-ivory py-16 border-b border-border-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "100", label: "Years of Faith", icon: Crown },
              { num: "1926", label: "Guadalajara, MX", icon: Church },
              { num: "3", label: "Generations", icon: Heart },
              { num: "∞", label: "Sisterhood", icon: Sparkles },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="luxury-card rounded-2xl p-6 text-center">
                  <s.icon className="w-5 h-5 text-gold mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-heading text-4xl text-burgundy mb-1">
                    {s.num}
                  </p>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-warm-gray font-medium">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section id="timeline" className="relative py-24 bg-cream overflow-hidden">
        <div className="lace-pattern absolute inset-0 opacity-[0.12] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                A Century in Thread
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
                Our <span className="italic text-burgundy">Timeline</span>
              </h2>
              <div className="gold-line mx-auto" />
            </div>
          </Reveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent sm:-translate-x-1/2" />

            <div className="space-y-10">
              {TIMELINE.map((e, i) => {
                const left = i % 2 === 0;
                return (
                  <Reveal key={e.year} delay={i * 0.06} direction={left ? "left" : "right"}>
                    <div
                      className={`relative pl-16 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-10 sm:items-center ${
                        left ? "" : "sm:[&>*:first-child]:order-2"
                      }`}
                    >
                      {/* Dot */}
                      <div className="absolute left-6 sm:left-1/2 w-3 h-3 rounded-full bg-gold shadow-[0_0_0_4px_rgba(224,180,112,0.2)] sm:-translate-x-1/2 top-3" />

                      <div className={left ? "sm:text-right sm:pr-10" : "sm:pl-10"}>
                        <p className="font-heading text-3xl text-burgundy mb-1">
                          {e.year}
                        </p>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
                          {e.title}
                        </p>
                      </div>
                      <div className={left ? "sm:pl-10" : "sm:pr-10 sm:text-right"}>
                        <div className="luxury-card rounded-2xl p-5 inline-block text-left max-w-md">
                          <p className="text-sm text-warm-gray leading-relaxed">
                            {e.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Commemorative Edition ── */}
      <section id="commemorative" className="relative py-28 bg-ivory overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,theme(colors.gold/10)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <Reveal direction="left">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold/25 via-rose/15 to-champagne/30 blur-2xl" />
                <div className="relative aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-champagne/40 via-gold/15 to-blush/30 border border-gold/30 overflow-hidden">
                  <div className="absolute inset-0 product-lace opacity-40" />
                  <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal/85 backdrop-blur-sm border border-gold/30">
                    <Sparkles className="w-3 h-3 text-gold" strokeWidth={1.5} />
                    <span className="text-[9px] tracking-[0.25em] uppercase text-gold font-semibold">
                      Centennial Edition
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Crown className="w-10 h-10 text-gold/50 mx-auto mb-3" strokeWidth={1.3} />
                      <p className="text-[11px] tracking-[0.25em] uppercase text-warm-gray/60">
                        Commemorative photo
                      </p>
                      <p className="text-[10px] text-warm-gray/40 mt-1">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.1}>
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                  The Centennial Veil
                </p>
                <h2 className="font-heading text-3xl sm:text-5xl text-charcoal mb-3 leading-[1.05]">
                  One Hundred. <br />
                  <span className="italic text-burgundy">One Edition.</span>
                </h2>
                <div className="gold-line mb-7" />

                <div className="space-y-4 text-warm-gray leading-[1.85]">
                  <p>
                    To honor a century of faith, we&apos;ve created a single
                    limited veil — crafted from the finest Bali lace and
                    hand-embroidered with a subtle gold thread inscribed{" "}
                    <span className="italic text-charcoal">1926 · 2026</span>.
                  </p>
                  <p>
                    Only one hundred pieces will be made. Each is numbered,
                    blessed, and packaged in a commemorative silk pouch with
                    a letter from our family. For every edition sold, two
                    veils are gifted — doubling our mission in this
                    once-in-a-century year.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    "Numbered 1/100 through 100/100",
                    "Hand-inscribed gold thread — 1926 · 2026",
                    "Commemorative silk pouch + family letter",
                    "Doubles the gift: 2 veils gifted per purchase",
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-[9px] flex-shrink-0" />
                      <p className="text-sm text-charcoal">{f}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="btn-luxe inline-flex items-center gap-2.5 px-8 py-3.5 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full"
                  >
                    Reserve the Edition
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href="/story"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-charcoal text-charcoal text-sm tracking-[0.06em] rounded-full hover:bg-charcoal hover:text-white transition-colors"
                  >
                    Read Our Story
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Heritage CTA ── */}
      <section className="relative bg-gradient-to-b from-ivory via-blush/15 to-ivory py-24 overflow-hidden">
        <div className="lace-pattern absolute inset-0 opacity-[0.12] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <Calendar className="w-7 h-7 text-gold mx-auto mb-5" strokeWidth={1.5} />
            <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
              Here&apos;s to the{" "}
              <span className="italic text-burgundy">next hundred</span>
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-50" />
            <p className="text-warm-gray leading-relaxed mb-9 max-w-md mx-auto">
              May the next century be as full of light, sisterhood, and grace
              as the one behind us.
            </p>
            <Link
              href="/journey"
              className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy/70 group transition-colors"
            >
              See our global reach
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
