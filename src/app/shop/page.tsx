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
  return (
    <ShopView products={products} collections={collections} styles={styles} />
  );
}
