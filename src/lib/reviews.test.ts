import { describe, expect, it } from "vitest";
import { getProductReviews, reviewAggregate } from "./reviews";

describe("getProductReviews", () => {
  it("returns the product's own review first, then pads from the pool", () => {
    const reviews = getProductReviews("rosa-veil");
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0].productSlug).toBe("rosa-veil");
  });

  it("is deterministic for the same slug", () => {
    expect(getProductReviews("grace-veil")).toEqual(
      getProductReviews("grace-veil"),
    );
  });

  it("never returns more than the requested limit", () => {
    expect(getProductReviews("luz-veil", 2).length).toBeLessThanOrEqual(2);
  });

  it("still returns reviews for an unknown slug so the page reads as populated", () => {
    expect(getProductReviews("nonexistent-veil").length).toBeGreaterThan(0);
  });
});

describe("reviewAggregate", () => {
  it("returns null for an empty list", () => {
    expect(reviewAggregate([])).toBeNull();
  });

  it("averages ratings to one decimal and counts them", () => {
    const agg = reviewAggregate(getProductReviews("grace-veil"));
    expect(agg).not.toBeNull();
    expect(agg!.count).toBe(getProductReviews("grace-veil").length);
    expect(agg!.average).toBe(Math.round(agg!.average * 10) / 10);
    expect(agg!.average).toBeGreaterThanOrEqual(1);
    expect(agg!.average).toBeLessThanOrEqual(5);
  });
});
