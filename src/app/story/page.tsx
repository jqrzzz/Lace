import Link from "next/link";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Read the story behind Lace by La Luz — a mother's mission to create beautiful veils and share them with sisters in need.",
};

export default function StoryPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blush/20 to-ivory border-b border-border-light py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Our Story
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6">
            A Mother&apos;s Heart
            <br />
            Behind Every Veil
          </h1>
          <p className="text-lg text-warm-gray leading-relaxed max-w-xl mx-auto">
            Lace by La Luz began with a simple hope: create beautiful veils and
            share beauty with women who may not have one.
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-rose/20 via-blush/30 to-champagne/20 border border-border-light flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-10 h-10 text-rose-gold/40 mx-auto mb-2" />
                <p className="text-sm text-warm-gray/60 tracking-widest uppercase">
                  Founder photo
                </p>
                <p className="text-xs text-warm-gray/40 mt-1">Coming soon</p>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-3xl text-charcoal mb-6">
                Why We Started
              </h2>
              <div className="space-y-4 text-warm-gray leading-relaxed">
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
                <p className="text-charcoal font-medium italic font-heading text-lg">
                  &ldquo;When one sister buys a veil, another sister receives one.
                  That&apos;s not just a business model — that&apos;s sisterhood.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              What Guides Us
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
              What We Hold Close
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            ].map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl border border-border-light p-6"
              >
                <Sparkles className="w-5 h-5 text-gold mb-3" />
                <h3 className="font-heading text-xl text-charcoal mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl text-white mb-4">
            Buy one. Give one.
          </h2>
          <p className="text-soft-gray mb-8">
            This is more than a purchase. It&apos;s a shared act of care between
            women across communities.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-charcoal text-sm font-medium tracking-wide rounded-full hover:bg-gold-light transition-colors"
          >
            Shop Veils
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
