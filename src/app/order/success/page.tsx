"use client";

import Link from "next/link";
import { Heart, Gift, ArrowRight, PartyPopper } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function OrderSuccessPage() {
  const cart = useCart();

  useEffect(() => {
    cart.clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Celebration */}
        <div className="w-20 h-20 bg-blush/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <PartyPopper className="w-10 h-10 text-burgundy" />
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-4">
          Thank You, Sister
        </h1>

        <p className="text-lg text-warm-gray leading-relaxed mb-8 max-w-md mx-auto">
          Your order is confirmed. A beautiful veil is on its way to you — and
          another is being set aside for a sister in need.
        </p>

        {/* Mission Impact Card */}
        <div className="bg-white rounded-3xl border border-border-light p-8 mb-10 text-left max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-burgundy/10 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-burgundy" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-charcoal">
                Your Mission Impact
              </h3>
              <p className="text-xs text-warm-gray">
                Here&apos;s what happens next
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: "1",
                text: "Your veil is being prepared with boutique care and beautiful packaging.",
              },
              {
                icon: "2",
                text: "A matching veil has been marked for donation to a sister church.",
              },
              {
                icon: "3",
                text: "You'll receive an email when your gifted veil is assigned to a destination.",
              },
              {
                icon: "4",
                text: "Later, you'll get a photo of the sisters who received your gift.",
              },
            ].map((step) => (
              <div key={step.icon} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.icon}
                </span>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-warm-gray flex items-center justify-center gap-2 mb-8">
          <Heart className="w-4 h-4 text-rose-gold fill-rose-gold" />
          Buy one. Give one. You just made a difference.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-burgundy text-white text-sm tracking-wide rounded-full hover:bg-burgundy/90 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/mission"
            className="inline-flex items-center gap-2 px-8 py-4 border border-charcoal/20 text-charcoal text-sm tracking-wide rounded-full hover:bg-charcoal hover:text-white transition-colors"
          >
            Learn About Our Mission
          </Link>
        </div>
      </div>
    </section>
  );
}
