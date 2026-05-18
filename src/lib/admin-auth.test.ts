// Tests for src/lib/admin-auth.ts.
//
// Covers the three paths through provisionOrFetchAppUser():
//   1. Existing app_user (matched by auth_user_id)
//   2. Existing app_user matched only by email — auth_user_id is backfilled
//   3. First-sight email — role determined by LACE_OWNER_EMAIL or
//      first-owner-slot-empty fallback
//
// Plus the JWT validation gate (getAdminActor) and a smoke test for
// the cookie flow.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMockDb, findCall, type MockScenario } from "@/test/supabase-mock";
import { NextRequest } from "next/server";

let dbInstance: unknown;
let dbConfigured = true;

vi.mock("@/lib/db", () => ({
  getLaceDb: () => (dbConfigured ? dbInstance : null),
  isLaceDbConfigured: () => dbConfigured,
}));

// next/headers cookies() is only used by getAdminActorFromCookies; we
// stub it so the cookie test can run.
let stubbedCookies: Array<{ name: string; value: string }> = [];
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => stubbedCookies,
  }),
}));

// @supabase/ssr's createServerClient is exercised only by the cookie
// path. Stub it to return our mock db so the same scenario applies.
let cookieAuthUser: { id: string; email: string } | null = null;
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: cookieAuthUser },
          error: cookieAuthUser ? null : { message: "no session" },
        }),
    },
  }),
}));

import { getAdminActor, getAdminActorFromCookies, actorLabel } from "./admin-auth";

function jwtRequest(): NextRequest {
  return new NextRequest("https://lace.test/api/admin/me", {
    headers: { authorization: "Bearer fake.jwt.token" },
  });
}

function noAuthRequest(): NextRequest {
  return new NextRequest("https://lace.test/api/admin/me");
}

function setup(scenario: MockScenario = {}) {
  const handle = makeMockDb(scenario);
  dbInstance = handle.db;
  return handle;
}

beforeEach(() => {
  delete process.env.LACE_OWNER_EMAIL;
  // The cookie-flow needs these to build a createServerClient. The
  // mocked createServerClient ignores them but the env-presence check
  // in getAdminActorFromCookies guards on them.
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://stub.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "stub-anon-key";
  dbConfigured = true;
  cookieAuthUser = null;
  stubbedCookies = [];
});

describe("getAdminActor — JWT path", () => {
  it("returns null when no Authorization header is present", async () => {
    setup();
    const actor = await getAdminActor(noAuthRequest());
    expect(actor).toBeNull();
  });

  it("returns null when DB is not configured", async () => {
    dbConfigured = false;
    setup();
    const actor = await getAdminActor(jwtRequest());
    expect(actor).toBeNull();
  });

  it("returns null when Supabase auth rejects the JWT", async () => {
    setup({
      authUser: { data: { user: null }, error: { message: "invalid" } },
    });
    const actor = await getAdminActor(jwtRequest());
    expect(actor).toBeNull();
  });

  it("returns the existing app_user row when auth_user_id matches", async () => {
    setup({
      authUser: {
        data: {
          user: { id: "auth-1", email: "mom@example.com" },
        },
      },
      selects: {
        app_users: {
          data: {
            id: "u-1",
            auth_user_id: "auth-1",
            email: "mom@example.com",
            name: "Luz Maria",
            role: "owner",
            confirm_money_actions: true,
            confirm_destructive: true,
            daily_briefing_enabled: false,
          },
        },
      },
    });

    const actor = await getAdminActor(jwtRequest());
    expect(actor).not.toBeNull();
    expect(actor?.id).toBe("u-1");
    expect(actor?.role).toBe("owner");
    expect(actor?.name).toBe("Luz Maria");
  });
});

