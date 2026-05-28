import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import GoldShimmer from "@/components/ui/GoldShimmer";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Read the story behind Lace by La Luz — a mother's mission to create beautiful veils and share them with sisters in need.",
};

export default function StoryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-b from-blush/50 via-rose/5 to-ivory border-b border-border-light overflow-hidden">
        {/* Layered backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-blush/40 via-ivory via-60% to-champagne/20" />
        <div className="absolute inset-0 lace-pattern opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/35)_0%,transparent_65%)] pointer-events-none" />

        {/* Decorative orbs — hidden on mobile */}
        <div className="hidden sm:block absolute top-16 right-[12%] w-[350px] h-[350px] rounded-full bg-rose/15 blur-[90px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 left-[8%] w-[280px] h-[280px] rounded-full bg-gold/8 blur-[80px] pointer-events-none" />

        {/* Gold border bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

        <div className="relative w-full max-w-3xl mx-auto px-4 py-28 text-center animate-fade-up">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pearl/60 backdrop-blur-sm rounded-full border border-border-light mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium">
              Our Story
            </span>
          </div>

          <div className="gold-line mx-auto mb-8" />

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl text-charcoal mb-6 leading-[1.05]">
            A Mother&apos;s Heart
            <br />
            <em className="text-burgundy italic">Behind Every Veil</em>
          </h1>

          <p className="text-lg sm:text-xl text-warm-gray leading-relaxed max-w-xl mx-auto">
            Lace by La Luz began with a simple hope: create beautiful veils and
            share beauty with women who may not have one.
          </p>
        </div>
      </section>

      {/* ── Story Content ── */}
      <section className="py-28 bg-ivory relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Founder image — layered luxury frame */}
            <Reveal direction="left">
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-rose/25 via-blush/20 to-champagne/30 blur-2xl" />
                {/* Frame accent */}
                <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-br from-rose/10 to-champagne/20 border border-border-light/50" />

                <div className="relative aspect-[4/5] rounded-[2rem] border border-white/70 shadow-[0_30px_80px_rgba(139,58,74,0.12)] overflow-hidden product-lace-trim">
                  <Image
                    src="/images/founders.jpeg"
                    alt="Our founder and her sister at La Luz del Mundo"
                    fill
                    className="object-cover object-top"
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating accent card */}
                <div className="absolute -bottom-5 -right-4 glass-card rounded-2xl px-5 py-3.5 shadow-xl">
                  <p className="text-[11px] text-burgundy font-semibold flex items-center gap-1.5 tracking-[0.05em]">
                    <Heart className="w-3 h-3 fill-burgundy" strokeWidth={1.5} />
                    Made with intention
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Story text */}
            <Reveal direction="right" delay={0.15}>
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                  The Beginning
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-3">
                  Why We Started
                </h2>
                <div className="gold-line mb-8" />

                <div className="space-y-5 text-warm-gray leading-[1.85]">
                  <p>
                    Our founder saw women preparing for worship with reverence and
                    care. She watched sisters arrive at church — some with
                    beautiful veils, some without. She noticed the quiet longing in
                    the eyes of women who wished they had one too.
                  </p>
                  <p>
                    That moment planted a seed. What if every woman could have a
                    veil that made her feel beautiful? What if purchasing one could
                    mean gifting one to someone who needed it?
                  </p>
                  <p>
                    Lace by La Luz is that promise made real. We source the finest
                    Bali lace, design each piece with intention, and ensure that
                    every order creates a ripple of generosity. One for you, one
                    for a sister you may never meet — but who will feel your love
                    through every thread.
                  </p>
                </div>

                {/* Pull quote */}
                <div className="mt-10 relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/60 via-gold/40 to-transparent rounded-full" />
                  <div className="pl-6">
                    <p className="text-charcoal font-heading text-xl italic leading-snug mb-3">
                      &ldquo;When one sister buys a veil, another sister receives one.
                      That&apos;s not just a business model — that&apos;s sisterhood.&rdquo;
                    </p>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold/70 font-medium">
                      — Our Founder
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <Link
                    href="/mission"
                    className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy/70 group transition-colors duration-300"
                  >
                    Learn About Our Mission
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider" />

      {/* ── Values ── */}
      <section className="relative bg-cream py-28 overflow-hidden">
        {/* Layered lace + glow */}
        <div className="lace-pattern absolute inset-0 opacity-[0.14] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,theme(colors.blush/20)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                What Guides Us
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
                What We Hold Close
              </h2>
              <div className="gold-line mx-auto" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Faith",
                desc: "We design with reverence. Every veil is created to honor the sacred moments it will witness.",
              },
              {
                title: "Beauty",
                desc: "Soft, feminine lace crafted with the same care as high fashion — because church ladies deserve luxury too.",
              },
              {
                title: "Sisterhood",
                desc: "Each order supports another woman. We are connected by something deeper than commerce.",
              },
              {
                title: "Dignity",
                desc: "Every woman deserves to feel seen, valued, and beautiful. That's not a luxury — it's a right.",
              },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1} direction="scale">
                <div className="luxury-card rounded-2xl p-8 group">
                  {/* Decorative top accent */}
                  <div className="h-px w-12 bg-gradient-to-r from-gold/70 to-transparent mb-6 group-hover:w-16 transition-all duration-500" />
                  <Sparkles className="w-5 h-5 text-gold mb-4" strokeWidth={1.5} />
                  <h3 className="font-heading text-xl text-charcoal mb-3">
                    {v.title}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── La Luz Del Mundo Heritage · Centennial ── */}
      <section className="relative py-28 bg-gradient-to-b from-ivory via-blush/15 to-ivory overflow-hidden">
        <div className="lace-pattern absolute inset-0 opacity-[0.12] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,theme(colors.gold/10)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Warm gold orbs */}
        <div className="hidden sm:block absolute top-10 right-[15%] w-[300px] h-[300px] rounded-full bg-gold/8 blur-[100px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 left-[10%] w-[260px] h-[260px] rounded-full bg-rose/15 blur-[90px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            {/* Centennial badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 backdrop-blur-sm rounded-full border border-gold/35 mb-8 shadow-[0_0_30px_rgba(193,150,64,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] tracking-[0.35em] uppercase text-gold-dark font-semibold">
                Centennial · 1926 – 2026
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4 leading-[1.1]">
              Celebrating 100 Years of
              <br />
              <span className="italic text-burgundy">La Luz del Mundo</span>
            </h2>
            <div className="gold-line mx-auto mb-8" />

            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6 font-medium">
              One Century · Three Generations · One Family
            </p>

            <div className="space-y-5 text-warm-gray leading-[1.9] max-w-2xl mx-auto">
              <p>
                This year marks{" "}
                <span className="text-charcoal font-medium">
                  one hundred years
                </span>{" "}
                since the founding of{" "}
                <span className="text-charcoal font-medium italic">
                  La Luz del Mundo
                </span>{" "}
                in Guadalajara, Mexico — a century of faith, prayer, and
                quiet, extraordinary sisterhood. Our family has been part of
                this community for more than fifty of those years, across
                three generations of mothers, daughters, and grandmothers.
              </p>
              <p>
                In our church, the veil is not merely fabric. It is a prayer
                expressed in thread, a posture of reverence, and a visible
                sign of the sisterhood that has bound women together for
                generations. Every piece we craft is shaped by those
                memories — the softness of our grandmother&apos;s lace, the
                quiet dignity of women preparing for worship, the tenderness
                passed from one sister to the next.
              </p>
              <p>
                Lace by La Luz is our centennial offering — our way of
                honoring a century of faith and carrying it forward. For
                every veil purchased, one is gifted to a sister in a growing
                church community, so that the next hundred years begin with
                no sister left without a veil to worship in.
              </p>
            </div>

            {/* Centennial stats ribbon */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { num: "100", label: "Years of Faith" },
                { num: "3", label: "Generations" },
                { num: "1", label: "Family Mission" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative luxury-card rounded-2xl p-5"
                >
                  <p className="font-heading text-3xl text-burgundy mb-1">
                    {stat.num}
                  </p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/80 font-medium">
              <span className="w-8 h-px bg-gold/40" />
              Faith · Beauty · Sisterhood
              <span className="w-8 h-px bg-gold/40" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Craft Section ── */}
      <section className="relative py-28 bg-ivory overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,theme(colors.champagne/20)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <Reveal direction="left">
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                  The Craft
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-3">
                  Bali Lace,
                  <br />
                  <span className="italic text-burgundy">Made with Intention</span>
                </h2>
                <div className="gold-line mb-8" />
                <div className="space-y-5 text-warm-gray leading-[1.85]">
                  <p>
                    Each veil begins with hand-selected Bali lace — fabrics chosen
                    for their delicacy, their weight, and the way they catch light
                    like something sacred.
                  </p>
                  <p>
                    We believe the details matter. The softness against your hair,
                    the drape of the fabric, the length that feels just right.
                    These are not accidents — they are decisions made with love.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Bali Lace", note: "Hand-selected fabric" },
                { label: "Each Piece", note: "Crafted with care" },
                { label: "Every Order", note: "Beautifully packaged" },
                { label: "All Styles", note: "Designed with love" },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 0.1} direction="scale">
                  <div className="luxury-card rounded-2xl p-6 text-center group">
                    <div className="h-px w-8 bg-gradient-to-r from-gold/50 to-transparent mx-auto mb-4 group-hover:w-12 transition-all duration-500" />
                    <p className="font-heading text-lg text-charcoal mb-1">{item.label}</p>
                    <p className="text-xs text-warm-gray tracking-wide">{item.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark CTA ── */}
      <section className="relative bg-gradient-to-br from-charcoal via-burgundy/90 to-charcoal py-28 overflow-hidden">
        {/* Lace overlay */}
        <div className="lace-overlay absolute inset-0 opacity-20 pointer-events-none" />
        <GoldShimmer density="normal" />

        {/* Gold border lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Warm glow orbs — hidden on mobile */}
        <div className="hidden sm:block absolute top-10 left-[20%] w-[300px] h-[300px] rounded-full bg-rose/10 blur-[100px] pointer-events-none" />
        <div className="hidden sm:block absolute bottom-10 right-[20%] w-[250px] h-[250px] rounded-full bg-gold/5 blur-[80px] pointer-events-none" />

        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Heart className="w-6 h-6 text-rose/70" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5">
              Buy one.{" "}
              <span className="text-gradient-gold italic">Give one.</span>
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-50" />
            <p className="text-rose/60 leading-relaxed mb-10 max-w-sm mx-auto text-lg">
              This is more than a purchase. It&apos;s a shared act of care between
              women across communities.
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
