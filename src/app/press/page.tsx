import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Download,
  Mail,
  Newspaper,
  Quote,
  Sparkles,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Press Kit",
  description:
    "Press and media resources for Lace by La Luz — brand story, centennial coverage, founder interviews, and high-resolution assets.",
};

const STORY_ANGLES = [
  {
    title: "The Centennial Story",
    body: "A family-founded brand marking the 100th anniversary of La Luz del Mundo (1926–2026) with a limited commemorative veil and doubled giving.",
  },
  {
    title: "Buy-One, Give-One, But Sacred",
    body: "Most BOGO brands gift socks or glasses. We gift veils — objects of worship and identity — to sisters in growing church communities around the world.",
  },
  {
    title: "Three Generations, One Stitch",
    body: "From a grandmother sewing her own veil in the 1970s to a granddaughter designing a global mission today — heritage carried in thread.",
  },
  {
    title: "Modest Luxury, Reclaimed",
    body: "Church ladies deserve the same design language as bridal couture. We treat reverence and femininity as compatible, not competing.",
  },
];

const FACTS = [
  { label: "Founded", value: "2025" },
  { label: "Headquarters", value: "Guadalajara, MX" },
  { label: "Lace Sourced From", value: "Bali, Indonesia" },
  { label: "Heritage", value: "La Luz del Mundo · 100 yrs" },
  { label: "Mission", value: "Buy One, Give One" },
  { label: "Reach", value: "3 continents" },
];

export default function PressPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/25 via-rose/5 to-ivory overflow-hidden py-24 sm:py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pearl/60 backdrop-blur-sm rounded-full border border-gold/25 mb-7">
            <Newspaper className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
            <span className="text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium">
              Press & Media
            </span>
          </div>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6 leading-tight">
            For <span className="italic text-burgundy">Press</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            Everything you need to tell our story — brand facts, angles, and
            direct contact for interviews and assets.
          </p>
        </div>
      </section>

      {/* Quick facts */}
      <section className="relative py-20 bg-ivory">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                Quick Facts
              </p>
              <h2 className="font-heading text-3xl text-charcoal">
                The Brand at a <span className="italic text-burgundy">Glance</span>
              </h2>
              <div className="gold-line mx-auto mt-4 opacity-40" />
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FACTS.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.05}>
                <div className="luxury-card rounded-xl p-5 text-center">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold font-medium mb-2">
                    {f.label}
                  </p>
                  <p className="font-heading text-lg text-charcoal">
                    {f.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story angles */}
      <section className="relative py-20 bg-cream overflow-hidden">
        <div className="lace-pattern absolute inset-0 opacity-[0.1] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                Story Angles
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
                Four Ways to Tell Our{" "}
                <span className="italic text-burgundy">Story</span>
              </h2>
              <div className="gold-line mx-auto mt-4 opacity-40" />
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {STORY_ANGLES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="luxury-card rounded-2xl p-7 h-full">
                  <Sparkles className="w-4 h-4 text-gold mb-4" strokeWidth={1.5} />
                  <h3 className="font-heading text-xl text-charcoal mb-2">
                    {s.title}
                  </h3>
                  <div className="gold-line mb-4 opacity-30" />
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="relative py-20 bg-ivory overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/18)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <Quote className="w-10 h-10 text-gold/40 mx-auto mb-5" strokeWidth={1} />
            <p className="font-heading italic text-2xl sm:text-3xl text-charcoal leading-snug mb-6">
              &ldquo;When one sister buys a veil, another sister receives one.
              That&apos;s not just a business model — that&apos;s
              sisterhood.&rdquo;
            </p>
            <p className="text-[11px] tracking-[0.25em] uppercase text-gold font-medium">
              — Our Founder
            </p>
          </Reveal>
        </div>
      </section>

      {/* Assets / Contact */}
      <section className="relative bg-gradient-to-br from-charcoal via-burgundy/85 to-charcoal py-24 overflow-hidden">
        <div className="lace-overlay absolute inset-0 opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <Reveal>
            <div className="rounded-2xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm p-7">
              <Download className="w-6 h-6 text-gold mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-xl text-white mb-2">
                Media Kit
              </h3>
              <p className="text-sm text-rose/70 leading-relaxed mb-5">
                Logos, high-resolution product photography, founder portraits,
                and brand guidelines. Available on request — we tailor the
                kit to your publication.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light group transition-colors"
              >
                Request media kit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm p-7">
              <Mail className="w-6 h-6 text-gold mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-xl text-white mb-2">
                Interviews
              </h3>
              <p className="text-sm text-rose/70 leading-relaxed mb-5">
                Our founder is available for print, podcast, and video
                interviews — especially around the La Luz del Mundo
                centennial and our buy-one-give-one mission.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light group transition-colors"
              >
                Reach out · Select &ldquo;Press / Media&rdquo;
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
