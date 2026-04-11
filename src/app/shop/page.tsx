"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { PRODUCTS, COLLECTIONS, STYLES } from "@/lib/products";
import { cn } from "@/lib/utils";

type FilterType = "all" | "collection" | "style";

export default function ShopPage() {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilterType("all"); setFilterValue(""); }}
                className={cn(
                  "px-5 py-2.5 text-[13px] rounded-full border transition-all duration-300",
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
                    "px-5 py-2.5 text-[13px] rounded-full border transition-all duration-300",
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
                    "px-5 py-2.5 text-[13px] rounded-full border transition-all duration-300",
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
              className="px-5 py-2.5 text-[13px] border border-border rounded-full bg-white text-charcoal focus:outline-none focus:border-gold transition-colors duration-200"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {sorted.map((product, i) => (
              <div key={product.id} className={`animate-fade-up stagger-${(i % 3) + 1}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-24">
              <p className="text-warm-gray font-heading text-lg">
                No veils found. Try a different filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Mission Band */}
      <section className="relative bg-charcoal py-16 overflow-hidden">
        <div className="absolute inset-0 lace-overlay opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <Heart className="w-5 h-5 text-gold/60 mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="font-heading text-2xl sm:text-3xl text-white mb-3">
            Buy one. Give one.
          </h2>
          <div className="gold-line mx-auto mb-4 opacity-30" />
          <p className="text-sm text-soft-gray leading-relaxed">
            With each veil you buy, one is gifted to a sister in need. Beauty
            shared with purpose.
          </p>
        </div>
      </section>
    </>
  );
}
