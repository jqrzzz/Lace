"use client";

import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const cart = useCart();
  const total = cart.totalPrice();

  if (!cart.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50"
        onClick={cart.closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-heading text-xl">Your Cart</h2>
          <button
            onClick={cart.closeCart}
            className="p-1 text-warm-gray hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 text-soft-gray mb-4" />
              <p className="font-heading text-lg text-charcoal mb-2">
                Your cart is empty
              </p>
              <p className="text-sm text-warm-gray mb-6">
                Beautiful veils are waiting for you
              </p>
              <Link
                href="/shop"
                onClick={cart.closeCart}
                className="px-6 py-3 bg-burgundy text-white text-sm tracking-wide rounded-full hover:bg-burgundy/90 transition-colors"
              >
                Shop Veils
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={`${item.productId}-${item.color}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-border-light"
                >
                  {/* Product image placeholder */}
                  <div
                    className={`w-20 h-20 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0`}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-base text-charcoal">
                      {item.name}
                    </h3>
                    <p className="text-xs text-warm-gray mt-0.5">
                      {item.color}
                    </p>
                    <p className="text-sm font-medium text-charcoal mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          cart.updateQuantity(
                            item.productId,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-warm-gray hover:border-charcoal hover:text-charcoal transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
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
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-warm-gray hover:border-charcoal hover:text-charcoal transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          cart.removeItem(item.productId, item.color)
                        }
                        className="ml-auto text-xs text-soft-gray hover:text-burgundy transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            {/* Mission note */}
            <div className="bg-blush/60 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-burgundy font-medium">
                With this order, {cart.totalItems()} veil
                {cart.totalItems() > 1 ? "s" : ""} will be gifted to a sister in
                need
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-warm-gray">Subtotal</span>
              <span className="text-lg font-heading text-charcoal">
                {formatPrice(total)}
              </span>
            </div>

            <Link
              href="/cart"
              onClick={cart.closeCart}
              className="block w-full py-3.5 bg-burgundy text-white text-sm tracking-wide text-center rounded-full hover:bg-burgundy/90 transition-colors"
            >
              Checkout — {formatPrice(total)}
            </Link>

            <button
              onClick={cart.closeCart}
              className="block w-full text-center text-sm text-warm-gray hover:text-charcoal transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
