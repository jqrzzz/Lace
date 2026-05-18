import Link from "next/link";
import { Eye } from "lucide-react";
import { listProducts } from "@/lib/lace/queries";
import { isLaceDbConfigured } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProducts({ activeOnly: false });
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
          </p>
        </div>
        {!live && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-warm-gray bg-cream border border-border rounded-full px-3 py-1.5">
            Demo mode · no DB connected
          </span>
        )}
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
              {products.map((product) => (
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
                        <p className="text-sm font-medium text-charcoal">
                          {product.name}
                        </p>
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
                      <Link
                        href={`/product/${product.slug}`}
                        className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                        title="View on storefront"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-warm-gray mt-4 text-center">
        Catalog edits land via Supabase Studio for now — admin add/edit/archive
        UI is on the roadmap.
      </p>
    </div>
  );
}
