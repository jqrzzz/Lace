import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Gift, Package, Sparkles } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import HeroProductRotator from "@/components/shop/HeroProductRotator";
import { listProducts } from "@/lib/lace/queries";
import Reveal from "@/components/ui/Reveal";
import GoldShimmer from "@/components/ui/GoldShimmer";

export const revalidate = 300;

export default async function HomePage() {
  const FEATURED = (await listProducts()).slice(0, 3);
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blush/50 via-ivory via-60% to-champagne/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent to-transparent" />
        <div className="absolute inset-0 lace-pattern opacity-40" />

        {/* Gold shimmer particles */}
        <GoldShimmer density="sparse" />

        {/* Decorative orbs — hidden on mobile to prevent overflow */}
        <div className="hidden sm:block absolute top-20 right-[15%] w-[400px] h-[400px] rounded-full bg-rose/20 blur-[100px] animate-float" />
        <div className="hidden sm:block absolute bottom-20 left-[10%] w-[300px] h-[300px] rounded-full bg-gold/10 blur-[80px] animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-0 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="max-w-xl animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pearl/60 backdrop-blur-sm rounded-full border border-border-light mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-shimmer" />
                <span className="text-[11px] tracking-[0.2em] uppercase text-gold-dark font-medium">
                  Lace by La Luz
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[4.5rem] text-charcoal leading-[1.05] mb-6">
                Elegant Veils,
                <br />
                <span className="text-burgundy italic">Shared with Purpose</span>
              </h1>

              <div className="gold-line mb-6 opacity-60" />

              <p className="text-lg text-warm-gray leading-relaxed mb-10 max-w-md">
                Handcrafted Bali lace veils created to honor beauty, faith, and
                sisterhood. For every veil you buy, one is gifted to a sister in
                need.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/shop"
                  className="btn-luxe inline-flex items-center gap-2.5 px-8 py-4 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full"
                >
                  Shop the Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/mission"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/70 backdrop-blur-sm border border-charcoal/10 text-charcoal text-sm tracking-[0.04em] rounded-full hover:bg-white hover:border-charcoal/20 hover:shadow-lg transition-all duration-300"
                >
                  Our Mission
                </Link>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex -space-x-1">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-rose to-blush border-2 border-ivory" />
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-champagne to-gold-light border-2 border-ivory" />
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-pearl to-cream border-2 border-ivory" />
                </div>
                <p className="text-warm-gray">
                  <span className="font-medium text-charcoal">Buy one. Give one.</span>{" "}
                  Share beauty with a sister.
                </p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <HeroProductRotator products={FEATURED} />

              {/* Floating badges */}
              <div className="absolute -bottom-5 -left-5 glass-card rounded-2xl px-5 py-3.5 animate-float">
                <p className="text-[11px] text-gold-dark font-semibold tracking-[0.08em] uppercase">
                  Free Shipping
                </p>
                <p className="text-[10px] text-warm-gray mt-0.5">On orders over $75</p>
              </div>
              <div className="absolute -top-3 -right-3 glass-card rounded-2xl px-4 py-3 animate-float" style={{ animationDelay: "2s" }}>
                <p className="text-[10px] text-burgundy font-semibold flex items-center gap-1.5">
                  <Heart className="w-3 h-3 fill-burgundy" />
                  Buy 1, Give 1
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lace Divider ── */}
      <div className="section-divider" />

      {/* ── Mission Band ── */}
      <section className="relative bg-charcoal text-pearl py-24 overflow-hidden">
        <div className="absolute inset-0 lace-overlay opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <GoldShimmer density="sparse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[11px] tracking-[0.35em] uppercase text-gradient-gold font-medium mb-4">
                Our Promise
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
                How Buy One, Give One Works
              </h2>
              <div className="gold-line mx-auto mt-5" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-10 lg:gap-16">
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
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.12} direction="up">
                <div className="text-center group">
                  <div className="w-[72px] h-[72px] mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 flex items-center justify-center group-hover:border-gold/40 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.15)] transition-all duration-500">
                    <item.icon className="w-6 h-6 text-gold" strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] tracking-[0.35em] uppercase text-gold/80 mb-3 font-medium">
                    Step {item.step}
                  </p>
                  <h3 className="font-heading text-xl text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-soft-gray leading-relaxed max-w-[280px] mx-auto">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Collection ── */}
      <section className="py-24 lg:py-32 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium mb-3">
                  Curated for You
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-charcoal">
                  Featured Veils
                </h2>
                <div className="gold-line mt-4 opacity-50" />
              </div>
              <Link
                href="/shop"
                className="hidden sm:inline-flex items-center gap-2 text-sm text-warm-gray hover:text-burgundy group transition-colors duration-300"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {FEATURED.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.1} direction="up">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          <div className="sm:hidden mt-10 text-center">
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

      {/* ── Founder Preview ── */}
      <section className="relative bg-cream py-24 overflow-hidden">
        <div className="absolute inset-0 lace-pattern opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <Reveal direction="left">
              <div className="relative aspect-[4/5] rounded-[2rem] border border-border-light/60 shadow-[0_20px_60px_rgba(44,37,39,0.06)] overflow-hidden product-lace-trim">
                <Image
                  src="/images/founders.jpeg"
                  alt="Our founder and her sister at La Luz del Mundo"
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/15 via-transparent to-transparent pointer-events-none" />
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.15}>
              <div>
                <p className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium mb-3">
                  Our Story
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4">
                  From the Heart
                  <br />
                  <span className="italic text-burgundy">of a Mother</span>
                </h2>
                <div className="gold-line mb-6 opacity-50" />
                <p className="text-warm-gray leading-[1.8] mb-4">
                  Lace by La Luz began with a simple desire — to create beautiful
                  veils that honor reverence while supporting women who may not
                  have one of their own.
                </p>
                <p className="text-warm-gray leading-[1.8] mb-8">
                  Every thread carries a promise: when one sister buys a veil,
                  another sister receives one. This isn&apos;t just fashion — it&apos;s
                  faith in action, beauty shared forward.
                </p>
                <Link
                  href="/story"
                  className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy/80 group transition-colors duration-300"
                >
                  Read Our Full Story
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Why Lace by La Luz ── */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 section-divider" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium mb-3">
                The Difference
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4">
                Why Lace by La Luz
              </h2>
              <div className="gold-line mx-auto mt-4 opacity-50" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: "✦",
                title: "Sacred Luxury",
                desc: "Premium presentation meets reverent purpose. Feel beautiful, always.",
              },
              {
                icon: "❋",
                title: "Bali Lace Quality",
                desc: "Hand-selected fabrics with intricate detail that lasts for years.",
              },
              {
                icon: "♡",
                title: "Meaningful Mission",
                desc: "Every purchase sends a veil to a sister church community in need.",
              },
              {
                icon: "✿",
                title: "Made with Love",
                desc: "From packaging to delivery, every detail is intentional and personal.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1} direction="scale">
                <div className="luxury-card p-7 text-center">
                  <span className="text-2xl text-gold block mb-4">{item.icon}</span>
                  <h3 className="font-heading text-lg text-charcoal mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative bg-gradient-to-br from-charcoal via-burgundy/90 to-charcoal py-28 overflow-hidden">
        <div className="absolute inset-0 lace-overlay opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <GoldShimmer density="normal" />
        <div className="hidden sm:block absolute top-10 left-[20%] w-[300px] h-[300px] rounded-full bg-rose/10 blur-[100px]" />
        <div className="hidden sm:block absolute bottom-10 right-[20%] w-[250px] h-[250px] rounded-full bg-gold/5 blur-[80px]" />

        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Heart className="w-6 h-6 text-rose/70" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-5">
              Give Beauty Forward
            </h2>
            <div className="gold-line mx-auto mb-6 opacity-40" />
            <p className="text-rose/60 mb-10 leading-relaxed text-lg">
              Every veil you purchase helps gift one to a sister who needs it.
              Together, we&apos;re building a community of grace.
            </p>
            <Link
              href="/shop"
              className="btn-luxe inline-flex items-center gap-2.5 px-10 py-4 bg-white text-burgundy text-sm font-medium tracking-[0.06em] rounded-full hover:bg-ivory"
            >
              Shop the Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
