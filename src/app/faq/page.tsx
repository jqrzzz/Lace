import Link from "next/link";
import { ArrowRight, Heart, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Lace by La Luz veils, shipping, care, and our buy-one-give-one mission.",
};

const FAQS = [
  {
    q: "What does buy one, give one mean?",
    a: "For every veil purchased, we set aside a matching veil to gift to a sister at a church community in need. Your order directly funds the mission — no separate donations needed.",
  },
  {
    q: "What materials are your veils made from?",
    a: "Our veils are crafted from premium Bali lace — soft, lightweight, and beautifully detailed. Each piece is hand-finished with care. The lace is breathable and designed to drape gracefully.",
  },
  {
    q: "How do I choose the right veil?",
    a: "Start with the style and color that speaks to you. Our Grace and Luz veils are great starting points for a classic look. The Rosa and Hermosa feature floral details for a more feminine touch. The Esperanza is perfect for special occasions with its gold-kissed threading.",
  },
  {
    q: "What size are the veils?",
    a: "All our veils are one size with a generous drape designed to fit comfortably. They provide beautiful coverage without being restrictive.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping is 5-7 business days within the US. We offer free shipping on orders over $75. Every order arrives in our signature Lace by La Luz packaging.",
  },
  {
    q: "Do you ship internationally?",
    a: "International shipping is coming soon. Sign up for our newsletter to be the first to know when we expand.",
  },
  {
    q: "How do I care for my veil?",
    a: "Hand wash cold with gentle soap, lay flat to dry on a clean towel, and store folded in the included silk pouch. Steam lightly if needed — never iron directly on the lace.",
  },
  {
    q: "Can I return or exchange my veil?",
    a: "We want you to love your veil. If it arrives damaged or isn't what you expected, contact us within 14 days and we'll make it right. Because of our mission model, we ask that returns be for quality issues only.",
  },
  {
    q: "Who receives the gifted veils?",
    a: "Gifted veils are sent to sister church communities — often startup or growing congregations in Africa, Latin America, and other regions where women may not have access to quality veils. We work directly with church leaders to identify communities in need.",
  },
  {
    q: "Will I know where my gifted veil goes?",
    a: "Yes! Once we batch and ship donated veils, you'll receive an update with the destination church and location. Later, you'll get a photo of the sisters who received your gift.",
  },
  {
    q: "Can I donate extra veils without buying one?",
    a: "We're working on a direct donation option. For now, every purchase automatically triggers a donation. Stay tuned for more ways to give.",
  },
  {
    q: "Are pre-orders available?",
    a: "Yes! We accept pre-orders for all our veils. Your order reserves your veil and guarantees a gifted veil for the mission. Pre-order items ship as soon as they're ready.",
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/30 via-rose/5 to-ivory overflow-hidden py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/30)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4 font-medium">
            FAQ
          </p>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-5xl sm:text-6xl text-charcoal mb-6 leading-tight">
            Questions, <span className="italic text-burgundy">Answered</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our veils, shipping, care, and
            mission.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={faq.q}
                className={`group luxury-card rounded-2xl overflow-hidden animate-fade-up stagger-${Math.min((i % 4) + 1, 6)}`}
              >
                <summary className="px-6 py-5 text-[15px] font-medium text-charcoal cursor-pointer flex items-center justify-between gap-4 hover:bg-cream/30 transition-colors duration-200">
                  <span>{faq.q}</span>
                  <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center flex-shrink-0 group-hover:border-gold group-open:border-burgundy group-open:bg-burgundy/5 transition-all duration-300">
                    <Plus className="w-3.5 h-3.5 text-warm-gray group-open:rotate-45 group-open:text-burgundy transition-all duration-300" strokeWidth={1.5} />
                  </div>
                </summary>
                <div className="px-6 pb-5 border-t border-border-light/50">
                  <p className="text-sm text-warm-gray leading-[1.8] pt-4">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="relative bg-cream py-20 overflow-hidden">
        <div className="lace-pattern absolute inset-0 opacity-15 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <div className="relative max-w-2xl mx-auto px-4 text-center animate-fade-up">
          <Heart className="w-6 h-6 text-gold/50 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-4">
            Still Have Questions?
          </h2>
          <div className="gold-line mx-auto mb-5 opacity-40" />
          <p className="text-warm-gray mb-8 leading-relaxed">
            We&apos;re here for you. Reach out and we&apos;ll reply with care.
          </p>
          <Link
            href="/contact"
            className="btn-luxe inline-flex items-center gap-2.5 px-8 py-4 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
