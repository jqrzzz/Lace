"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { track } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants[0];
    if (!variant) return;
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: variant.color,
      slug: product.slug,
      gradient: product.placeholder.gradient,
    });
    toast(
      `${product.name} in ${variant.color} added to your bag — and one will be gifted.`,
      "success"
    );
    track("add_to_cart", {
      item_id: product.slug,
      item_name: product.name,
      price: product.price,
      color: variant.color,
      quantity: 1,
      source: "quick_add",
    });
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="luxury-card overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden">
          <div
            className={`aspect-[3/4] bg-gradient-to-br ${product.placeholder.gradient} relative transition-transform duration-700 group-hover:scale-[1.03]`}
          >
            {/* Lace texture */}
            <div className="absolute inset-0 product-lace opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/[0.06] via-transparent to-white/20" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.collection === "Limited" && (
                <span className="px-3.5 py-1.5 bg-charcoal/80 backdrop-blur-sm text-gold text-[9px] tracking-[0.2em] uppercase font-medium rounded-full border border-gold/20">
                  Limited Edition
                </span>
              )}
              {product.preOrder && (
                <span className="px-3.5 py-1.5 bg-burgundy/85 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase font-medium rounded-full border border-burgundy/30">
                  Pre-Order
                </span>
              )}
            </div>

            {/* Hover action */}
            <div className="absolute bottom-4 right-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleQuickAdd}
                className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-burgundy hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold/80 mb-1">
                {product.collection}
              </p>
              <h3 className="font-heading text-lg text-charcoal group-hover:text-burgundy transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-xs text-warm-gray mt-1">
                {product.tagline}
              </p>
            </div>
            <span className="text-base font-heading text-charcoal whitespace-nowrap pt-4">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Color swatches */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-light/60">
            <div className="flex gap-1.5">
              {product.variants.map((v) => (
                <span
                  key={v.color}
                  className="w-[14px] h-[14px] rounded-full border border-border/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
                  style={{ backgroundColor: v.colorHex }}
                  title={v.color}
                />
              ))}
            </div>
            <span className="text-[10px] text-soft-gray">
              {product.variants.length} color{product.variants.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
