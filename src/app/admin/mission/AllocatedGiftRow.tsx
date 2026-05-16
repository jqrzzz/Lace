"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2, MapPin, PackageCheck } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface AllocatedGift {
  id: string;
  quantity: number;
  status: "allocated" | "shipped";
  allocated_at: string | null;
  shipped_at: string | null;
  order_number: string | null;
  customer_email: string | null;
  recipient_community: string | null;
  recipient_city: string | null;
  recipient_country: string | null;
}

export default function AllocatedGiftRow({ gift }: { gift: AllocatedGift }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [story, setStory] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function markDelivered() {
    setError(null);
    const res = await fetch(
      `/api/admin/mission/gifts/${gift.id}/mark-delivered`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: story.trim() || undefined }),
      },
    );
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Something didn't go through.");
      return;
    }
    setDone(true);
    startTransition(() => router.refresh());
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800">
        <Check className="w-4 h-4" />
        Delivered. We&apos;ll let the buyer know.
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-light rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-gold-dark" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-charcoal">
              {gift.quantity} veil{gift.quantity === 1 ? "" : "s"} →{" "}
              <span className="font-medium">
                {gift.recipient_community ?? "—"}
              </span>
            </p>
            <p className="text-xs text-warm-gray truncate">
              {gift.recipient_city}, {gift.recipient_country}
              {gift.order_number && ` · from ${gift.order_number}`}
              {gift.allocated_at && ` · sent ${timeAgo(gift.allocated_at)}`}
            </p>
          </div>
        </div>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <PackageCheck className="w-4 h-4" />
          Mark delivered
        </button>
      ) : (
        <div>
          <p className="text-xs text-warm-gray mb-2">
            Add a short story for the buyer&apos;s update email (optional).
          </p>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={3}
            placeholder="Sister Grace wrote that 47 women wore them at Sunday service…"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold mb-2"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={markDelivered}
              disabled={pending}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              <PackageCheck className="w-4 h-4" />
              Mark delivered
            </button>
            <button
              onClick={() => setOpen(false)}
              disabled={pending}
              className="px-4 py-2.5 text-sm text-warm-gray hover:text-charcoal"
            >
              Nevermind
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-700 mt-2">{error}</p>
      )}
    </div>
  );
}
