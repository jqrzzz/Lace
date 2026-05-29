"use client";

import { useEffect, useState } from "react";
import { variantGradient, type Product } from "@/lib/products";

interface HeroProductRotatorProps {
  products: Product[];
  intervalMs?: number;
}

export default function HeroProductRotator({
  products,
  intervalMs = 4500,
}: HeroProductRotatorProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (products.length <= 1 || isPaused || reduceMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [products.length, intervalMs, isPaused, reduceMotion]);

  if (products.length === 0) return null;

  return (
    <div
      className="aspect-[3/4] rounded-[2rem] border border-white/60 shadow-[0_30px_80px_rgba(139,58,74,0.12)] overflow-hidden relative product-lace-trim"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured veils"
    >
      {products.map((p, i) => (
        <div
          key={p.id}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ backgroundImage: variantGradient(p.variants) }}
          aria-hidden={i !== index}
        >
          <div className="absolute inset-0 product-lace opacity-40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/45 via-transparent to-white/15 pointer-events-none" />
          <div className="product-night-scrim" aria-hidden="true" />
          <div className="absolute inset-0 flex items-center justify-center px-10">
            <div className="text-center">
              <p className="text-[10px] tracking-[0.32em] uppercase text-gold-dark font-medium mb-4">
                {p.collection} Collection
              </p>
              <h3 className="font-heading text-[2rem] leading-tight text-charcoal mb-3">
                {p.name}
              </h3>
              <p className="text-sm text-warm-gray italic mb-7 max-w-[16rem] mx-auto leading-relaxed">
                {p.tagline}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                {p.variants.map((v) => (
                  <span
                    key={v.color}
                    className="w-3 h-3 rounded-full border border-charcoal/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]"
                    style={{ backgroundColor: v.colorHex }}
                    title={v.color}
                  />
                ))}
              </div>
              <div className="w-10 h-px bg-charcoal/25 mx-auto mb-4" />
              <p className="font-heading text-2xl text-burgundy">
                ${p.price}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {products.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index
                ? "w-8 bg-charcoal/55"
                : "w-1.5 bg-charcoal/20 hover:bg-charcoal/35"
            }`}
            aria-label={`Show ${p.name}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </div>
  );
}
