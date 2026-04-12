"use client";

import Link from "next/link";
import { Heart, Gift, ArrowRight, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function OrderSuccessPage() {
  const cart = useCart();

  useEffect(() => {
    cart.clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-20 left-[20%] w-[300px] h-[300px] rounded-full bg-blush/20 blur-[100px]" />
      <div className="absolute bottom-20 right-[20%] w-[250px] h-[250px] rounded-full bg-gold/10 blur-[80px]" />

      <div className="relative max-w-2xl mx-auto px-4 text-center">
        {/* Celebration */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blush/50 to-rose/30 flex items-center justify-center mx-auto mb-8 animate-fade-up border border-rose/20 shadow-[0_10px_40px_rgba(232,196,206,0.3)]">
          <Sparkles className="w-10 h-10 text-burgundy" strokeWidth={1.5} />
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-4 animate-fade-up stagger-1">
          Thank You, <span className="italic text-burgundy">Sister</span>
        </h1>

        <div className="gold-line mx-auto mb-6 opacity-50 animate-fade-up stagger-2" />

        <p className="text-lg text-warm-gray leading-relaxed mb-10 max-w-md mx-auto animate-fade-up stagger-2">
          Your order is confirmed. A beautiful veil is on its way to you — and
          another is being set aside for a sister in need.
        </p>

        {/* Mission Impact Card */}
        <div className="luxury-card rounded-3xl p-8 mb-12 text-left max-w-lg mx-auto animate-fade-up stagger-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blush/20 to-transparent rounded-bl-full" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-burgundy/10 rounded-full flex items-center justify-center border border-burgundy/15">
                <Gift className="w-5 h-5 text-burgundy" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-heading text-lg text-charcoal">
                  Your Mission Impact
                </h3>
                <p className="text-[11px] text-warm-gray">
                  Here&apos;s what happens next
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { text: "Your veil is being prepared with boutique care and beautiful packaging." },
                { text: "A matching veil has been marked for donation to a sister church." },
                { text: "You\u2019ll receive an email when your gifted veil is assigned to a destination." },
                { text: "Later, you\u2019ll get a photo of the sisters who received your gift." },
              ].map((step, i) => (
                <div key={i} className="flex gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/15 to-gold/5 text-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-gold/20">
                    {i + 1}
                  </span>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-warm-gray flex items-center justify-center gap-2 mb-10 animate-fade-up stagger-4">
          <Heart className="w-4 h-4 text-rose-gold fill-rose-gold" />
          Buy one. Give one. You just made a difference.
        </p>

        <div className="flex flex-wrap justify-center gap-3 animate-fade-up stagger-5">
          <Link
            href="/shop"
            className="btn-luxe inline-flex items-center gap-2.5 px-8 py-4 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/mission"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/70 backdrop-blur-sm border border-charcoal/10 text-charcoal text-sm tracking-[0.04em] rounded-full hover:bg-white hover:border-charcoal/20 hover:shadow-lg transition-all duration-300"
          >
            Learn About Our Mission
          </Link>
        </div>
      </div>
    </section>
  );
}
