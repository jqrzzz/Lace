import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";
import { listProducts } from "@/lib/lace/queries";
import { isLaceDbConfigured, getLaceDb } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Tiny helper to know which products are archived. listProducts returns
// the Product shape but doesn't expose `active`; we pull a small set
// of slugs separately and intersect.
async function archivedSlugs(): Promise<Set<string>> {
  const db = getLaceDb();
  if (!db) return new Set();
  const { data } = await db
    .from("products")
    .select("slug")
    .eq("active", false);
  return new Set(((data ?? []) as Array<{ slug: string }>).map((r) => r.slug));
}

export default async function AdminProductsPage() {
  const [products, archived] = await Promise.all([
    listProducts({ activeOnly: false }),
    archivedSlugs(),
  ]);
  const live = isLaceDbConfigured();

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">
            Products
          </h1>
          <p className="text-sm text-warm-gray">
            {products.length} veil{products.length === 1 ? "" : "s"} in your
            catalog.
            {archived.size > 0 && (
              <>
                {" "}
                <span className="text-warm-gray/80">
                  ({archived.size} archived)
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!live && (
            <span className="text-[10px] uppercase tracking-[0.18em] text-warm-gray bg-cream border border-border rounded-full px-3 py-1.5">
              Demo mode · no DB connected
            </span>
          )}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left px-6 py-4 text-xs text-warm-gray uppercase tracking-wide font-medium">
                  Product
                </th>
                <th className="text-left px-6 py-4 text-xs text-warm-gray uppercase tracking-wide font-medium">
                  Collection
                </th>
                <th className="text-left px-6 py-4 text-xs text-warm-gray uppercase tracking-wide font-medium">
                  Style
                </th>
                <th className="text-left px-6 py-4 text-xs text-warm-gray uppercase tracking-wide font-medium">
                  Price
                </th>
                <th className="text-left px-6 py-4 text-xs text-warm-gray uppercase tracking-wide font-medium">
                  Variants
                </th>
                <th className="text-right px-6 py-4 text-xs text-warm-gray uppercase tracking-wide font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isArchived = archived.has(product.slug);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border-light last:border-0 hover:bg-cream/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${product.placeholder.gradient} flex-shrink-0`}
                        />
                        <div>
                          <Link
                            href={`/admin/products/${encodeURIComponent(product.slug)}/edit`}
                            className="text-sm font-medium text-charcoal hover:text-burgundy"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-warm-gray">
                            {product.tagline}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs bg-cream rounded-full text-warm-gray">
                        {product.collection}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-warm-gray">
                      {product.style}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {product.variants.map((v) => (
                          <span
                            key={v.color}
                            className="w-5 h-5 rounded-full border border-border"
                            style={{ backgroundColor: v.colorHex }}
                            title={v.color}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isArchived && (
                          <span className="text-[10px] uppercase tracking-[0.18em] bg-amber-50 border border-amber-200 text-amber-900 rounded-full px-2.5 py-1">
                            Archived
                          </span>
                        )}
                        <Link
                          href={`/admin/products/${encodeURIComponent(product.slug)}/edit`}
                          className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                          title="Edit"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {!isArchived && (
                          <Link
                            href={`/product/${product.slug}`}
                            className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                            title="View on storefront"
                            aria-label={`View ${product.name} on storefront`}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-warm-gray mt-4 text-center">
        Variants and product photos are still edited in Supabase Studio —
        inline variant CRUD lands alongside image upload in a follow-up.
      </p>
    </div>
  );
}
