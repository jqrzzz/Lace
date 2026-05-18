export interface ProductVariant {
  color: string;
  colorHex: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  collection: string;
  style: string;
  preOrder: boolean;
  variants: ProductVariant[];
  features: string[];
  care: string[];
  placeholder: {
    gradient: string;
    accent: string;
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "grace-veil",
    slug: "grace-veil",
    name: "Grace Veil",
    tagline: "Timeless ivory elegance",
    description:
      "Our signature piece. The Grace Veil features hand-finished Bali lace with a delicate scalloped edge. Designed for women who carry themselves with quiet confidence and deep reverence. Lightweight, breathable, and beautiful enough to become an heirloom.",
    price: 49,
    collection: "Signature",
    style: "Classic Lace",
    preOrder: true,
    variants: [
      { color: "Ivory", colorHex: "#FFFAF0", inStock: true },
      { color: "Pearl White", colorHex: "#F5F0EB", inStock: true },
      { color: "Champagne", colorHex: "#F0E6DB", inStock: true },
    ],
    features: [
      "Hand-finished Bali lace",
      "Scalloped edge detail",
      "Lightweight & breathable",
      "One size — generous drape",
    ],
    care: [
      "Hand wash cold with gentle soap",
      "Lay flat to dry on a clean towel",
      "Store folded in the included silk pouch",
      "Steam lightly if needed — do not iron directly",
    ],
    placeholder: {
      gradient: "from-amber-50 via-orange-50 to-yellow-50",
      accent: "bg-amber-100",
    },
  },
  {
    id: "rosa-veil",
    slug: "rosa-veil",
    name: "Rosa Veil",
    tagline: "Soft blush with floral whisper",
    description:
      "The Rosa Veil brings a subtle warmth to your worship. Crafted with blush-toned lace featuring a delicate rose-petal motif woven throughout. For the woman who loves soft femininity with meaning.",
    price: 52,
    collection: "Signature",
    style: "Floral Lace",
    preOrder: true,
    variants: [
      { color: "Blush", colorHex: "#F5E1E6", inStock: true },
      { color: "Dusty Rose", colorHex: "#D4A0A8", inStock: true },
      { color: "Soft Pink", colorHex: "#F0D0D8", inStock: true },
    ],
    features: [
      "Rose-petal lace motif",
      "Soft blush tones",
      "Gentle drape & coverage",
      "One size — generous fit",
    ],
    care: [
      "Hand wash cold with gentle soap",
      "Lay flat to dry on a clean towel",
      "Store folded in the included silk pouch",
      "Steam lightly if needed — do not iron directly",
    ],
    placeholder: {
      gradient: "from-pink-50 via-rose-50 to-pink-100",
      accent: "bg-pink-100",
    },
  },
  {
    id: "serena-veil",
    slug: "serena-veil",
    name: "Serena Veil",
    tagline: "Cathedral-length classic",
    description:
      "Named for serenity itself. The Serena Veil offers an extended drape inspired by cathedral tradition. Rich lace detailing meets modern comfort — for the woman who wants presence and grace in equal measure.",
    price: 56,
    collection: "Signature",
    style: "Classic Lace",
    preOrder: true,
    variants: [
      { color: "Cream", colorHex: "#FDF5EE", inStock: true },
      { color: "Ivory", colorHex: "#FFFAF0", inStock: true },
    ],
    features: [
      "Extended cathedral-length drape",
      "Intricate lace border detail",
      "Premium weight fabric",
      "One size — generous coverage",
    ],
    care: [
      "Hand wash cold with gentle soap",
      "Lay flat to dry on a clean towel",
      "Store folded in the included silk pouch",
      "Steam lightly if needed — do not iron directly",
    ],
    placeholder: {
      gradient: "from-stone-50 via-amber-50 to-stone-100",
      accent: "bg-stone-100",
    },
  },
  {
    id: "luz-veil",
    slug: "luz-veil",
    name: "Luz Veil",
    tagline: "Pure white radiance",
    description:
      "The Luz Veil — named for light itself. Pure white Bali lace with a clean, modern edge. No embellishment, just beautiful simplicity. For the woman who lets her faith speak louder than her accessories.",
    price: 49,
    collection: "Essentials",
    style: "Minimal",
    preOrder: true,
    variants: [
      { color: "White", colorHex: "#FFFFFF", inStock: true },
      { color: "Snow", colorHex: "#FAFAFA", inStock: true },
    ],
    features: [
      "Clean modern edge finish",
      "Pure Bali lace",
      "Ultra-lightweight",
      "One size — classic drape",
    ],
    care: [
      "Hand wash cold with gentle soap",
      "Lay flat to dry on a clean towel",
      "Store folded in the included silk pouch",
      "Steam lightly if needed — do not iron directly",
    ],
    placeholder: {
      gradient: "from-gray-50 via-white to-gray-50",
      accent: "bg-gray-100",
    },
  },
  {
    id: "esperanza-veil",
    slug: "esperanza-veil",
    name: "Esperanza Veil",
    tagline: "Woven with hope",
    description:
      "Esperanza means hope — and this veil carries that promise in every thread. A warm ivory base with gold-kissed lace threading that catches light beautifully. For celebrations, special services, and moments that matter.",
    price: 58,
    collection: "Limited",
    style: "Embellished",
    preOrder: true,
    variants: [
      { color: "Gold Ivory", colorHex: "#F5ECD7", inStock: true },
      { color: "Warm Gold", colorHex: "#E8D5A8", inStock: true },
    ],
    features: [
      "Gold-kissed lace threading",
      "Warm ivory base",
      "Special occasion weight",
      "One size — elegant drape",
    ],
    care: [
      "Hand wash cold with gentle soap",
      "Lay flat to dry on a clean towel",
      "Store folded in the included silk pouch",
      "Do not wring — handle with care",
    ],
    placeholder: {
      gradient: "from-yellow-50 via-amber-50 to-orange-50",
      accent: "bg-yellow-100",
    },
  },
  {
    id: "hermosa-veil",
    slug: "hermosa-veil",
    name: "Hermosa Veil",
    tagline: "Beautiful in every language",
    description:
      "Hermosa — beautiful. This veil combines our finest floral lace with a generous mantilla-style cut. Designed for the woman who wants to feel covered in beauty from head to heart. A bestseller in the making.",
    price: 54,
    collection: "Signature",
    style: "Floral Lace",
    preOrder: true,
    variants: [
      { color: "Ivory Floral", colorHex: "#FFF8F0", inStock: true },
      { color: "Blush Floral", colorHex: "#F8E4E8", inStock: true },
      { color: "Cream Floral", colorHex: "#F5EDE4", inStock: true },
    ],
    features: [
      "Mantilla-style generous cut",
      "All-over floral lace pattern",
      "Soft rolled edges",
      "One size — full coverage drape",
    ],
    care: [
      "Hand wash cold with gentle soap",
      "Lay flat to dry on a clean towel",
      "Store folded in the included silk pouch",
      "Steam lightly if needed — do not iron directly",
    ],
    placeholder: {
      gradient: "from-rose-50 via-pink-50 to-amber-50",
      accent: "bg-rose-100",
    },
  },
];

// Catalog reads go through @/lib/lace/queries.ts (listProducts /
// getProductBySlug) — the PRODUCTS const above is kept as the demo
// fallback used when SUPABASE_SERVICE_ROLE_KEY isn't set, and as the
// source of truth for the seed data in
// supabase/migrations/0006_lace_seed.sql.
