import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Briefcase,
  Heart,
  Package,
  Sparkles,
  Users,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Carry Lace by La Luz in your boutique, church shop, or bridal store. Our wholesale program brings handcrafted Bali lace veils — and our buy-one-give-one mission — to your customers.",
};

const BENEFITS = [
  {
    icon: Package,
    title: "Luxury-Tier Product",
    body: "Premium hand-selected Bali lace, hand-finished in Guadalajara, arriving in signature packaging ready for retail.",
  },
  {
    icon: Heart,
    title: "A Mission Story",
    body: "Every veil sold gifts another to a sister in need. Give your customers a product with meaning behind the price tag.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    body: "A single point of contact for orders, reorders, merchandising guides, and seasonal updates.",
  },
  {
    icon: Sparkles,
    title: "Exclusive Access",
    body: "Early access to limited editions, including our 1926–2026 centennial commemorative veil.",
  },
];

export default function WholesalePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/30 via-rose/5 to-ivory overflow-hidden py-24 sm:py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-gold/25 mb-7">
            <Briefcase className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
            <span className="text-[10px] tracking-[0.35em] uppercase text-gold-dark font-medium">
              Wholesale
            </span>
          </div>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6 leading-tight">
            Carry Lace by La Luz in{" "}
            <span className="italic text-burgundy">Your Store</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            Handcrafted veils, a century of heritage, and a mission that
            resonates. Bring Lace by La Luz to your customers.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-20 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
                Why Partner With Us
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
                More Than a Product —{" "}
                <span className="italic text-burgundy">A Story</span>
              </h2>
              <div className="gold-line mx-auto mt-4 opacity-40" />
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08} direction="scale">
                <div className="luxury-card rounded-2xl p-6 h-full">
                  <div className="h-px w-10 bg-gradient-to-r from-gold/70 to-transparent mb-5" />
                  <b.icon className="w-5 h-5 text-gold mb-4" strokeWidth={1.5} />
                  <h3 className="font-heading text-lg text-charcoal mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {b.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who we partner with */}
      <section className="relative py-20 bg-cream overflow-hidden">
        <div className="lace-pattern absolute inset-0 opacity-[0.12] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
              Our Retail Partners
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-6">
              We&apos;re Looking For
            </h2>
            <div className="gold-line mx-auto mb-10 opacity-40" />
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              {[
                "Bridal & wedding boutiques",
                "Church & faith-based retailers",
                "Luxury gift & lifestyle shops",
                "Modest fashion boutiques",
                "Museum & cultural store shops",
                "Curated online retailers",
              ].map((t) => (
                <div
                  key={t}
                  className="luxury-card rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-[9px] flex-shrink-0" />
                  <p className="text-sm text-charcoal">{t}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA — Contact */}
      <section className="relative bg-gradient-to-br from-charcoal via-burgundy/90 to-charcoal py-24 overflow-hidden">
        <div className="lace-overlay absolute inset-0 opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <Briefcase className="w-7 h-7 text-gold/80 mx-auto mb-5" strokeWidth={1.5} />
            <h2 className="font-heading text-3xl sm:text-4xl text-white mb-5">
              Let&apos;s{" "}
              <span className="text-gradient-gold italic">build together</span>
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-50" />
            <p className="text-rose/70 leading-relaxed mb-9 max-w-md mx-auto">
              Reach out with your store details and a few words about your
              customers. We&apos;ll send our linesheet and answer any
              questions about minimums and timelines.
            </p>
            <Link
              href="/contact"
              className="btn-luxe inline-flex items-center gap-2.5 px-9 py-4 bg-white text-burgundy text-sm font-medium tracking-[0.08em] rounded-full hover:bg-ivory"
            >
              Request Wholesale Access
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <p className="text-[11px] text-rose/50 mt-5">
              Choose &ldquo;Wholesale Inquiry&rdquo; in the subject menu.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
