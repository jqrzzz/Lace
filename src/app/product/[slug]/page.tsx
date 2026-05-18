import { notFound } from "next/navigation";
import { getProductBySlug, listProducts } from "@/lib/lace/queries";
import ProductView from "./ProductView";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Veil not found" };
  return {
    title: `${product.name} — Lace by La Luz`,
    description: product.tagline || product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} — Lace by La Luz`,
      description: product.tagline || product.description.slice(0, 160),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await listProducts();
  const related = all.filter((p) => p.id !== product.id).slice(0, 3);

  return <ProductView product={product} related={related} />;
}
