"use client";

import { PRODUCTS } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal mb-1">
            Products
          </h1>
          <p className="text-sm text-warm-gray">
            {PRODUCTS.length} veils in catalog
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white text-sm rounded-full hover:bg-burgundy/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
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
              {PRODUCTS.map((product) => (
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
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
