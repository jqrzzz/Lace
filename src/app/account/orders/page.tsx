"use client";

import Link from "next/link";
import { ClipboardList, ArrowRight, Heart } from "lucide-react";

// TODO: Fetch from Supabase when connected
const ORDERS: {
  id: string;
  date: string;
  status: string;
  total: string;
  items: { name: string; color: string; qty: number }[];
  gifted: number;
}[] = [];

export default function OrderHistoryPage() {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl text-charcoal">Order History</h2>
          <p className="text-sm text-warm-gray mt-1">
            Track your orders and mission impact
          </p>
        </div>
      </div>

      {ORDERS.length === 0 ? (
        <div className="luxury-card rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-5">
            <ClipboardList
              className="w-7 h-7 text-rose-gold"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="font-heading text-xl text-charcoal mb-3">
            No Orders Yet
          </h3>
          <p className="text-warm-gray leading-relaxed max-w-sm mx-auto mb-6">
            When you place an order, it will appear here along with your mission
            impact — including where your gifted veils are sent.
          </p>
          <Link
            href="/shop"
            className="btn-luxe inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
          >
            Shop Veils
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ORDERS.map((order) => (
            <div
              key={order.id}
              className="luxury-card rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-warm-gray mt-0.5">{order.date}</p>
                </div>
                <span className="px-3 py-1 text-xs bg-cream rounded-full text-warm-gray border border-border-light">
                  {order.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-warm-gray">
                      {item.name} ({item.color}) × {item.qty}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border-light/60">
                <p className="text-sm text-warm-gray flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-burgundy fill-burgundy" />
                  {order.gifted} veil{order.gifted > 1 ? "s" : ""} gifted
                </p>
                <p className="font-heading text-lg text-charcoal">
                  {order.total}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
