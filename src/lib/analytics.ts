// Analytics — a thin, destination-agnostic event seam.
//
// Today this forwards to GA4 (window.gtag, set up in Analytics.tsx) when a
// NEXT_PUBLIC_GA_ID is configured, and otherwise pushes to dataLayer / logs
// in dev so events are visible while building. Swap the body of track() for
// PostHog/Segment/etc. later without touching any call site.
//
// Naming follows GA4 conventions where one exists (add_to_cart,
// begin_checkout); the rest are custom but kept snake_case for consistency.

export type AnalyticsEvent =
  | "add_to_cart"
  | "begin_checkout"
  | "newsletter_signup"
  | "veil_picker_completed"
  | "select_filter";

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(
  event: AnalyticsEvent,
  params: AnalyticsParams = {},
): void {
  if (typeof window === "undefined") return;

  // Drop undefined values so we never send empty keys to the destination.
  const clean: AnalyticsParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) clean[k] = v;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", event, clean);
    return;
  }

  // No GA destination wired yet. Keep events flowing into dataLayer (GTM
  // can pick them up) and surface them in dev for visibility.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...clean });
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event, clean);
  }
}
