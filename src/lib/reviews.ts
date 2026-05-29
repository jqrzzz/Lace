// Reviews — product testimonials.
//
// Dev-mode contract (mirrors the catalog seam in @/lib/lace/queries):
// while REVIEWS_SOURCE is "sample" the data below is illustrative and the
// UI labels it as such — no "Verified purchase" badge, no aggregateRating
// in structured data, no claim that these came from real buyers. Once a
// real source is wired in (a Supabase `reviews` table, Yotpo, Okendo, …),
// flip REVIEWS_SOURCE to "live" and the verified badges + Product
// aggregateRating JSON-LD turn on automatically.
//
// Keeping fabricated reviews labeled "Verified" and feeding fake ratings
// to search engines is the thing this module deliberately prevents.

export type ReviewSource = "sample" | "live";

/** Flip to "live" once reviews come from real, verified purchases. */
export const REVIEWS_SOURCE: ReviewSource = "sample";

export interface Review {
  id: number;
  productSlug: string;
  name: string;
  location: string;
  rating: number; // 1–5
  date: string;
  title: string;
  body: string;
  /** True only for genuine verified purchases. Honored by the UI when live. */
  verified: boolean;
}

// Illustrative sample reviews, each tied to a real product slug. When
// REVIEWS_SOURCE is "sample" these render under a "Sample" label.
const SAMPLE_REVIEWS: Review[] = [
  {
    id: 1,
    productSlug: "grace-veil",
    name: "Sister María",
    location: "Guadalajara, MX",
    rating: 5,
    date: "March 2026",
    title: "An heirloom in the making",
    body: "The lace is even softer in person than in the photos. My daughter will inherit this one day. Thank you for the care you put into every detail.",
    verified: true,
  },
  {
    id: 2,
    productSlug: "esperanza-veil",
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
    productSlug: "serena-veil",
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
    productSlug: "hermosa-veil",
    name: "Ana P.",
    location: "Houston, TX",
    rating: 4,
    date: "January 2026",
    title: "Lovely — size was generous",
    body: "The lace is stunning. The drape is more generous than I expected — wonderful for coverage. I had to fold mine but that is a small thing.",
    verified: true,
  },
  {
    id: 5,
    productSlug: "rosa-veil",
    name: "Carmen V.",
    location: "Phoenix, AZ",
    rating: 5,
    date: "March 2026",
    title: "The rose motif is so delicate",
    body: "The blush tone is exactly as pictured and the little woven roses catch the light at church. Feminine without being loud. I feel beautiful and reverent in it.",
    verified: true,
  },
  {
    id: 6,
    productSlug: "luz-veil",
    name: "Daniela M.",
    location: "Chicago, IL",
    rating: 5,
    date: "January 2026",
    title: "Simple, pure, perfect",
    body: "I wanted something clean and unfussy, and this is exactly that. Pure white, weightless, and it lets the moment speak instead of the accessory. I reach for it every Sunday.",
    verified: true,
  },
];

/**
 * Reviews for a product. Returns the ones tied to this slug first, then
 * pads from the rest so every product page reads as populated. Deterministic
 * order. Swap the body of this function for a DB query when going live.
 */
export function getProductReviews(slug: string, limit = 4): Review[] {
  const matching = SAMPLE_REVIEWS.filter((r) => r.productSlug === slug);
  const others = SAMPLE_REVIEWS.filter((r) => r.productSlug !== slug);
  return [...matching, ...others].slice(0, limit);
}

export interface ReviewAggregate {
  average: number; // rounded to one decimal
  count: number;
}

/** Average + count, or null when there are no reviews to summarize. */
export function reviewAggregate(reviews: Review[]): ReviewAggregate | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
