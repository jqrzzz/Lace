"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Truck,
  Package,
  Receipt,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { OrderStatus } from "@/lib/lace/types";

interface OrderActionsProps {
  orderNumber: string;
  status: OrderStatus;
  totalCents: number;
}

type Mode = null | "ship" | "track" | "refund";

const FINAL = new Set<OrderStatus>([
  "delivered",
  "cancelled",
  "refunded",
  "failed",
]);

export default function OrderActions({
  orderNumber,
  status,
  totalCents,
}: OrderActionsProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canShip = !FINAL.has(status) && status !== "shipped";
  const canTrack = !FINAL.has(status);
  const canRefund = !FINAL.has(status);

  if (FINAL.has(status)) {
    return (
      <div className="bg-cream/50 rounded-2xl border border-border-light p-5 text-center">
        <p className="text-sm text-warm-gray">
          This order is wrapped up — nothing more to do here.
        </p>
      </div>
    );
  }

  async function submit(
    path: string,
    body: Record<string, unknown>,
    successText: string,
  ) {
    setError(null);
    setSuccess(null);
    const res = await fetch(
      `/api/admin/orders/${encodeURIComponent(orderNumber)}/${path}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(
        json?.error ?? "Something didn't go through — try again in a moment.",
      );
      return;
    }
    setSuccess(successText);
    setMode(null);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-border-light p-5">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-medium text-charcoal text-sm uppercase tracking-wide">
          What needs doing?
        </h2>
      </div>

      {success && (
        <div className="mb-3 flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-3 py-2 text-sm">
          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-3 py-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === null && (
        <div className="space-y-2">
          {canShip && (
            <ActionButton
              icon={Truck}
              title="Mark as shipped"
              hint="When the package is on its way."
              onClick={() => setMode("ship")}
              tone="primary"
            />
          )}
          {canTrack && (
            <ActionButton
              icon={Package}
              title="Add tracking number"
              hint="When you have a number to give them."
              onClick={() => setMode("track")}
            />
          )}
          {canRefund && (
            <ActionButton
              icon={Receipt}
              title="Issue a refund"
              hint="When something went wrong."
              onClick={() => setMode("refund")}
              tone="caution"
            />
          )}
        </div>
      )}

      {mode === "ship" && (
        <ShipForm
          pending={pending}
          onSubmit={(payload) =>
            submit(
              "mark-shipped",
              payload,
              "Order marked shipped. Customer can see the update.",
            )
          }
          onCancel={() => setMode(null)}
        />
      )}

      {mode === "track" && (
        <TrackForm
          pending={pending}
          onSubmit={(payload) =>
            submit("add-tracking", payload, "Tracking saved.")
          }
          onCancel={() => setMode(null)}
        />
      )}

      {mode === "refund" && (
        <RefundForm
          pending={pending}
          totalCents={totalCents}
          onSubmit={(payload) =>
            submit("refund", payload, "Refund queued.")
          }
          onCancel={() => setMode(null)}
        />
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  hint,
  onClick,
  tone,
}: {
  icon: typeof Truck;
  title: string;
  hint: string;
  onClick: () => void;
  tone?: "primary" | "caution";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-burgundy text-white hover:bg-burgundy/90 border-burgundy"
      : tone === "caution"
        ? "bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200"
        : "bg-cream text-charcoal hover:bg-white border-border-light";
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${toneClass}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p
          className={`text-xs mt-0.5 ${
            tone === "primary"
              ? "text-pearl/80"
              : tone === "caution"
                ? "text-amber-800/70"
                : "text-warm-gray"
          }`}
        >
          {hint}
        </p>
      </div>
    </button>
  );
}

function FormShell({
  title,
  children,
  pending,
  onCancel,
  submitText,
  submitTone = "primary",
}: {
  title: string;
  children: React.ReactNode;
  pending: boolean;
  onCancel: () => void;
  submitText: string;
  submitTone?: "primary" | "caution";
}) {
  return (
    <>
      <div className="text-sm text-charcoal font-medium mb-3">{title}</div>
      {children}
      <div className="flex items-center gap-2 mt-4">
        <button
          type="submit"
          disabled={pending}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            submitTone === "caution"
              ? "bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
              : "bg-burgundy text-white hover:bg-burgundy/90 disabled:opacity-60"
          }`}
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitText}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="px-4 py-2.5 rounded-xl text-sm text-warm-gray hover:text-charcoal transition-colors"
        >
          Nevermind
        </button>
      </div>
    </>
  );
}

