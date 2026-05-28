"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  X,
  ShoppingBag,
  Heart,
  Gift,
  Lock,
  Loader2,
} from "lucide-react";
import { useCart, GIFT_MESSAGE_MAX } from "@/lib/cart";
import { track } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const cart = useCart();
  const total = cart.totalPrice();
  const itemCount = cart.totalItems();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    track("begin_checkout", { value: total, items: itemCount });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            color: i.color,
            quantity: i.quantity,
          })),
          isGift: cart.isGift,
          giftMessage: cart.isGift ? cart.giftMessage : "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setCheckoutError(data.error || "Something went wrong. Please try again.");
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError("Unable to connect to checkout. Please try again.");
      setCheckoutLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <section className="py-32 relative">
        <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
        <div className="relative max-w-md mx-auto px-4 text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-9 h-9 text-rose-gold" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl text-charcoal mb-3">
            Your Cart is Empty
          </h1>
          <div className="gold-line mx-auto mb-5 opacity-40" />
          <p className="text-warm-gray mb-8 leading-relaxed">
            Beautiful veils are waiting for you. Each purchase gifts one to a
            sister in need.
          </p>
          <Link
            href="/shop"
            className="btn-luxe inline-flex items-center gap-2 px-8 py-4 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full"
          >
            Shop Veils
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[13px] text-warm-gray hover:text-charcoal group transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={1.5} />
          Continue Shopping
        </Link>

        <h1 className="font-heading text-3xl sm:text-4xl text-charcoal mb-2">
          Your Cart
        </h1>
        <div className="gold-line mb-10 opacity-40" />

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, i) => (
              <div
                key={`${item.productId}-${item.color}`}
                className={`flex gap-5 p-5 luxury-card rounded-2xl animate-fade-up stagger-${Math.min(i + 1, 6)}`}
              >
                <Link href={`/product/${item.slug}`}>
                  <div
                    className={`w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0 product-lace overflow-hidden relative`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="font-heading text-lg text-charcoal hover:text-burgundy transition-colors duration-200">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-[13px] text-warm-gray mt-0.5">
                        {item.color} · One Size
                      </p>
                    </div>
                    <button
                      onClick={() => cart.removeItem(item.productId, item.color)}
                      className="p-1.5 text-soft-gray hover:text-burgundy hover:bg-blush/20 rounded-full transition-all duration-200"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.color, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-pearl/50 transition-all duration-200"
                      >
                        <Minus className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.productId, item.color, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-pearl/50 transition-all duration-200"
                      >
                        <Plus className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="text-base font-heading text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Gift options — this is a gifting brand; let the buyer gift too. */}
            <div className="luxury-card rounded-2xl p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cart.isGift}
                  onChange={(e) => cart.setIsGift(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-burgundy cursor-pointer"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-medium text-charcoal">
                    <Gift className="w-4 h-4 text-burgundy" strokeWidth={1.5} />
                    This is a gift
                  </span>
                  <span className="block text-[12px] text-warm-gray mt-0.5">
                    Add a note and we&apos;ll include it, handwritten, with her
                    veil.
                  </span>
                </span>
              </label>

              {cart.isGift && (
                <div className="mt-4">
                  <label
                    htmlFor="gift-message"
                    className="block text-[11px] tracking-[0.18em] uppercase text-warm-gray mb-2"
                  >
                    Gift message
                  </label>
                  <textarea
                    id="gift-message"
                    value={cart.giftMessage}
                    onChange={(e) => cart.setGiftMessage(e.target.value)}
                    maxLength={GIFT_MESSAGE_MAX}
                    rows={3}
                    placeholder="For my sister, on your confirmation — wear it in joy. With love, …"
                    className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-white text-charcoal placeholder:text-warm-gray/70 focus:outline-none focus:border-gold transition resize-none"
                  />
                  <p className="text-[11px] text-warm-gray/70 text-right mt-1 tabular-nums">
                    {cart.giftMessage.length}/{GIFT_MESSAGE_MAX}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 animate-fade-up stagger-2">
            <div className="luxury-card rounded-2xl p-6 sticky top-28">
              <h2 className="font-heading text-xl text-charcoal mb-2">
                Order Summary
              </h2>
              <div className="gold-line mb-6 opacity-30" style={{ width: 40 }} />

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Subtotal ({itemCount} item{itemCount > 1 ? "s" : ""})</span>
                  <span className="text-charcoal font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Shipping</span>
                  <span className="text-charcoal font-medium">{total >= 75 ? "Free" : "$5.99"}</span>
                </div>
                <div className="border-t border-border-light pt-3 flex justify-between">
                  <span className="text-charcoal font-medium">Total</span>
                  <span className="text-xl font-heading text-charcoal">
                    {formatPrice(total >= 75 ? total : total + 5.99)}
                  </span>
                </div>
              </div>

              {/* Mission Note */}
              <div className="relative bg-gradient-to-r from-blush/40 to-rose/20 rounded-xl px-4 py-3 mb-6 border border-rose/15 overflow-hidden">
                <div className="lace-pattern absolute inset-0 opacity-10 pointer-events-none" />
                <p className="relative text-[11px] text-burgundy font-medium flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-burgundy" />
                  {itemCount} veil{itemCount > 1 ? "s" : ""} will be gifted to a sister in need
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="btn-luxe w-full py-4 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full flex items-center justify-center gap-2 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Lock className="w-4 h-4" strokeWidth={1.5} /> Proceed to Checkout</>
                )}
              </button>

              {checkoutError && (
                <p className="text-[11px] text-center text-red-600 mb-2">
                  {checkoutError}
                </p>
              )}

              <p className="text-[10px] text-center text-soft-gray">
                Secure checkout powered by Stripe
              </p>

              {total < 75 && (
                <p className="text-[11px] text-center text-warm-gray mt-4 bg-cream rounded-xl px-3 py-2.5 border border-border-light/50">
                  Add {formatPrice(75 - total)} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
