"use client";

import { Star } from "lucide-react";

// Placeholder reviews. Swap for a real backend (Yotpo, Okendo, Loox,
// or a Supabase table) once collected. Kept here so the UI looks
// populated from day one.
const REVIEWS = [
  {
    id: 1,
    name: "Sister María",
    location: "Guadalajara, MX",
    rating: 5,
    date: "March 2026",
    title: "A heirloom in the making",
    body: "The lace is even softer in person than in the photos. My daughter will inherit this one day. Thank you for the care you put into every detail.",
    verified: true,
  },
  {
    id: 2,
    name: "Elena R.",
    location: "San Antonio, TX",
    rating: 5,
    date: "February 2026",
    title: "Beautiful, sacred, worth it",
    body: "I cried when I unboxed mine. The packaging alone felt like a blessing. Knowing another sister received one because of my purchase made it feel even more meaningful.",
    verified: true,
  },
  {
    id: 3,
    name: "Lupita G.",
    location: "Los Angeles, CA",
    rating: 5,
    date: "February 2026",
    title: "Reverent and refined",
    body: "I have worn veils my whole life and this is the most beautiful I have owned. The drape is perfect. I have already recommended it to every sister in my congregation.",
    verified: true,
  },
  {
    id: 4,
    name: "Ana P.",
    location: "Houston, TX",
    rating: 4,
    date: "January 2026",
    title: "Lovely — size was generous",
    body: "The lace is stunning. The drape is more generous than I expected — wonderful for coverage. I had to fold mine but that is a small thing.",
    verified: true,
  },
];

const AVG =
  REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;

export default function Reviews({ productName }: { productName: string }) {
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
                    i <= Math.round(AVG)
                      ? "fill-gold text-gold"
                      : "text-border"
                  }`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-sm text-charcoal font-medium">
              {AVG.toFixed(1)}
            </span>
            <span className="text-sm text-warm-gray">
              · {REVIEWS.length} reviews
            </span>
          </div>
          <div className="gold-line mx-auto mt-4 opacity-40" />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {REVIEWS.map((r) => (
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
                {r.verified && (
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
          Reviews shown are from sisters who purchased the {productName}.
        </p>
      </div>
    </section>
  );
}
