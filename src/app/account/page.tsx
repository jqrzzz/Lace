"use client";

import Link from "next/link";
import { ShoppingBag, Heart, MapPin, ArrowRight } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="animate-fade-up">
      {/* Quick stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: ShoppingBag,
            label: "Orders",
            value: "0",
            desc: "No orders yet",
            href: "/account/orders",
          },
          {
            icon: Heart,
            label: "Veils Gifted",
            value: "0",
            desc: "Place your first order",
            href: "/mission",
          },
          {
            icon: MapPin,
            label: "Impact Destinations",
            value: "0",
            desc: "Updates coming soon",
            href: "/mission",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="luxury-card rounded-2xl p-6 group"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon
                className="w-5 h-5 text-gold"
                strokeWidth={1.5}
              />
              <ArrowRight className="w-4 h-4 text-soft-gray group-hover:text-burgundy group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
            <p className="text-2xl font-heading text-charcoal">{stat.value}</p>
            <p className="text-xs text-warm-gray mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-soft-gray mt-1">{stat.desc}</p>
          </Link>
        ))}
      </div>

      {/* Mission impact */}
      <div className="relative luxury-card rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blush/20 to-rose/10" />
        <div className="lace-pattern absolute inset-0 opacity-10 pointer-events-none" />
        <div className="relative">
          <Heart className="w-6 h-6 text-burgundy mb-3" strokeWidth={1.5} />
          <h2 className="font-heading text-2xl text-charcoal mb-3">
            Your Mission Impact
          </h2>
          <div className="gold-line mb-4 opacity-30" style={{ width: 40 }} />
          <p className="text-warm-gray leading-relaxed mb-6">
            Every veil you purchase gifts one to a sister in need. Once your
            gifted veils are assigned to a destination church, you&apos;ll see
            updates here — including photos of the sisters who received your
            gift.
          </p>
          <Link
            href="/shop"
            className="btn-luxe inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
          >
            Shop Veils
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
