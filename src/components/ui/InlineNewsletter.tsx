"use client";

import { useState } from "react";
import { AlertCircle, Check, Mail } from "lucide-react";
import VelaAvatar from "@/components/ui/VelaAvatar";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface InlineNewsletterProps {
  /** Headline shown above the form. Defaults to brand voice. */
  heading?: string;
  /** Supporting copy below the headline. */
  copy?: string;
  /** Tone variant — ivory cream by default; "burgundy" for a darker block. */
  variant?: "ivory" | "burgundy";
  /** Optional source tag, sent to the API so we can attribute signups. */
  source?: string;
}

export default function InlineNewsletter({
  heading = "A letter, once a month",
  copy = "Slow reading on heritage, craft, and the women behind the veils — written by hand, sent only when there's something worth saying.",
  variant = "ivory",
  source = "inline",
}: InlineNewsletterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(body.error ?? "Couldn't add you — try again in a moment.");
        setLoading(false);
        return;
      }
      setSubscribed(true);
      track("newsletter_signup", { source });
    } catch {
      setErrorMsg("We couldn't reach the server. Please try again.");
    }
    setLoading(false);
  }

  const isBurgundy = variant === "burgundy";

  return (
    <div
      className={
        isBurgundy
          ? "relative rounded-2xl border border-gold/30 bg-gradient-to-br from-burgundy via-burgundy to-charcoal text-pearl overflow-hidden"
          : "relative rounded-2xl border border-border-light bg-cream overflow-hidden"
      }
    >
      <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
      <div className="relative p-7 sm:p-9 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <VelaAvatar size={72} ring={!isBurgundy} className="flex-shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2 font-medium">
            From Vela
          </p>
          <h3
            className={cn(
              "font-heading text-2xl mb-2",
              !isBurgundy && "text-charcoal",
            )}
          >
            {heading}
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed mb-5 max-w-md",
              isBurgundy ? "text-pearl/85" : "text-warm-gray",
            )}
          >
            {copy}
          </p>

          {subscribed ? (
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
                isBurgundy
                  ? "bg-gold/15 border border-gold/40"
                  : "bg-burgundy/10 border border-burgundy/25",
              )}
            >
              <Check
                className={cn(
                  "w-4 h-4",
                  isBurgundy ? "text-gold" : "text-burgundy",
                )}
                strokeWidth={2}
              />
              <span
                className={cn(
                  "text-sm",
                  isBurgundy ? "text-gold" : "text-burgundy font-medium",
                )}
              >
                You&apos;re on the list. Talk soon.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 max-w-md"
              aria-describedby={errorMsg ? "newsletter-error" : undefined}
            >
              <label className="flex-1 relative">
                <span className="sr-only">Email address</span>
                <Mail
                  className={cn(
                    "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4",
                    isBurgundy ? "text-pearl/60" : "text-warm-gray",
                  )}
                  strokeWidth={1.5}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-full text-sm focus:outline-none transition",
                    isBurgundy
                      ? "bg-white/[0.07] border border-white/15 text-white placeholder:text-pearl/50 focus:border-gold/50 focus:bg-white/[0.1]"
                      : "bg-white border border-border text-charcoal placeholder:text-warm-gray focus:border-gold",
                  )}
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "px-5 py-2.5 text-sm font-medium rounded-full transition disabled:opacity-60",
                  isBurgundy
                    ? "bg-gradient-to-r from-gold to-gold-light text-charcoal hover:shadow-[0_4px_20px_rgba(201,169,110,0.3)]"
                    : "bg-burgundy text-white hover:bg-burgundy/90",
                )}
              >
                {loading ? "…" : "Join the letter"}
              </button>
            </form>
          )}
          {errorMsg && !subscribed && (
            <p
              id="newsletter-error"
              role="alert"
              className={cn(
                "mt-3 inline-flex items-center gap-2 text-xs",
                isBurgundy ? "text-rose-gold" : "text-burgundy",
              )}
            >
              <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
