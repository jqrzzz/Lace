import { afterEach, describe, expect, it, vi } from "vitest";
import { track } from "./analytics";

// These tests run in the node environment (no DOM), so we attach/detach a
// minimal `window` stub through an untyped view of globalThis.
const g = globalThis as unknown as {
  window?: { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
};

afterEach(() => {
  delete g.window;
});

describe("track", () => {
  it("no-ops without throwing when there is no window (SSR)", () => {
    expect(() => track("add_to_cart", { item_id: "grace-veil" })).not.toThrow();
  });

  it("forwards to gtag as an event and strips undefined params", () => {
    const gtag = vi.fn();
    g.window = { gtag };
    track("add_to_cart", {
      item_id: "grace-veil",
      color: undefined,
      price: 49,
    });
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "add_to_cart", {
      item_id: "grace-veil",
      price: 49,
    });
  });

  it("falls back to dataLayer when gtag is absent", () => {
    g.window = { dataLayer: [] };
    track("newsletter_signup", { source: "footer" });
    expect(g.window.dataLayer).toEqual([
      { event: "newsletter_signup", source: "footer" },
    ]);
  });
});
