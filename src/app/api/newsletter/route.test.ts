import { describe, expect, it } from "vitest";
import { normalizeSource } from "./route";

describe("normalizeSource", () => {
  it("passes through every allowlisted plain source", () => {
    const allowed = [
      "footer",
      "popup",
      "checkout",
      "whatsapp",
      "shop",
      "home",
      "inline",
      "journal",
    ];
    for (const src of allowed) {
      expect(normalizeSource(src)).toBe(src);
    }
  });

  it("preserves namespaced sources like journal:<slug> for attribution", () => {
    expect(normalizeSource("journal:bali-to-guadalajara")).toBe(
      "journal:bali-to-guadalajara",
    );
    expect(normalizeSource("campaign:spring-2026")).toBe("campaign:spring-2026");
  });

  it("falls back to 'footer' for unknown sources", () => {
    expect(normalizeSource("")).toBe("footer");
    expect(normalizeSource("totally-made-up")).toBe("footer");
    expect(normalizeSource("FOOTER")).toBe("footer");
  });

  it("rejects namespaced sources with invalid slug characters", () => {
    expect(normalizeSource("journal:has spaces")).toBe("footer");
    expect(normalizeSource("journal:UPPERCASE")).toBe("footer");
    expect(normalizeSource("journal:")).toBe("footer");
    expect(normalizeSource("journal:" + "a".repeat(81))).toBe("footer");
  });
});