function ShipForm({
  pending,
  onSubmit,
  onCancel,
}: {
  pending: boolean;
  onSubmit: (p: { tracking_number?: string; carrier?: string }) => void;
  onCancel: () => void;
}) {
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          tracking_number: tracking.trim() || undefined,
          carrier: carrier.trim() || undefined,
        });
      }}
    >
      <FormShell
        title="Mark this order shipped?"
        pending={pending}
        onCancel={onCancel}
        submitText="Yes, mark shipped"
      >
        <p className="text-xs text-warm-gray mb-3">
          The customer will see the update on their order page. Tracking is
          optional — you can add it later.
        </p>
        <Field label="Tracking number (optional)">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="e.g. 9405511899223456789001"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
          />
        </Field>
        <Field label="Carrier (optional)">
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold bg-white"
          >
            <option value="">—</option>
            <option value="usps">USPS</option>
            <option value="ups">UPS</option>
            <option value="fedex">FedEx</option>
            <option value="dhl">DHL</option>
          </select>
        </Field>
      </FormShell>
    </form>
  );
}

function TrackForm({
  pending,
  onSubmit,
  onCancel,
}: {
  pending: boolean;
  onSubmit: (p: { tracking_number: string; carrier?: string }) => void;
  onCancel: () => void;
}) {
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");
  const canSubmit = tracking.trim().length > 0;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          tracking_number: tracking.trim(),
          carrier: carrier.trim() || undefined,
        });
      }}
    >
      <FormShell
        title="Add a tracking number?"
        pending={pending || !canSubmit}
        onCancel={onCancel}
        submitText="Save tracking"
      >
        <Field label="Tracking number">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Paste it here"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
            autoFocus
          />
        </Field>
        <Field label="Carrier (optional)">
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold bg-white"
          >
            <option value="">—</option>
            <option value="usps">USPS</option>
            <option value="ups">UPS</option>
            <option value="fedex">FedEx</option>
            <option value="dhl">DHL</option>
          </select>
        </Field>
      </FormShell>
    </form>
  );
}

function RefundForm({
  pending,
  totalCents,
  onSubmit,
  onCancel,
}: {
  pending: boolean;
  totalCents: number;
  onSubmit: (p: { amount_cents?: number; reason: string }) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const dollars = amount.trim();
  const cents =
    dollars === "" ? undefined : Math.round(parseFloat(dollars) * 100);
  const amountOk =
    cents === undefined || (Number.isFinite(cents) && cents > 0 && cents <= totalCents);
  const canSubmit = reason.trim().length > 0 && amountOk;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          amount_cents: cents,
          reason: reason.trim(),
        });
      }}
    >
      <FormShell
        title="Issue a refund?"
        pending={pending || !canSubmit}
        onCancel={onCancel}
        submitText={cents ? `Refund $${(cents / 100).toFixed(2)}` : "Refund in full"}
        submitTone="caution"
      >
        <p className="text-xs text-warm-gray mb-3">
          Leave the amount blank for a full refund of $
          {(totalCents / 100).toFixed(2)}.
        </p>
        <Field label="Amount in dollars (optional)">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Up to ${(totalCents / 100).toFixed(2)}`}
            inputMode="decimal"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
          />
          {!amountOk && (
            <p className="text-xs text-red-700 mt-1">
              Amount must be between $0.01 and $
              {(totalCents / 100).toFixed(2)}.
            </p>
          )}
        </Field>
        <Field label="What went wrong?">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="A short note for our records — the customer won't see this."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
          />
        </Field>
      </FormShell>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-3">
      <span className="text-xs text-warm-gray block mb-1">{label}</span>
      {children}
    </label>
  );
}
