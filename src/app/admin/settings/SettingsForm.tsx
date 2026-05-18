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
  User,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { useAdminActor } from "../AdminContext";

interface Toggles {
  confirm_money_actions: boolean;
  confirm_destructive: boolean;
  daily_briefing_enabled: boolean;
}

interface Profile {
  name: string;
}

export default function SettingsForm() {
  const { actor, applyLocalActor } = useAdminActor();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toggles, setToggles] = useState<Toggles | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingToggles, setSavingToggles] = useState(false);
  const [savedToggles, setSavedToggles] = useState(false);
  const [togglesError, setTogglesError] = useState<string | null>(null);

  useEffect(() => {
    if (actor) {
      setProfile({ name: actor.name ?? "" });
      setToggles({
        confirm_money_actions: actor.confirm_money_actions,
        confirm_destructive: actor.confirm_destructive,
        daily_briefing_enabled: actor.daily_briefing_enabled,
      });
    }
  }, [actor]);

  if (!actor || !profile || !toggles) {
    return (
      <div className="bg-white rounded-2xl border border-border-light p-10 text-center">
        <Loader2 className="w-5 h-5 text-warm-gray animate-spin mx-auto mb-2" />
        <p className="text-sm text-warm-gray">Loading your settings…</p>
      </div>
    );
  }

  function toggle(key: keyof Toggles) {
    setToggles((d) => (d ? { ...d, [key]: !d[key] } : d));
    setSavedToggles(false);
  }

  async function saveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setProfileError(j?.error ?? "Couldn't save your name.");
        return;
      }
      applyLocalActor({
        name: profile.name.trim().length > 0 ? profile.name.trim() : null,
      });
      setSavedProfile(true);
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveToggles() {
    if (!toggles) return;
    setSavingToggles(true);
    setTogglesError(null);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toggles),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setTogglesError(j?.error ?? "Couldn't save your settings.");
        return;
      }
      applyLocalActor(toggles);
      setSavedToggles(true);
    } finally {
      setSavingToggles(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile section */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.18em] text-warm-gray mb-3">
          Your profile
        </h2>
        <div className="bg-white rounded-2xl border border-border-light p-5">
          <div className="flex items-start gap-4">
            <span className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gold-dark" />
            </span>
            <div className="flex-1 min-w-0">
              <label className="block">
                <span className="text-sm font-medium text-charcoal block mb-1">
                  Your name
                </span>
                <span className="text-xs text-warm-gray block mb-2">
                  Shows up in the sidebar and on every audit entry so we can
                  see who did what.
                </span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ name: e.target.value });
                    setSavedProfile(false);
                  }}
                  placeholder="e.g. Luz Maria"
                  className="w-full max-w-sm px-3 py-2 border border-border rounded-lg text-sm text-charcoal focus:outline-none focus:border-gold"
                />
              </label>
              <p className="text-xs text-warm-gray mt-3">
                Signed in as <span className="font-medium">{actor.email}</span>{" "}
                · {actor.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-light">
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save name
            </button>
            {savedProfile && (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                <Check className="w-4 h-4" /> Saved.
              </span>
            )}
            {profileError && (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" /> {profileError}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Autonomy section */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.18em] text-warm-gray mb-3">
          How cautious should Luz be?
        </h2>

        {actor.role !== "owner" ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-sm text-amber-900">
              Autonomy settings are owner-only. You&apos;re signed in as{" "}
              <span className="font-medium">{actor.role}</span> — the owner
              can adjust these, or promote your account.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <ToggleCard
                icon={DollarSign}
                title="Always ask me before money goes out"
                description="Every refund or paid action shows up in Approvals first — Luz never spends a dollar without your tap."
                checked={toggles.confirm_money_actions}
                onToggle={() => toggle("confirm_money_actions")}
                cautionRecommended
              />
              <ToggleCard
                icon={ShieldCheck}
                title="Always ask me before customer-facing changes"
                description="Edits to products, customer tags, journal posts, and inbox replies all wait for your approval. Turn down once you trust Luz with the small stuff."
                checked={toggles.confirm_destructive}
                onToggle={() => toggle("confirm_destructive")}
              />
              <ToggleCard
                icon={Mail}
                title="Send me a daily briefing"
                description="A short morning email summarizing yesterday: new orders, revenue, anything that needs your attention. Sent through the configured email provider."
                checked={toggles.daily_briefing_enabled}
                onToggle={() => toggle("daily_briefing_enabled")}
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={saveToggles}
                disabled={savingToggles}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 disabled:opacity-60 transition-colors"
              >
                {savingToggles ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save changes
              </button>
              {savedToggles && (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                  <Check className="w-4 h-4" /> Saved.
                </span>
              )}
              {togglesError && (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" /> {togglesError}
                </span>
              )}
            </div>
          </>
        )}
      </section>
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
          aria-label={title}
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
