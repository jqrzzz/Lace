"use client";

import { Star } from "lucide-react";
import {
  getProductReviews,
  reviewAggregate,
  REVIEWS_SOURCE,
} from "@/lib/reviews";

export default function Reviews({
  productName,
  productSlug,
}: {
  productName: string;
  productSlug: string;
}) {
  const reviews = getProductReviews(productSlug);
  const agg = reviewAggregate(reviews);
  const isLive = REVIEWS_SOURCE === "live";

  if (!agg) return null;

  return (
    <section className="relative py-20 bg-cream overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="lace-pattern absolute inset-0 opacity-[0.08] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
            Sister Reviews
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-3">
            What Sisters Are{" "}
            <span className="italic text-burgundy">Saying</span>
          </h2>

          {/* Average rating */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(agg.average)
                      ? "fill-gold text-gold"
                      : "text-border"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-sm text-charcoal font-medium">
              {agg.average.toFixed(1)}
            </span>
            <span className="text-sm text-warm-gray">
              · {agg.count} review{agg.count === 1 ? "" : "s"}
            </span>
          </div>

          {/* Honesty marker — sample reviews are clearly labeled. */}
          {!isLive && (
            <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-pearl/70 border border-border-light text-[10px] tracking-[0.18em] uppercase text-warm-gray">
              Sample reviews
            </span>
          )}

          <div className="gold-line mx-auto mt-4 opacity-40" />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {reviews.map((r) => (
            <article key={r.id} className="luxury-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i <= r.rating
                          ? "fill-gold text-gold"
                          : "text-border"
                      }`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                {/* "Verified" only asserted for genuine verified purchases. */}
                {isLive && r.verified && (
                  <span className="text-[9px] tracking-[0.2em] uppercase text-gold font-semibold">
                    Verified
                  </span>
                )}
              </div>
              <h3 className="font-heading text-lg text-charcoal mb-2">
                {r.title}
              </h3>
              <p className="text-sm text-warm-gray leading-relaxed mb-4 italic">
                &ldquo;{r.body}&rdquo;
              </p>
              <div className="gold-line mb-3 opacity-30" />
              <p className="text-[12px] text-charcoal font-medium">
                {r.name}{" "}
                <span className="text-warm-gray font-normal">
                  · {r.location}
                </span>
              </p>
              <p className="text-[11px] text-warm-gray/80 mt-0.5">{r.date}</p>
            </article>
          ))}
        </div>

        <p className="text-center text-[11px] text-warm-gray/70 italic mt-10">
          {isLive
            ? `Reviews shown are from sisters who purchased the ${productName}.`
            : "Sample reviews — a preview of the stories we'll share here as sisters receive their veils."}
        </p>
      </div>
    </section>
  );
}
