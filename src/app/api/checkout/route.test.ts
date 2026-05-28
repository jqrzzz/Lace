import { describe, expect, it } from "vitest";
import { sanitizeGiftMessage } from "./route";

describe("sanitizeGiftMessage", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitizeGiftMessage(undefined)).toBe("");
    expect(sanitizeGiftMessage(null)).toBe("");
    expect(sanitizeGiftMessage(42)).toBe("");
    expect(sanitizeGiftMessage({})).toBe("");
  });

  it("trims and collapses internal whitespace", () => {
    expect(sanitizeGiftMessage("  hello   sister \n\n world ")).toBe(
      "hello sister world",
    );
  });

  it("caps length at 250 characters", () => {
    const long = "a".repeat(400);
    expect(sanitizeGiftMessage(long)).toHaveLength(250);
  });

  it("preserves a normal message unchanged", () => {
    const msg = "For my sister, on your confirmation — wear it in joy.";
    expect(sanitizeGiftMessage(msg)).toBe(msg);
  });
});
