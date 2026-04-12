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
  Share2,
} from "lucide-react";
import { getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatPrice, cn } from "@/lib/utils";
import ProductCard from "@/components/shop/ProductCard";
import Reveal from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/Toast";
import Reviews from "@/components/shop/Reviews";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProduct(slug);
  const cart = useCart();
  const { toast } = useToast();

  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-7 h-7 text-rose-gold" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-3xl text-charcoal mb-3">
          Veil Not Found
        </h1>
        <p className="text-warm-gray mb-6">This veil may have been moved or is no longer available.</p>
        <Link
          href="/shop"
          className="btn-luxe inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
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

  // Product JSON-LD for rich results. Price is in cents internally,
  // schema.org wants a decimal string in the product's currency.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: "Lace by La Luz" },
    sku: product.id,
    category: `Veils > ${product.collection}`,
    material: "Bali lace",
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: product.preOrder
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
      url: `/product/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "4",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[13px] text-warm-gray mb-6">
            <Link href="/" className="hover:text-charcoal transition-colors duration-200">Home</Link>
            <span className="text-border">/</span>
            <Link href="/shop" className="hover:text-charcoal transition-colors duration-200">Shop</Link>
            <span className="text-border">/</span>
            <span className="text-charcoal">{product.name}</span>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[13px] text-warm-gray hover:text-charcoal group transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={1.5} />
            Back to Collection
          </Link>

          {/* Product Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery */}
            <Reveal direction="left">
              <div>
                <div
                  className={`aspect-[3/4] rounded-[2rem] bg-gradient-to-br ${product.placeholder.gradient} border border-border-light/50 overflow-hidden relative shadow-[0_20px_60px_rgba(44,37,39,0.06)]`}
                >
                  <div className="absolute inset-0 product-lace opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/50">
                        <Sparkles className="w-6 h-6 text-charcoal/20" strokeWidth={1.5} />
                      </div>
                      <p className="text-[11px] text-warm-gray/50 tracking-[0.2em] uppercase">
                        Photo coming soon
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-5 left-5 flex flex-col gap-2">
                    {product.collection === "Limited" && (
                      <span className="px-4 py-1.5 bg-charcoal/80 backdrop-blur-sm text-gold text-[9px] tracking-[0.2em] uppercase font-medium rounded-full border border-gold/20">
                        Limited Edition
                      </span>
                    )}
                    {product.preOrder && (
                      <span className="px-4 py-1.5 bg-burgundy/85 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase font-medium rounded-full border border-burgundy/30">
                        Pre-Order
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl bg-gradient-to-br ${product.placeholder.gradient} border border-border-light/50 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer overflow-hidden relative`}
                    >
                      <div className="absolute inset-0 product-lace opacity-20" />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Info */}
            <Reveal direction="right" delay={0.12}>
              <div className="lg:py-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-2">
                  {product.collection} Collection
                </p>
                <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-2">
                  {product.name}
                </h1>
                <p className="text-base text-warm-gray mb-1 italic font-heading">{product.tagline}</p>
                <p className="text-2xl font-heading text-charcoal mb-1">
                  {formatPrice(product.price)}
                </p>
                {product.preOrder && (
                  <p className="text-[11px] text-burgundy font-medium tracking-wide mb-2">
                    Pre-Order — Ships when ready
                  </p>
                )}
                <div className="gold-line mb-6 opacity-40" />

                <p className="text-warm-gray leading-[1.8] mb-8">
                  {product.description}
                </p>

                {/* Color selector */}
                <div className="mb-7">
                  <p className="text-[13px] font-medium text-charcoal mb-3">
                    Color — <span className="text-warm-gray font-normal">{variant.color}</span>
                  </p>
                  <div className="flex gap-3">
                    {product.variants.map((v, i) => (
                      <button
                        key={v.color}
                        onClick={() => setSelectedColor(i)}
                        className={cn(
                          "w-11 h-11 rounded-full border-2 transition-all duration-300 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]",
                          selectedColor === i
                            ? "border-burgundy scale-110 shadow-[0_0_0_3px_rgba(139,58,74,0.15),inset_0_2px_4px_rgba(0,0,0,0.08)]"
                            : "border-border hover:border-rose-gold hover:scale-105"
                        )}
                        style={{ backgroundColor: v.colorHex }}
                        title={v.color}
                        aria-label={`Select color: ${v.color}`}
                      >
                        {selectedColor === i && (
                          <Check className="w-4 h-4 text-burgundy absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="mb-7">
                  <p className="text-[13px] font-medium text-charcoal mb-3">Size</p>
                  <div className="inline-flex px-5 py-2.5 border border-charcoal rounded-full text-[13px] text-charcoal">
                    One Size — Generous Drape
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-8">
                  <p className="text-[13px] font-medium text-charcoal mb-3">Quantity</p>
                  <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-11 h-11 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-pearl/50 transition-all duration-200"
                    >
                      <Minus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <span className="w-11 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-11 h-11 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-pearl/50 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="flex flex-wrap gap-3 mb-7">
                  <button
                    onClick={handleAddToCart}
                    className={cn(
                      "btn-luxe flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm tracking-[0.06em] rounded-full transition-all duration-300",
                      added
                        ? "bg-green-700 text-white shadow-[0_4px_20px_rgba(21,128,61,0.3)]"
                        : "bg-burgundy text-white"
                    )}
                  >
                    {added ? (
                      <><Check className="w-4 h-4" strokeWidth={2} /> Added to Cart</>
                    ) : (
                      <><ShoppingBag className="w-4 h-4" strokeWidth={1.5} /> {product.preOrder ? "Pre-Order" : "Add to Cart"} — {formatPrice(product.price * quantity)}</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: `${product.name} — Lace by La Luz`,
                            url: window.location.href,
                          })
                          .catch(() => {
                            /* user cancelled share — no action */
                          });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast("Link copied to clipboard", "success");
                      }
                    }}
                    className="w-12 h-12 border border-border rounded-full flex items-center justify-center text-warm-gray hover:text-burgundy hover:border-burgundy hover:bg-blush/20 transition-all duration-300"
                    aria-label="Share this veil"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Mission Note */}
                <div className="relative bg-gradient-to-r from-blush/40 via-rose/15 to-blush/40 rounded-2xl px-6 py-5 mb-8 border border-rose/20 overflow-hidden">
                  <div className="absolute inset-0 lace-pattern opacity-15" />
                  <div className="relative">
                    <p className="text-sm text-burgundy font-medium flex items-center gap-2">
                      <Heart className="w-4 h-4 fill-burgundy" />
                      With this purchase, {quantity} veil{quantity > 1 ? "s" : ""} will be gifted to a sister in need
                    </p>
                    <p className="text-[11px] text-warm-gray mt-1.5">
                      You&apos;ll receive updates on where your gifted veil is sent
                    </p>
                  </div>
                </div>

                {/* Details accordion */}
                <div className="space-y-2.5">
                  {[
                    { title: "Features", items: product.features },
                    { title: "Care Instructions", items: product.care },
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
                      className="group border border-border-light/60 rounded-2xl overflow-hidden bg-white"
                    >
                      <summary className="px-6 py-4 text-[13px] font-medium text-charcoal cursor-pointer flex items-center justify-between hover:bg-cream/30 transition-colors duration-200">
                        {section.title}
                        <Plus className="w-4 h-4 text-warm-gray group-open:rotate-45 transition-transform duration-300" strokeWidth={1.5} />
                      </summary>
                      <ul className="px-6 pb-5 space-y-2">
                        {section.items.map((item) => (
                          <li key={item} className="text-sm text-warm-gray flex items-start gap-2.5 leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-gold mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <Reviews productName={product.name} />

      {/* Related Products */}
      <section className="relative py-24 bg-cream overflow-hidden">
        <div className="absolute inset-0 lace-pattern opacity-15" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <p className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium mb-3">
                Complete Your Collection
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl text-charcoal">
                You May Also Love
              </h2>
              <div className="gold-line mx-auto mt-4 opacity-40" />
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
