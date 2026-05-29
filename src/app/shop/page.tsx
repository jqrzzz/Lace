import { listProducts } from "@/lib/lace/queries";
import ShopView from "./ShopView";

export const revalidate = 300;

export default async function ShopPage() {
  const products = await listProducts();
  const collections = Array.from(
    new Set(products.map((p) => p.collection).filter(Boolean)),
  );
  const styles = Array.from(
    new Set(products.map((p) => p.style).filter(Boolean)),
  );
  // Deduplicate variant colors across the catalogue. Each color shows once
  // even if multiple products carry it; the first hex we see wins so swatches
  // stay consistent across the filter row.
  const colorMap = new Map<string, string>();
  for (const p of products) {
    for (const v of p.variants) {
      if (!colorMap.has(v.color)) colorMap.set(v.color, v.colorHex);
    }
  }
  const colors = Array.from(colorMap.entries()).map(([color, colorHex]) => ({
    color,
    colorHex,
  }));
  return (
    <ShopView
      products={products}
      collections={collections}
      styles={styles}
      colors={colors}
    />
  );
}
