"use client";

// A warm, dismissible "here's how this works" card for the admin overview.
// Aimed at a non-technical owner landing for the first time: four plain steps,
// each a real link. Dismissal persists per-browser; once hidden it collapses
// to a single "Show getting-started" link so she can always bring it back.

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  Settings,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import VelaAvatar from "@/components/ui/VelaAvatar";

const DISMISS_KEY = "lace.start_here_dismissed.v1";
const CHANGE_EVENT = "lace:start-here-change";

// Read the persisted dismiss flag via useSyncExternalStore (same pattern as
// the theme provider) — lint-clean and hydration-safe, with the server
// snapshot defaulting to hidden so first paint matches a returning owner.
function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function getDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}
function writeDismissed(value: boolean) {
  try {
    if (value) window.localStorage.setItem(DISMISS_KEY, "1");
    else window.localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* ignore — non-persistent, no harm */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const STEPS = [
  {
    n: 1,
    icon: Settings,
    title: "Tell Vela how careful to be",
    body: "Decide what she can do on her own and what should wait for your yes.",
    href: "/admin/settings",
    cta: "Open settings",
  },
  {
    n: 2,
    icon: ShoppingBag,
    title: "Add your veils",
    body: "Set up the veils you sell — name, price, colors, and a short description.",
    href: "/admin/products",
    cta: "Go to products",
  },
  {
    n: 3,
    icon: Sparkles,
    title: "Let Vela do the busywork",
    body: "Ask her in plain words — draft a reply, look up an order, write a post.",
    href: "/admin/chat",
    cta: "Ask Vela",
  },
  {
    n: 4,
    icon: ShieldCheck,
    title: "Tap yes or no when she asks",
    body: "Anything that spends money or changes a customer waits for you in Approvals.",
    href: "/admin/approvals",
    cta: "See approvals",
  },
];

export default function StartHereCard() {
  const dismissed = useSyncExternalStore(
    subscribe,
    getDismissed,
    () => true, // server / pre-hydration: collapsed
  );

  if (dismissed) {
    return (
      <button
        onClick={() => writeDismissed(false)}
        className="mb-6 inline-flex items-center gap-2 text-xs text-warm-gray hover:text-charcoal transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-gold" />
        Show getting-started guide
      </button>
    );
  }

  return (
    <div className="relative mb-6 rounded-2xl border border-gold/30 bg-cream overflow-hidden">
      <div className="absolute inset-0 lace-pattern opacity-10 pointer-events-none" />
      <button
        onClick={() => writeDismissed(true)}
        aria-label="Hide getting-started guide"
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/70 border border-border flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <VelaAvatar size={56} className="flex-shrink-0" />
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium mb-1">
              From Vela
            </p>
            <h2 className="font-heading text-2xl text-charcoal leading-snug">
              Welcome — here&apos;s how we run things together
            </h2>
            <p className="text-sm text-warm-gray mt-1 max-w-xl">
              Four steps to get going. I&apos;ll handle the day-to-day; you stay
              in charge of anything that matters.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {STEPS.map((step) => (
            <Link
              key={step.n}
              href={step.href}
              className="group flex items-start gap-3 rounded-xl bg-white border border-border-light p-4 hover:border-gold transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center text-sm font-heading flex-shrink-0">
                {step.n}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal flex items-center gap-1.5">
                  <step.icon className="w-3.5 h-3.5 text-gold" />
                  {step.title}
                </p>
                <p className="text-xs text-warm-gray mt-0.5 leading-relaxed">
                  {step.body}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-burgundy mt-2 group-hover:gap-2 transition-all">
                  {step.cta}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
