"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, DollarSign, Zap, Save, Check } from "lucide-react";
import type { ActorPolicy } from "@/lib/agent/router";

/**
 * Mom-mode knobs. This is the only place in the app where she can
 * dial Luz's leash up or down. Defaults ship cautious — we want her
 * first week to feel like a calm assistant, not a cowboy.
 *
 * Persists to localStorage for now (no DB column yet). When the
 * actor-policy becomes a real `lace.app_users` row, we can swap the
 * persistence layer without changing this component.
 */

const STORAGE_KEY = "lace.actor_policy.v1";

const DEFAULT_POLICY: ActorPolicy = {
  role: "owner",
  confirm_money_actions: true,
  confirm_destructive: true,
  auto_approve_money_limit_cents: 2500,
};

function readPolicy(): ActorPolicy {
  if (typeof window === "undefined") return DEFAULT_POLICY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_POLICY;
    return { ...DEFAULT_POLICY, ...JSON.parse(raw) } as ActorPolicy;
  } catch {
    return DEFAULT_POLICY;
  }
}

export default function SettingsForm() {
  const [policy, setPolicy] = useState<ActorPolicy>(DEFAULT_POLICY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPolicy(readPolicy());
  }, []);

  function update<K extends keyof ActorPolicy>(key: K, value: ActorPolicy[K]) {
    setPolicy((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function save() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const capDollars = Math.round((policy.auto_approve_money_limit_cents ?? 0) / 100);

  return (
    <div className="space-y-6">
      {/* Destructive guard (locked) */}
      <div className="bg-white rounded-2xl border border-border-light p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="font-heading text-lg text-charcoal">
                Destructive actions always ask
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-warm-gray bg-cream border border-border-light px-2 py-0.5 rounded-full">
                locked
              </span>
            </div>
            <p className="text-sm text-warm-gray leading-relaxed">
              Archiving a product, unsubscribing a customer, deleting anything
              — these always route to you. No toggle, by design.
            </p>
          </div>
        </div>
      </div>

      {/* Money confirm */}
      <div className="bg-white rounded-2xl border border-border-light p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-burgundy" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="font-heading text-lg text-charcoal">
                Confirm every money action
              </h3>
              <Toggle
                on={policy.confirm_money_actions}
                onChange={(v) => update("confirm_money_actions", v)}
              />
            </div>
            <p className="text-sm text-warm-gray leading-relaxed">
              When on, Luz asks before any refund, price change, or paid
              broadcast. Recommended for your first month.
            </p>
          </div>
        </div>

        {/* Auto-approve cap (only meaningful when confirm is OFF) */}
        <div
          className={`mt-5 pt-5 border-t border-border-light transition-opacity ${
            policy.confirm_money_actions ? "opacity-40" : ""
          }`}
        >
          <label className="block text-sm font-medium text-charcoal mb-1">
            Auto-approve small amounts up to{" "}
            <span className="font-heading text-burgundy">${capDollars}</span>
          </label>
          <p className="text-xs text-warm-gray mb-3">
            Only applies when confirmation is off. Refunds and price changes
            above this still ask.
          </p>
          <input
            type="range"
            min={0}
            max={10000}
            step={500}
            value={policy.auto_approve_money_limit_cents ?? 0}
            onChange={(e) =>
              update("auto_approve_money_limit_cents", Number(e.target.value))
            }
            disabled={policy.confirm_money_actions}
            className="w-full accent-burgundy"
          />
          <div className="flex justify-between text-[10px] text-warm-gray mt-1">
            <span>$0</span>
            <span>$100</span>
          </div>
        </div>
      </div>

      {/* Normal-edit caution */}
      <div className="bg-white rounded-2xl border border-border-light p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-gold-dark" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="font-heading text-lg text-charcoal">
                Ask before every edit
              </h3>
              <Toggle
                on={policy.confirm_destructive}
                onChange={(v) => update("confirm_destructive", v)}
              />
            </div>
            <p className="text-sm text-warm-gray leading-relaxed">
              Includes tagging customers, drafting replies you haven&apos;t
              seen, and journal posts. Turn off once you trust Luz&apos;s
              voice — she still shows everything in the log.
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
            <Check className="w-4 h-4" />
            Saved
          </span>
        )}
        <button
          onClick={save}
          className="inline-flex items-center gap-2 bg-burgundy text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-burgundy/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save preferences
        </button>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-burgundy" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
