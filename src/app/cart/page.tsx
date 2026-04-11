"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  X,
  ShoppingBag,
  Heart,
  Lock,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const cart = useCart();
  const total = cart.totalPrice();
  const itemCount = cart.totalItems();

  if (cart.items.length === 0) {
    return (
      <section className="py-32">
        <div className="max-w-md mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-soft-gray mx-auto mb-6" />
          <h1 className="font-heading text-3xl text-charcoal mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-warm-gray mb-8">
            Beautiful veils are waiting for you. Each purchase gifts one to a
            sister in need.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-burgundy text-white text-sm tracking-wide rounded-full hover:bg-burgundy/90 transition-colors"
          >
            Shop Veils
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1 className="font-heading text-3xl sm:text-4xl text-charcoal mb-10">
          Your Cart
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={`${item.productId}-${item.color}`}
                className="flex gap-5 p-5 bg-white rounded-2xl border border-border-light"
              >
                <Link href={`/product/${item.slug}`}>
                  <div
                    className={`w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0`}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="font-heading text-lg text-charcoal hover:text-burgundy transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-warm-gray mt-0.5">
                        {item.color} · One Size
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        cart.removeItem(item.productId, item.color)
                      }
                      className="p-1 text-soft-gray hover:text-burgundy transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-border rounded-full">
                      <button
                        onClick={() =>
                          cart.updateQuantity(
                            item.productId,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-charcoal"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          cart.updateQuantity(
                            item.productId,
                            item.color,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-charcoal"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-base font-medium text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border-light p-6 sticky top-28">
              <h2 className="font-heading text-xl text-charcoal mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">
                    Subtotal ({itemCount} item{itemCount > 1 ? "s" : ""})
                  </span>
                  <span className="text-charcoal font-medium">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Shipping</span>
                  <span className="text-charcoal font-medium">
                    {total >= 75 ? "Free" : "$5.99"}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-charcoal font-medium">Total</span>
                  <span className="text-xl font-heading text-charcoal">
                    {formatPrice(total >= 75 ? total : total + 5.99)}
                  </span>
                </div>
              </div>

              {/* Mission Note */}
              <div className="bg-blush/40 rounded-xl px-4 py-3 mb-6 border border-rose/20">
                <p className="text-xs text-burgundy font-medium flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-burgundy" />
                  {itemCount} veil{itemCount > 1 ? "s" : ""} will be gifted to a
                  sister in need
                </p>
              </div>

              <button className="w-full py-4 bg-burgundy text-white text-sm tracking-wide rounded-full hover:bg-burgundy/90 transition-colors flex items-center justify-center gap-2 mb-3">
                <Lock className="w-4 h-4" />
                Proceed to Checkout
              </button>

              <p className="text-[10px] text-center text-soft-gray">
                Secure checkout powered by Stripe
              </p>

              {total < 75 && (
                <p className="text-xs text-center text-warm-gray mt-4 bg-cream rounded-lg px-3 py-2">
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
