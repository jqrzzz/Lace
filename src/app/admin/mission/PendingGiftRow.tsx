"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Check, Heart, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface Recipient {
  id: string;
  community: string;
  city: string;
  country: string;
}

interface Gift {
  id: string;
  quantity: number;
  created_at: string;
  order_number: string | null;
  customer_email: string | null;
}

export default function PendingGiftRow({
  gift,
  recipients,
}: {
  gift: Gift;
  recipients: Recipient[];
}) {
  const router = useRouter();
  const [recipientId, setRecipientId] = useState(recipients[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const picked = recipients.find((r) => r.id === recipientId);

  async function assign() {
    if (!recipientId) return;
    setError(null);
    const res = await fetch(`/api/admin/mission/gifts/${gift.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: recipientId }),
    });
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
        Sent to {picked?.community}. Beautiful.
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-light rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blush/30 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-burgundy fill-burgundy/40" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-charcoal">
              {gift.quantity} veil{gift.quantity === 1 ? "" : "s"} from{" "}
              {gift.order_number ? (
                <span className="font-medium">{gift.order_number}</span>
              ) : (
                <span className="text-warm-gray">an order</span>
              )}
            </p>
            <p className="text-xs text-warm-gray truncate">
              {gift.customer_email ?? "—"} · committed {timeAgo(gift.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          disabled={pending || recipients.length === 0}
          className="flex-1 px-3 py-2.5 border border-border rounded-xl text-sm text-charcoal bg-white focus:outline-none focus:border-gold"
        >
          {recipients.length === 0 ? (
            <option value="">No communities set up yet</option>
          ) : (
            recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.community} · {r.city}, {r.country}
              </option>
            ))
          )}
        </select>
        <button
          onClick={assign}
          disabled={pending || !recipientId}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          Send to community
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-700 mt-2">{error}</p>
      )}
    </div>
  );
}
