// Gifted community registry — source of truth for the Journey / Reach page.
// Coordinates are plotted on a Robinson-ish world map. x is 0..1 (left→right),
// y is 0..1 (top→bottom) where (0.5, 0.5) is roughly the Atlantic at the equator.
// These are visual placeholders until real GPS data is wired in.

export interface MapPoint {
  x: number; // 0..1 horizontal on the map svg
  y: number; // 0..1 vertical on the map svg
}

export interface GiftedCommunity {
  id: string;
  country: string;
  flag: string; // emoji flag
  city: string;
  community: string; // church / congregation name
  region: "Africa" | "Latin America" | "Asia" | "North America" | "Europe" | "Oceania";
  veilsGifted: number;
  date: string; // YYYY-MM human-readable month
  story: string; // short paragraph
  point: MapPoint;
  accentGradient: string; // tailwind gradient for card
}

export const ORIGIN = {
  label: "Bali, Indonesia",
  sublabel: "Where every veil begins",
  description:
    "Our lace is hand-selected in Bali, where generations of artisans craft the delicate fabrics that become our veils.",
  point: { x: 0.775, y: 0.6 } as MapPoint,
};

export const WORKSHOP = {
  label: "Guadalajara, México",
  sublabel: "Where every veil is finished",
  description:
    "Each piece is hand-finished and packaged in Guadalajara — the city where La Luz del Mundo was founded a century ago.",
  point: { x: 0.235, y: 0.47 } as MapPoint,
};

export const GIFTED_COMMUNITIES: GiftedCommunity[] = [
  {
    id: "mx-gdl",
    country: "México",
    flag: "🇲🇽",
    city: "Guadalajara",
    community: "Hermana Iglesia Central",
    region: "Latin America",
    veilsGifted: 42,
    date: "2026-02",
    story:
      "Our first gifting, to the mother community in Guadalajara. Forty-two sisters received veils during the centennial prayer service.",
    point: { x: 0.235, y: 0.47 },
    accentGradient: "from-rose/30 via-blush/25 to-champagne/30",
  },
  {
    id: "sv-ss",
    country: "El Salvador",
    flag: "🇸🇻",
    city: "San Salvador",
    community: "Congregación Luz de Vida",
    region: "Latin America",
    veilsGifted: 18,
    date: "2026-03",
    story:
      "A small congregation in the hills welcomed eighteen veils, one for each of their newly baptized sisters.",
    point: { x: 0.265, y: 0.53 },
    accentGradient: "from-mauve/25 via-rose/20 to-blush/30",
  },
  {
    id: "co-bog",
    country: "Colombia",
    flag: "🇨🇴",
    city: "Bogotá",
    community: "Hermanas de Bogotá",
    region: "Latin America",
    veilsGifted: 24,
    date: "2026-03",
    story:
      "Twenty-four veils arrived in Bogotá just before Holy Week — blessed by the pastor and shared with elder sisters first.",
    point: { x: 0.3, y: 0.58 },
    accentGradient: "from-blush/30 via-rose/20 to-rose-gold/25",
  },
  {
    id: "pe-lim",
    country: "Perú",
    flag: "🇵🇪",
    city: "Lima",
    community: "Iglesia de Lima",
    region: "Latin America",
    veilsGifted: 15,
    date: "2026-04",
    story:
      "A coastal congregation where many sisters had never owned a veil of their own — fifteen received theirs with tears of joy.",
    point: { x: 0.29, y: 0.65 },
    accentGradient: "from-champagne/30 via-blush/20 to-mauve/20",
  },
  {
    id: "ke-nai",
    country: "Kenya",
    flag: "🇰🇪",
    city: "Nairobi",
    community: "Sisters of Nairobi",
    region: "Africa",
    veilsGifted: 30,
    date: "2026-02",
    story:
      "Thirty veils were gifted at a growing congregation in Nairobi — the first Lace by La Luz shipment to the African continent.",
    point: { x: 0.58, y: 0.59 },
    accentGradient: "from-gold/20 via-champagne/30 to-rose/20",
  },
  {
    id: "ng-lag",
    country: "Nigeria",
    flag: "🇳🇬",
    city: "Lagos",
    community: "Lagos Sisterhood",
    region: "Africa",
    veilsGifted: 22,
    date: "2026-03",
    story:
      "Twenty-two sisters in Lagos received veils ahead of their centennial celebration service.",
    point: { x: 0.51, y: 0.57 },
    accentGradient: "from-rose-gold/25 via-blush/25 to-gold/15",
  },
  {
    id: "za-joh",
    country: "South Africa",
    flag: "🇿🇦",
    city: "Johannesburg",
    community: "Johannesburg Congregation",
    region: "Africa",
    veilsGifted: 16,
    date: "2026-04",
    story:
      "A young congregation in Johannesburg — sixteen veils for sixteen sisters preparing for their first communion service.",
    point: { x: 0.57, y: 0.74 },
    accentGradient: "from-champagne/25 via-rose/15 to-rose-gold/20",
  },
  {
    id: "ph-man",
    country: "Philippines",
    flag: "🇵🇭",
    city: "Manila",
    community: "Hermanas de Manila",
    region: "Asia",
    veilsGifted: 28,
    date: "2026-03",
    story:
      "The Manila sisters welcomed twenty-eight veils — many hand-delivered by church members returning from abroad.",
    point: { x: 0.82, y: 0.56 },
    accentGradient: "from-blush/30 via-mauve/20 to-rose-gold/25",
  },
  {
    id: "in-che",
    country: "India",
    flag: "🇮🇳",
    city: "Chennai",
    community: "Chennai Sisters in Faith",
    region: "Asia",
    veilsGifted: 20,
    date: "2026-04",
    story:
      "A small, devoted community in Chennai — twenty veils for twenty sisters, each chosen by lot during morning prayer.",
    point: { x: 0.7, y: 0.58 },
    accentGradient: "from-gold/15 via-champagne/25 to-blush/25",
  },
];

export const TOTAL_GIFTED = GIFTED_COMMUNITIES.reduce(
  (sum, c) => sum + c.veilsGifted,
  0
);

export const TOTAL_COUNTRIES = new Set(
  GIFTED_COMMUNITIES.map((c) => c.country)
).size;

export const TOTAL_COMMUNITIES = GIFTED_COMMUNITIES.length;

export const TOTAL_CONTINENTS = new Set(
  GIFTED_COMMUNITIES.map((c) => c.region)
).size;