describe("first-owner bootstrap", () => {
  it("provisions role='owner' when LACE_OWNER_EMAIL matches", async () => {
    process.env.LACE_OWNER_EMAIL = "mom@example.com";
    const handle = setup({
      authUser: {
        data: {
          user: { id: "auth-1", email: "Mom@Example.com" },
        },
      },
      selects: {
        // Both lookup attempts return no existing row.
        app_users: { data: null },
      },
      inserts: {
        app_users: {
          data: {
            id: "u-new",
            auth_user_id: "auth-1",
            email: "mom@example.com",
            name: null,
            role: "owner",
            confirm_money_actions: true,
            confirm_destructive: true,
            daily_briefing_enabled: false,
          },
        },
      },
    });

    const actor = await getAdminActor(jwtRequest());
    expect(actor?.role).toBe("owner");
    expect(actor?.id).toBe("u-new");

    const insert = findCall(handle.calls, {
      table: "app_users",
      op: "insert",
    });
    expect(insert?.payload).toMatchObject({
      auth_user_id: "auth-1",
      email: "mom@example.com", // normalized to lower-case
      role: "owner",
    });
  });

  it("provisions role='viewer' when LACE_OWNER_EMAIL doesn't match", async () => {
    process.env.LACE_OWNER_EMAIL = "mom@example.com";
    const handle = setup({
      authUser: {
        data: { user: { id: "auth-2", email: "stranger@example.com" } },
      },
      selects: { app_users: { data: null } },
      inserts: {
        app_users: {
          data: {
            id: "u-new",
            auth_user_id: "auth-2",
            email: "stranger@example.com",
            name: null,
            role: "viewer",
            confirm_money_actions: true,
            confirm_destructive: true,
            daily_briefing_enabled: false,
          },
        },
      },
    });
    const actor = await getAdminActor(jwtRequest());
    expect(actor?.role).toBe("viewer");
    expect(
      findCall(handle.calls, { table: "app_users", op: "insert" })?.payload,
    ).toMatchObject({ role: "viewer" });
  });

  it("makes the first visitor owner when LACE_OWNER_EMAIL is unset", async () => {
    // Don't set LACE_OWNER_EMAIL — the beforeEach already cleared it.
    setup({
      authUser: {
        data: { user: { id: "auth-3", email: "first@example.com" } },
      },
      // First two lookups (by auth_user_id, by email) → null
      // Third lookup (count of existing owners) → count: 0
      selects: {
        app_users: { data: null, count: 0 },
      },
      inserts: {
        app_users: {
          data: {
            id: "u-new",
            auth_user_id: "auth-3",
            email: "first@example.com",
            name: null,
            role: "owner",
            confirm_money_actions: true,
            confirm_destructive: true,
            daily_briefing_enabled: false,
          },
        },
      },
    });
    const actor = await getAdminActor(jwtRequest());
    expect(actor?.role).toBe("owner");
  });

  it("returns the existing row when auth_user_id matches (smoke for staff role)", async () => {
    // The mock returns the same select response for every lookup, so
    // we can't fully reproduce the "found by email, backfill
    // auth_user_id" path with stateful responses. A stateful mock is
    // worth adding later; for now this asserts the role flows through
    // and the actor is returned with role='staff' rather than being
    // collapsed to 'owner'.
    setup({
      authUser: {
        data: { user: { id: "auth-4", email: "preexisting@example.com" } },
      },
      selects: {
        app_users: {
          data: {
            id: "u-pre",
            auth_user_id: "auth-4",
            email: "preexisting@example.com",
            name: "Pre",
            role: "staff",
            confirm_money_actions: true,
            confirm_destructive: true,
            daily_briefing_enabled: false,
          },
        },
      },
    });
    const actor = await getAdminActor(jwtRequest());
    expect(actor?.id).toBe("u-pre");
    expect(actor?.role).toBe("staff");
  });
});

describe("getAdminActorFromCookies — cookie path", () => {
  it("returns null when there's no cookie session", async () => {
    setup();
    cookieAuthUser = null;
    const actor = await getAdminActorFromCookies();
    expect(actor).toBeNull();
  });

  it("validates the cookie session and returns the actor", async () => {
    cookieAuthUser = { id: "auth-5", email: "mom@example.com" };
    setup({
      selects: {
        app_users: {
          data: {
            id: "u-1",
            auth_user_id: "auth-5",
            email: "mom@example.com",
            name: "Luz Maria",
            role: "owner",
            confirm_money_actions: true,
            confirm_destructive: true,
            daily_briefing_enabled: false,
          },
        },
      },
    });
    const actor = await getAdminActorFromCookies();
    expect(actor?.role).toBe("owner");
    expect(actor?.email).toBe("mom@example.com");
  });
});

describe("actorLabel()", () => {
  it("prefers name + role suffix", () => {
    expect(
      actorLabel({
        id: "u-1",
        auth_user_id: "auth-1",
        email: "mom@example.com",
        name: "Luz Maria",
        role: "owner",
        confirm_money_actions: true,
        confirm_destructive: true,
        daily_briefing_enabled: false,
      }),
    ).toBe("Luz Maria (owner)");
  });

  it("falls back to email when name is missing", () => {
    expect(
      actorLabel({
        id: "u-1",
        auth_user_id: "auth-1",
        email: "anon@example.com",
        name: null,
        role: "viewer",
        confirm_money_actions: true,
        confirm_destructive: true,
        daily_briefing_enabled: false,
      }),
    ).toBe("anon@example.com (viewer)");
  });
});
