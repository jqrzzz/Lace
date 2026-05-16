"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardList, ArrowRight, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getLacePublicDb } from "@/lib/db";
import { formatCents } from "@/lib/format";

interface AccountOrderItem {
  id: string;
  name: string;
  variant_name: string | null;
  quantity: number;
  line_total_cents: number;
}

interface AccountOrderGift {
  id: string;
  quantity: number;
}

interface AccountOrder {
  id: string;
  order_number: string | null;
  status: string;
  total_cents: number;
  created_at: string;
  order_items: AccountOrderItem[];
  mission_gifts: AccountOrderGift[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function OrderHistoryPage() {
  const { user, loading: authLoading, configured } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const db = getLacePublicDb();
    if (!db) return;
    let cancelled = false;
    db.from("orders")
      .select(
        "id, order_number, status, total_cents, created_at, " +
          "order_items(id, name, variant_name, quantity, line_total_cents), " +
          "mission_gifts(id, quantity)",
      )
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[account/orders] load failed:", error);
          setError("Couldn't load your orders. Please try again.");
          setOrders([]);
        } else {
          setOrders((data ?? []) as unknown as AccountOrder[]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const waitingForDb = configured && !!user && orders === null;
  const loading = authLoading || waitingForDb;
  const list = !user ? [] : (orders ?? []);

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

      {error && (
        <div className="luxury-card rounded-2xl p-6 mb-4 text-sm text-burgundy">
          {error}
        </div>
      )}

      {loading ? (
        <div className="luxury-card rounded-2xl p-16 text-center">
          <p className="text-sm text-warm-gray">Loading your orders…</p>
        </div>
      ) : list.length === 0 ? (
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
          {list.map((order) => {
            const giftedVeils = order.mission_gifts.reduce(
              (s, g) => s + g.quantity,
              0,
            );
            return (
              <div key={order.id} className="luxury-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      Order {order.order_number ?? order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-warm-gray mt-0.5">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs bg-cream rounded-full text-warm-gray border border-border-light capitalize">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-warm-gray">
                        {item.name}
                        {item.variant_name ? ` (${item.variant_name})` : ""} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="text-warm-gray">
                        {formatCents(item.line_total_cents)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-light/60">
                  <p className="text-sm text-warm-gray flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-burgundy fill-burgundy" />
                    {giftedVeils} veil{giftedVeils === 1 ? "" : "s"} gifted
                  </p>
                  <p className="font-heading text-lg text-charcoal">
                    {formatCents(order.total_cents)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
