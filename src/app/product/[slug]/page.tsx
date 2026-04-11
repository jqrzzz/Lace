"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";
import { getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatPrice, cn } from "@/lib/utils";
import ProductCard from "@/components/shop/ProductCard";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProduct(slug);
  const cart = useCart();

  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h1 className="font-heading text-3xl text-charcoal mb-4">
          Veil Not Found
        </h1>
        <Link href="/shop" className="text-burgundy hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const variant = product.variants[selectedColor];
  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      cart.addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        color: variant.color,
        slug: product.slug,
        gradient: product.placeholder.gradient,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-warm-gray mb-8">
            <Link href="/" className="hover:text-charcoal transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/shop"
              className="hover:text-charcoal transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-charcoal">{product.name}</span>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collection
          </Link>

          {/* Product Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Gallery */}
            <div>
              <div
                className={`aspect-[3/4] rounded-3xl bg-gradient-to-br ${product.placeholder.gradient} border border-border-light overflow-hidden relative`}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)] bg-[length:40px_40px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-10 h-10 text-charcoal/20 mx-auto mb-2" />
                    <p className="text-sm text-warm-gray/60 tracking-widest uppercase">
                      Photo coming soon
                    </p>
                  </div>
                </div>
                {product.collection === "Limited" && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-gold text-charcoal text-[10px] tracking-widest uppercase font-medium rounded-full">
                    Limited Edition
                  </span>
                )}
              </div>

              {/* Thumbnail row */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${product.placeholder.gradient} border border-border-light opacity-70`}
                  />
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="lg:py-4">
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
                {product.collection} Collection
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-warm-gray mb-1">{product.tagline}</p>
              <p className="text-2xl font-heading text-charcoal mb-6">
                {formatPrice(product.price)}
              </p>

              <p className="text-warm-gray leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Color selector */}
              <div className="mb-6">
                <p className="text-sm font-medium text-charcoal mb-3">
                  Color —{" "}
                  <span className="text-warm-gray font-normal">
                    {variant.color}
                  </span>
                </p>
                <div className="flex gap-3">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.color}
                      onClick={() => setSelectedColor(i)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all relative",
                        selectedColor === i
                          ? "border-burgundy scale-110"
                          : "border-border hover:border-charcoal"
                      )}
                      style={{ backgroundColor: v.colorHex }}
                      title={v.color}
                    >
                      {selectedColor === i && (
                        <Check className="w-4 h-4 text-burgundy absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <p className="text-sm font-medium text-charcoal mb-3">Size</p>
                <div className="inline-flex px-4 py-2.5 border border-charcoal rounded-full text-sm text-charcoal">
                  One Size — Generous Drape
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-sm font-medium text-charcoal mb-3">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 text-sm tracking-wide rounded-full transition-all",
                    added
                      ? "bg-green-700 text-white"
                      : "bg-burgundy text-white hover:bg-burgundy/90"
                  )}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart —{" "}
                      {formatPrice(product.price * quantity)}
                    </>
                  )}
                </button>
                <button className="w-12 h-12 border border-border rounded-full flex items-center justify-center text-warm-gray hover:text-burgundy hover:border-burgundy transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Mission Note */}
              <div className="bg-blush/40 rounded-2xl px-5 py-4 mb-8 border border-rose/20">
                <p className="text-sm text-burgundy font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-burgundy" />
                  With this purchase, {quantity} veil
                  {quantity > 1 ? "s" : ""} will be gifted to a sister in need
                </p>
                <p className="text-xs text-warm-gray mt-1">
                  You&apos;ll receive updates on where your gifted veil is sent
                </p>
              </div>

              {/* Details accordion */}
              <div className="space-y-3">
                {[
                  {
                    title: "Features",
                    items: product.features,
                  },
                  {
                    title: "Care Instructions",
                    items: product.care,
                  },
                  {
                    title: "Shipping",
                    items: [
                      "Free shipping on orders over $75",
                      "Standard delivery: 5-7 business days",
                      "Arrives in signature Lace by La Luz packaging",
                    ],
                  },
                ].map((section) => (
                  <details
                    key={section.title}
                    className="group border border-border-light rounded-xl overflow-hidden"
                  >
                    <summary className="px-5 py-3.5 text-sm font-medium text-charcoal cursor-pointer flex items-center justify-between hover:bg-cream/50 transition-colors">
                      {section.title}
                      <Plus className="w-4 h-4 text-warm-gray group-open:rotate-45 transition-transform" />
                    </summary>
                    <ul className="px-5 pb-4 space-y-1.5">
                      {section.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-warm-gray flex items-start gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-gold mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl text-charcoal mb-8">
            You May Also Love
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
