// Tests for the product CRUD action handlers (createProduct,
// updateProduct, archiveProductBySlug, restoreProductBySlug).
// Same supabase-mock pattern the rest of the action tests use.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMockDb, findCall } from "@/test/supabase-mock";
import type { ActionContext } from "./actions";

let calls: ReturnType<typeof makeMockDb>["calls"];
let dbInstance: unknown;

vi.mock("@/lib/db", () => ({
  getLaceDb: () => dbInstance,
  isLaceDbConfigured: () => true,
}));

import {
  archiveProductBySlug,
  createProduct,
  restoreProductBySlug,
  updateProduct,
} from "./actions";

const ctx: ActionContext = {
  actorLabel: "Luz Maria (owner)",
  actorType: "user",
  approvalId: null,
};

function setup(scenarioOverrides: Parameters<typeof makeMockDb>[0] = {}) {
  const handle = makeMockDb(scenarioOverrides);
  dbInstance = handle.db;
  calls = handle.calls;
  return handle;
}

beforeEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
});

describe("createProduct", () => {
  it("validates and inserts when the slug is free", async () => {
    setup({
      selects: { products: { data: null } },
      inserts: {
        products: {
          data: { id: "prod-1", slug: "grace-veil", name: "Grace Veil" },
        },
      },
    });

    const r = await createProduct(
      dbInstance as never,
      {
        slug: "grace-veil",
        name: "Grace Veil",
        category: "signature",
        price_cents: 4900,
        metadata: { features: ["Bali lace"], preOrder: true },
      },
      ctx,
    );

    expect(r.ok).toBe(true);
    const insert = findCall(calls, { table: "products", op: "insert" });
    expect(insert?.payload).toMatchObject({
      slug: "grace-veil",
      name: "Grace Veil",
      category: "signature",
      price_cents: 4900,
      featured: false,
      metadata: { features: ["Bali lace"], preOrder: true },
    });
    expect(
      findCall(calls, { table: "audit_log", op: "insert" })?.payload,
    ).toMatchObject({ action: "product.create", entity_type: "product" });
  });

  it("rejects when the slug already exists", async () => {
    setup({
      selects: { products: { data: { id: "existing" } } },
    });
    const r = await createProduct(
      dbInstance as never,
      {
        slug: "grace-veil",
        name: "Grace Veil",
        category: "signature",
        price_cents: 4900,
      },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("already exists");
  });

  it("rejects a slug with bad characters", async () => {
    setup();
    const r = await createProduct(
      dbInstance as never,
      {
        slug: "Grace Veil!",
        name: "Grace Veil",
        category: "signature",
        price_cents: 4900,
      },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("lowercase letters");
  });

  it("rejects an unknown category", async () => {
    setup();
    const r = await createProduct(
      dbInstance as never,
      {
        slug: "x",
        name: "X",
        // @ts-expect-error -- intentionally invalid
        category: "nonsense",
        price_cents: 100,
      },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("collection");
  });

  it("rejects compare_at below price", async () => {
    setup();
    const r = await createProduct(
      dbInstance as never,
      {
        slug: "x",
        name: "X",
        category: "signature",
        price_cents: 5000,
        compare_at_cents: 4000,
      },
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("Compare-at");
  });
});

describe("updateProduct", () => {
  it("writes only the patched fields and audits with changed_fields", async () => {
    setup({
      updates: {
        products: {
          data: { id: "prod-1", slug: "grace-veil", name: "Grace Veil v2" },
        },
      },
    });
    const r = await updateProduct(
      dbInstance as never,
      "grace-veil",
      { name: "Grace Veil v2", price_cents: 5200 },
      ctx,
    );
    expect(r.ok).toBe(true);
    const update = findCall(calls, { table: "products", op: "update" });
    expect(update?.payload).toEqual({
      name: "Grace Veil v2",
      price_cents: 5200,
    });
    expect(update?.filters).toMatchObject({ slug: "grace-veil" });
    const audit = findCall(calls, { table: "audit_log", op: "insert" });
    expect(
      (audit?.payload as { metadata: Record<string, unknown> }).metadata,
    ).toMatchObject({
      slug: "grace-veil",
      changed_fields: ["name", "price_cents"],
    });
  });

  it("returns ok=false when nothing was patched", async () => {
    setup();
    const r = await updateProduct(
      dbInstance as never,
      "grace-veil",
      {},
      ctx,
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("Nothing to update");
  });

  it("returns ok=false when the slug doesn't exist", async () => {
    setup({ updates: { products: { data: null } } });
    const r = await updateProduct(
      dbInstance as never,
      "no-such-slug",
      { name: "X" },
      ctx,
    );
    expect(r.ok).toBe(false);
  });
});

describe("archiveProductBySlug / restoreProductBySlug", () => {
  it("archive sets active=false and audits product.archive", async () => {
    setup({
      updates: {
        products: { data: { id: "prod-1", slug: "x", name: "X" } },
      },
    });
    const r = await archiveProductBySlug(dbInstance as never, "x", ctx);
    expect(r.ok).toBe(true);
    const u = findCall(calls, { table: "products", op: "update" });
    expect(u?.payload).toEqual({ active: false });
    expect(
      findCall(calls, { table: "audit_log", op: "insert" })?.payload,
    ).toMatchObject({ action: "product.archive" });
  });

  it("restore sets active=true and audits product.restore", async () => {
    setup({
      updates: {
        products: { data: { id: "prod-1", slug: "x", name: "X" } },
      },
    });
    const r = await restoreProductBySlug(dbInstance as never, "x", ctx);
    expect(r.ok).toBe(true);
    const u = findCall(calls, { table: "products", op: "update" });
    expect(u?.payload).toEqual({ active: true });
    expect(
      findCall(calls, { table: "audit_log", op: "insert" })?.payload,
    ).toMatchObject({ action: "product.restore" });
  });

  it("returns ok=false when the slug isn't found", async () => {
    setup({ updates: { products: { data: null } } });
    const r = await archiveProductBySlug(dbInstance as never, "missing", ctx);
    expect(r.ok).toBe(false);
  });
});
