"use client";

import { X, Plus, Minus, ShoppingBag, Heart, Lock } from "lucide-react";
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
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={cart.closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-[420px] bg-ivory z-50 shadow-[-20px_0_60px_rgba(44,37,39,0.15)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
          <div>
            <h2 className="font-heading text-xl text-charcoal">Your Cart</h2>
            <div className="gold-line mt-1.5 opacity-40" style={{ width: 30 }} />
          </div>
          <button
            onClick={cart.closeCart}
            aria-label="Close cart"
            className="p-2 text-warm-gray hover:text-charcoal hover:bg-pearl/50 rounded-full transition-all duration-200"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center mb-5">
                <ShoppingBag className="w-7 h-7 text-rose-gold" strokeWidth={1.5} />
              </div>
              <p className="font-heading text-lg text-charcoal mb-2">
                Your cart is empty
              </p>
              <p className="text-sm text-warm-gray mb-7">
                Beautiful veils are waiting for you
              </p>
              <Link
                href="/shop"
                onClick={cart.closeCart}
                className="btn-luxe px-7 py-3 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
              >
                Shop Veils
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={`${item.productId}-${item.color}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-border-light/60 shadow-[0_2px_10px_rgba(44,37,39,0.03)]"
                >
                  <div
                    className={`w-[72px] h-[72px] rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0 product-lace`}
                    style={{ backgroundBlendMode: "overlay" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-[15px] text-charcoal">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-warm-gray mt-0.5">
                      {item.color}
                    </p>
                    <p className="text-sm font-medium text-charcoal mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() =>
                          cart.updateQuantity(item.productId, item.color, item.quantity - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-warm-gray hover:border-burgundy hover:text-burgundy transition-colors duration-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          cart.updateQuantity(item.productId, item.color, item.quantity + 1)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-warm-gray hover:border-burgundy hover:text-burgundy transition-colors duration-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => cart.removeItem(item.productId, item.color)}
                        className="ml-auto text-[11px] text-soft-gray hover:text-burgundy transition-colors duration-200"
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
          <div className="border-t border-border/60 px-6 py-6 space-y-4">
            {/* Mission note */}
            <div className="bg-gradient-to-r from-blush/40 to-rose/20 rounded-xl px-4 py-3 text-center border border-rose/15">
              <p className="text-[11px] text-burgundy font-medium flex items-center justify-center gap-1.5">
                <Heart className="w-3 h-3 fill-burgundy" />
                {cart.totalItems()} veil{cart.totalItems() > 1 ? "s" : ""} will be gifted to a sister in need
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-warm-gray">Subtotal</span>
              <span className="text-xl font-heading text-charcoal">
                {formatPrice(total)}
              </span>
            </div>

            <Link
              href="/cart"
              onClick={cart.closeCart}
              className="btn-luxe flex items-center justify-center gap-2 w-full py-3.5 bg-burgundy text-white text-sm tracking-[0.06em] text-center rounded-full"
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
              View Cart & Checkout
            </Link>

            <button
              onClick={cart.closeCart}
              className="block w-full text-center text-sm text-warm-gray hover:text-charcoal transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
