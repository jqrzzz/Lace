"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { PRODUCTS, COLLECTIONS, STYLES } from "@/lib/products";
import { cn } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";

type FilterType = "all" | "collection" | "style";

function ShopContent() {
  const searchParams = useSearchParams();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    const collection = searchParams.get("collection");
    const style = searchParams.get("style");
    if (collection && COLLECTIONS.includes(collection)) {
      setFilterType("collection");
      setFilterValue(collection);
    } else if (style && STYLES.includes(style)) {
      setFilterType("style");
      setFilterValue(style);
    }
  }, [searchParams]);

  const filtered =
    filterType === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) =>
          filterType === "collection"
            ? p.collection === filterValue
            : p.style === filterValue
        );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/30 via-blush/10 to-ivory overflow-hidden">
        <div className="absolute inset-0 lace-pattern opacity-25" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-up">
          <p className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium mb-4">
            Shop Collection
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-4">
            Veils Made with <span className="italic text-burgundy">Grace</span>
          </h1>
          <div className="gold-line mx-auto mt-4 mb-5 opacity-50" />
          <p className="text-warm-gray max-w-md mx-auto leading-relaxed">
            Every veil purchased gifts one to a sister in need. Browse our
            collection and find yours.
          </p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
            {/* Horizontally scrollable filter pills on mobile */}
            <div className="flex gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-2 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => { setFilterType("all"); setFilterValue(""); }}
                className={cn(
                  "px-5 py-2.5 text-[13px] rounded-full border transition-all duration-300 whitespace-nowrap flex-shrink-0",
                  filterType === "all"
                    ? "bg-charcoal text-white border-charcoal shadow-[0_4px_12px_rgba(44,37,39,0.2)]"
                    : "text-warm-gray border-border hover:border-charcoal hover:text-charcoal bg-white"
                )}
              >
                All Veils
              </button>
              {COLLECTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setFilterType("collection"); setFilterValue(c); }}
                  className={cn(
                    "px-5 py-2.5 text-[13px] rounded-full border transition-all duration-300 whitespace-nowrap flex-shrink-0",
                    filterType === "collection" && filterValue === c
                      ? "bg-charcoal text-white border-charcoal shadow-[0_4px_12px_rgba(44,37,39,0.2)]"
                      : "text-warm-gray border-border hover:border-charcoal hover:text-charcoal bg-white"
                  )}
                >
                  {c}
                </button>
              ))}
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilterType("style"); setFilterValue(s); }}
                  className={cn(
                    "px-5 py-2.5 text-[13px] rounded-full border transition-all duration-300 whitespace-nowrap flex-shrink-0",
                    filterType === "style" && filterValue === s
                      ? "bg-charcoal text-white border-charcoal shadow-[0_4px_12px_rgba(44,37,39,0.2)]"
                      : "text-warm-gray border-border hover:border-charcoal hover:text-charcoal bg-white"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-2.5 text-[13px] border border-border rounded-full bg-white text-charcoal focus:outline-none focus:border-gold transition-colors duration-200 self-start sm:self-auto"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {sorted.map((product, i) => (
              <Reveal key={product.id} delay={(i % 3) * 0.1} direction="up">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-24 animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="w-7 h-7 text-rose-gold" strokeWidth={1.5} />
              </div>
              <p className="font-heading text-xl text-charcoal mb-2">
                No veils match this filter
              </p>
              <p className="text-sm text-warm-gray mb-6">
                Try a different filter or browse all veils.
              </p>
              <button
                onClick={() => { setFilterType("all"); setFilterValue(""); }}
                className="btn-luxe inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
              >
                View All Veils
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Mission Band */}
      <section className="relative bg-charcoal py-16 overflow-hidden">
        <div className="absolute inset-0 lace-overlay opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <Reveal>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <Heart className="w-5 h-5 text-gold/60 mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="font-heading text-2xl sm:text-3xl text-white mb-3">
              Buy one. Give one.
            </h2>
            <div className="gold-line mx-auto mb-4 opacity-30" />
            <p className="text-sm text-soft-gray leading-relaxed mb-6">
              With each veil you buy, one is gifted to a sister in need. Beauty
              shared with purpose.
            </p>
            <Link
              href="/mission"
              className="text-sm text-gold hover:text-gold-light transition-colors duration-300"
            >
              Learn more about our mission →
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
