import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <section className="bg-gradient-to-b from-blush/20 to-ivory border-b border-border-light py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            FAQ
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6">
            Questions, Answered
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto">
            Everything you need to know about our veils, shipping, care, and
            mission.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-2xl border border-border-light overflow-hidden"
              >
                <summary className="px-6 py-5 text-base font-medium text-charcoal cursor-pointer flex items-center justify-between gap-4 hover:bg-cream/30 transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-xl text-warm-gray group-open:rotate-45 transition-transform flex-shrink-0">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="bg-cream py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl text-charcoal mb-4">
            Still Have Questions?
          </h2>
          <p className="text-warm-gray mb-8">
            We&apos;re here for you. Reach out and we&apos;ll reply with care.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-burgundy text-white text-sm tracking-wide rounded-full hover:bg-burgundy/90 transition-colors"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
