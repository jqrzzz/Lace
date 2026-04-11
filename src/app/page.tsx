"use client";

import Link from "next/link";
import { ArrowRight, Heart, Gift, Package, Sparkles } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { PRODUCTS } from "@/lib/products";

const FEATURED = PRODUCTS.slice(0, 3);

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blush/40 via-ivory to-champagne/40" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,#2C2527_1px,transparent_1px)] bg-[length:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium mb-4">
                Lace by La Luz
              </p>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-charcoal leading-[1.05] mb-6">
                Elegant Veils,
                <br />
                <span className="text-burgundy italic">Shared with Purpose</span>
              </h1>
              <p className="text-lg text-warm-gray leading-relaxed mb-8 max-w-md">
                Handcrafted Bali lace veils created to honor beauty, faith, and
                sisterhood. For every veil you buy, one is gifted to a sister in
                need.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-burgundy text-white text-sm tracking-wide rounded-full hover:bg-burgundy/90 transition-colors"
                >
                  Shop the Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/mission"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-charcoal/20 text-charcoal text-sm tracking-wide rounded-full hover:bg-charcoal hover:text-white transition-colors"
                >
                  Our Mission
                </Link>
              </div>
              <p className="mt-8 text-sm font-medium text-charcoal flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-gold fill-rose-gold" />
                Buy one. Give one. Share beauty with a sister in need.
              </p>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-rose/30 via-blush/50 to-champagne/40 border border-border-light shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)] bg-[length:40px_40px]" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gold/40 mx-auto mb-3" />
                    <p className="text-sm text-warm-gray/60 tracking-widest uppercase">
                      Product photography
                    </p>
                    <p className="text-xs text-warm-gray/40 mt-1">Coming soon</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-5 py-3 border border-border-light">
                <p className="text-xs text-gold font-medium tracking-wide uppercase">
                  Free Shipping
                </p>
                <p className="text-[10px] text-warm-gray">On orders over $75</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Band */}
      <section className="bg-charcoal text-pearl py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              Our Promise
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl text-white">
              How Buy One, Give One Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                step: "01",
                title: "You Choose a Veil",
                desc: "Select a style that reflects your grace and personal expression.",
              },
              {
                icon: Package,
                step: "02",
                title: "We Prepare Yours with Care",
                desc: "Boutique attention to every detail, from lace to packaging.",
              },
              {
                icon: Gift,
                step: "03",
                title: "We Gift One to a Sister",
                desc: "Your purchase helps us send a veil to a woman at a sister church who needs one.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                  Step {item.step}
                </p>
                <h3 className="font-heading text-xl text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-soft-gray leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
                Curated for You
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
                Featured Veils
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-warm-gray"
            >
              View All Veils
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Founder Preview */}
      <section className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-rose/20 via-blush/30 to-champagne/20 border border-border-light flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-10 h-10 text-rose-gold/40 mx-auto mb-2" />
                <p className="text-sm text-warm-gray/60 tracking-widest uppercase">
                  Founder photo
                </p>
                <p className="text-xs text-warm-gray/40 mt-1">Coming soon</p>
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
                Our Story
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-6">
                From the Heart
                <br />
                of a Mother
              </h2>
              <p className="text-warm-gray leading-relaxed mb-4">
                Lace by La Luz began with a simple desire — to create beautiful
                veils that honor reverence while supporting women who may not
                have one of their own.
              </p>
              <p className="text-warm-gray leading-relaxed mb-8">
                Every thread carries a promise: when one sister buys a veil,
                another sister receives one. This isn&apos;t just fashion — it&apos;s
                faith in action, beauty shared forward.
              </p>
              <Link
                href="/story"
                className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy/80 transition-colors"
              >
                Read Our Full Story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Lace by La Luz */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              The Difference
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl text-charcoal">
              Why Lace by La Luz
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Sacred Luxury",
                desc: "Premium presentation meets reverent purpose. Feel beautiful, always.",
              },
              {
                title: "Bali Lace Quality",
                desc: "Hand-selected fabrics with intricate detail that lasts for years.",
              },
              {
                title: "Meaningful Mission",
                desc: "Every purchase sends a veil to a sister church community in need.",
              },
              {
                title: "Made with Love",
                desc: "From packaging to delivery, every detail is intentional and personal.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-border-light p-6 text-center hover:shadow-lg hover:border-rose/30 transition-all"
              >
                <h3 className="font-heading text-lg text-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-burgundy to-burgundy/90 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Heart className="w-8 h-8 text-rose/60 mx-auto mb-4" />
          <h2 className="font-heading text-3xl sm:text-4xl text-white mb-4">
            Give Beauty Forward
          </h2>
          <p className="text-rose/80 mb-8 leading-relaxed">
            Every veil you purchase helps gift one to a sister who needs it.
            Together, we&apos;re building a community of grace.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-burgundy text-sm font-medium tracking-wide rounded-full hover:bg-ivory transition-colors"
          >
            Shop the Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
