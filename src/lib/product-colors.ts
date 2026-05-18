// Color name → hex code map for variant swatches.
//
// The lace.product_variants table stores variant_name (the color
// string) but not the hex. Storing it as a column for every variant
// would mean a migration plus admin UI to manage palettes. Since
// the brand palette is small and stable, we keep the lookup in
// code. New colors added to the catalog should land here too.
//
// Falls back to a soft neutral when a color name isn't recognized,
// so the swatch always renders.

const COLOR_HEX: Record<string, string> = {
  // Ivory family
  Ivory: "#FFFAF0",
  "Pearl White": "#F5F0EB",
  Champagne: "#F0E6DB",
  Cream: "#FDF5EE",
  "Cream Floral": "#F5EDE4",
  White: "#FFFFFF",
  Snow: "#FAFAFA",
  "Ivory Floral": "#FFF8F0",
  // Blush / rose
  Blush: "#F5E1E6",
  "Blush Floral": "#F8E4E8",
  "Dusty Rose": "#D4A0A8",
  "Soft Pink": "#F0D0D8",
  // Gold
  "Gold Ivory": "#F5ECD7",
  "Warm Gold": "#E8D5A8",
};

export function colorHexFor(name: string): string {
  return COLOR_HEX[name] ?? "#EDE5DA";
}
