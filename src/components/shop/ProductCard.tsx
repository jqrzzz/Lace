"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const cart = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: product.variants[0].color,
      slug: product.slug,
      gradient: product.placeholder.gradient,
    });
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-border-light bg-white">
        {/* Image placeholder */}
        <div
          className={`aspect-[3/4] bg-gradient-to-br ${product.placeholder.gradient} relative`}
        >
          {/* Lace texture overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8)_0%,transparent_50%)] bg-[length:30px_30px]" />

          {/* Collection badge */}
          {product.collection === "Limited" && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-gold text-charcoal text-[10px] tracking-widest uppercase font-medium rounded-full">
              Limited
            </span>
          )}

          {/* Quick add button */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-burgundy hover:text-white shadow-lg"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading text-lg text-charcoal group-hover:text-burgundy transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-warm-gray mt-0.5">
                {product.tagline}
              </p>
            </div>
            <span className="text-base font-medium text-charcoal whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Color swatches */}
          <div className="flex gap-1.5 mt-3">
            {product.variants.map((v) => (
              <span
                key={v.color}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: v.colorHex }}
                title={v.color}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
