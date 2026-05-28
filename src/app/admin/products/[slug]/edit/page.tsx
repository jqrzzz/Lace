import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/lace/queries";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).toLowerCase();

  // getProductBySlug only returns active rows. If it misses, look in
  // the full catalog (activeOnly:false) so archived products are
  // still editable from this page.
  const active = await getProductBySlug(slug);
  let editable = active;
  if (!editable) {
    const all = await listProducts({ activeOnly: false });
    editable = all.find((p) => p.slug === slug) ?? null;
  }
  if (!editable) notFound();
  const isActive = active !== null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All products
        </Link>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl text-charcoal mb-1">
              {editable.name}
            </h1>
            <p className="text-sm text-warm-gray">
              {isActive
                ? "Live on the storefront."
                : "Archived — hidden from the shop until restored."}
            </p>
          </div>
          {!isActive && (
            <span className="text-[10px] uppercase tracking-[0.18em] bg-amber-50 border border-amber-200 text-amber-900 rounded-full px-3 py-1.5">
              Archived
            </span>
          )}
        </div>
      </div>

      <ProductForm mode="edit" initial={editable} isActive={isActive} />
    </div>
  );
}
