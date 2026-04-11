"use client";

import { useState } from "react";
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
      <section className="bg-gradient-to-b from-blush/20 to-ivory border-b border-border-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Shop Collection
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-4">
            Veils Made with Grace
          </h1>
          <p className="text-warm-gray max-w-md mx-auto">
            Every veil purchased gifts one to a sister in need. Browse our
            collection and find yours.
          </p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilterType("all");
                  setFilterValue("");
                }}
                className={cn(
                  "px-4 py-2 text-sm rounded-full border transition-colors",
                  filterType === "all"
                    ? "bg-charcoal text-white border-charcoal"
                    : "text-warm-gray border-border hover:border-charcoal hover:text-charcoal"
                )}
              >
                All Veils
              </button>
              {COLLECTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setFilterType("collection");
                    setFilterValue(c);
                  }}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border transition-colors",
                    filterType === "collection" && filterValue === c
                      ? "bg-charcoal text-white border-charcoal"
                      : "text-warm-gray border-border hover:border-charcoal hover:text-charcoal"
                  )}
                >
                  {c}
                </button>
              ))}
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilterType("style");
                    setFilterValue(s);
                  }}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border transition-colors",
                    filterType === "style" && filterValue === s
                      ? "bg-charcoal text-white border-charcoal"
                      : "text-warm-gray border-border hover:border-charcoal hover:text-charcoal"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm border border-border rounded-xl bg-white text-charcoal focus:outline-none focus:border-gold"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-20">
              <p className="text-warm-gray">
                No veils found. Try a different filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Mission Band */}
      <section className="bg-charcoal py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl text-white mb-3">
            Buy one. Give one.
          </h2>
          <p className="text-sm text-soft-gray">
            With each veil you buy, one is gifted to a sister in need. Beauty
            shared with purpose.
          </p>
        </div>
      </section>
    </>
  );
}
