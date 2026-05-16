"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  DollarSign,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { useAdminActor } from "../AdminContext";

// Plain-language autonomy toggles. The DB columns underneath are
// lace.app_users.confirm_money_actions / confirm_destructive /
// daily_briefing_enabled. We don't expose the raw names anywhere —
// these labels are mom's mental model.

interface Toggles {
  confirm_money_actions: boolean;
  confirm_destructive: boolean;
  daily_briefing_enabled: boolean;
}

export default function SettingsForm() {
  const { actor, loading, applyLocalActor } = useAdminActor();
  const [draft, setDraft] = useState<Toggles | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actor) {
      setDraft({
        confirm_money_actions: actor.confirm_money_actions,
        confirm_destructive: actor.confirm_destructive,
        daily_briefing_enabled: actor.daily_briefing_enabled,
      });
    }
  }, [actor]);

  if (loading || !actor || !draft) {
    return (
      <div className="bg-white rounded-2xl border border-border-light p-10 text-center">
        <Loader2 className="w-5 h-5 text-warm-gray animate-spin mx-auto mb-2" />
        <p className="text-sm text-warm-gray">Loading your settings…</p>
      </div>
    );
  }

  if (actor.role !== "owner") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <p className="text-sm text-amber-900">
          These settings are owner-only. You&apos;re signed in as{" "}
          <span className="font-medium">{actor.role}</span> — ask the owner to
          adjust them or to promote your account.
        </p>
      </div>
    );
  }

  function toggle(key: keyof Toggles) {
    setDraft((d) => (d ? { ...d, [key]: !d[key] } : d));
    setSaved(false);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error ?? "Couldn't save your settings.");
        return;
      }
      // Mirror the change locally so the rest of the admin reflects it
      // without waiting for a re-fetch.
      applyLocalActor(draft);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <ToggleCard
        icon={DollarSign}
        title="Always ask me before money goes out"
        description="Every refund or paid action shows up in Approvals first — Luz never spends a dollar without your tap."
        checked={draft.confirm_money_actions}
        onToggle={() => toggle("confirm_money_actions")}
        cautionRecommended
      />

      <ToggleCard
        icon={ShieldCheck}
        title="Always ask me before customer-facing changes"
        description="Edits to products, customer tags, journal posts, and inbox replies all wait for your approval. Turn down once you trust Luz with the small stuff."
        checked={draft.confirm_destructive}
        onToggle={() => toggle("confirm_destructive")}
      />

      <ToggleCard
        icon={Mail}
        title="Send me a daily briefing"
        description="A short morning email summarizing yesterday: new orders, revenue, anything that needs your attention. (Email sending lands in Phase 2.C.)"
        checked={draft.daily_briefing_enabled}
        onToggle={() => toggle("daily_briefing_enabled")}
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save changes
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <Check className="w-4 h-4" /> Saved.
          </span>
        )}
        {error && (
          <span className="inline-flex items-center gap-1.5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" /> {error}
          </span>
        )}
      </div>

      <p className="text-xs text-warm-gray pt-2">
        Signed in as <span className="font-medium">{actor.email}</span> ·{" "}
        {actor.role}
      </p>
    </div>
  );
}

function ToggleCard({
  icon: Icon,
  title,
  description,
  checked,
  onToggle,
  cautionRecommended,
}: {
  icon: typeof DollarSign;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  cautionRecommended?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border-light p-5">
      <div className="flex items-start gap-4">
        <span className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gold-dark" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal">{title}</p>
          <p className="text-xs text-warm-gray mt-1 leading-relaxed">
            {description}
          </p>
          {cautionRecommended && !checked && (
            <p className="text-[11px] text-amber-700 mt-2">
              Heads-up: leaving this off means money actions run on their own.
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          role="switch"
          aria-checked={checked}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
            checked ? "bg-burgundy" : "bg-stone-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
