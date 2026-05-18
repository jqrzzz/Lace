// Happy-path coverage for every admin write route.
//
// We mock the actor (getAdminActor → owner) and the database
// (getLaceDb → recording mock). Each test POSTs a valid body and
// asserts the route returned 200 ok plus the right downstream call
// landed. Auth gating (401 / 403) is also covered for one
// representative route — the gate is identical across all eight.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { makeMockDb, findCall, type MockScenario } from "@/test/supabase-mock";
import type { AdminActor } from "@/lib/admin-auth";

let dbInstance: unknown;
let nextActor: AdminActor | null = null;

vi.mock("@/lib/db", () => ({
  getLaceDb: () => dbInstance,
  isLaceDbConfigured: () => true,
}));

vi.mock("@/lib/admin-auth", async () => {
  // Re-export actorLabel from the real module so audit rows render
  // the expected string format; stub getAdminActor for control.
  const real = await vi.importActual<typeof import("@/lib/admin-auth")>(
    "@/lib/admin-auth",
  );
  return {
    ...real,
    getAdminActor: async () => nextActor,
  };
});

// revalidatePath is a no-op outside the Next.js runtime.
vi.mock("next/cache", () => ({
  revalidatePath: () => {},
}));

import { POST as markShipped } from "@/app/api/admin/orders/[orderNumber]/mark-shipped/route";
import { POST as addTracking } from "@/app/api/admin/orders/[orderNumber]/add-tracking/route";
import { POST as refund } from "@/app/api/admin/orders/[orderNumber]/refund/route";
import { POST as assignGift } from "@/app/api/admin/mission/gifts/[id]/assign/route";
import { POST as deliverGift } from "@/app/api/admin/mission/gifts/[id]/mark-delivered/route";
import { POST as draftReply } from "@/app/api/admin/inbox/[id]/draft/route";
import { POST as sendReply } from "@/app/api/admin/inbox/[id]/send/route";
import { POST as archiveMsg } from "@/app/api/admin/inbox/[id]/archive/route";

const OWNER: AdminActor = {
  id: "u-1",
  auth_user_id: "auth-1",
  email: "mom@example.com",
  name: "Luz Maria",
  role: "owner",
  confirm_money_actions: true,
  confirm_destructive: true,
  daily_briefing_enabled: false,
};

const VIEWER: AdminActor = { ...OWNER, id: "u-2", role: "viewer" };

function setup(scenario: MockScenario = {}) {
  const handle = makeMockDb(scenario);
  dbInstance = handle.db;
  return handle;
}

function postJSON(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.RESEND_API_KEY;
  nextActor = OWNER;
});

describe("auth gating (representative: mark-shipped)", () => {
  it("returns 401 when there's no signed-in actor", async () => {
    nextActor = null;
    setup();
    const res = await markShipped(
      postJSON("https://x/api/admin/orders/LL-1/mark-shipped", {}),
      { params: Promise.resolve({ orderNumber: "LL-1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when the actor is a viewer", async () => {
    nextActor = VIEWER;
    setup();
    const res = await markShipped(
      postJSON("https://x/api/admin/orders/LL-1/mark-shipped", {}),
      { params: Promise.resolve({ orderNumber: "LL-1" }) },
    );
    expect(res.status).toBe(403);
  });
});

describe("POST /api/admin/orders/[orderNumber]/mark-shipped", () => {
  it("returns 200 and writes the order update + audit row", async () => {
    const handle = setup({
      updates: {
        orders: { data: { id: "order-1", order_number: "LL-2026-1042" } },
      },
    });
    const res = await markShipped(
      postJSON("https://x/api/admin/orders/LL-2026-1042/mark-shipped", {
        tracking_number: "TRK-1",
        carrier: "usps",
      }),
      { params: Promise.resolve({ orderNumber: "LL-2026-1042" }) },
    );
    expect(res.status).toBe(200);
    const update = findCall(handle.calls, { table: "orders", op: "update" });
    expect(update?.payload).toMatchObject({
      status: "shipped",
      tracking_number: "TRK-1",
    });
    expect(findCall(handle.calls, { table: "audit_log", op: "insert" })?.payload)
      .toMatchObject({ actor_label: "Luz Maria (owner)" });
  });
});

describe("POST /api/admin/orders/[orderNumber]/add-tracking", () => {
  it("requires a tracking number and writes the update", async () => {
    const handle = setup({
      updates: {
        orders: { data: { id: "order-1", order_number: "LL-2026-1042" } },
      },
    });
    // Missing tracking_number → 400
    const bad = await addTracking(
      postJSON("https://x/api/admin/orders/LL-2026-1042/add-tracking", {}),
      { params: Promise.resolve({ orderNumber: "LL-2026-1042" }) },
    );
    expect(bad.status).toBe(400);

    const good = await addTracking(
      postJSON("https://x/api/admin/orders/LL-2026-1042/add-tracking", {
        tracking_number: "TRK-1",
        carrier: "fedex",
      }),
      { params: Promise.resolve({ orderNumber: "LL-2026-1042" }) },
    );
    expect(good.status).toBe(200);
    expect(findCall(handle.calls, { table: "orders", op: "update" })?.payload)
      .toMatchObject({ tracking_number: "TRK-1", carrier: "fedex" });
  });
});

describe("POST /api/admin/orders/[orderNumber]/refund", () => {
  it("returns 403 when actor is staff (owner-only)", async () => {
    nextActor = { ...OWNER, role: "staff" };
    setup();
    const res = await refund(
      postJSON("https://x/api/admin/orders/LL-1/refund", {
        reason: "test",
      }),
      { params: Promise.resolve({ orderNumber: "LL-1" }) },
    );
    expect(res.status).toBe(403);
  });

  it("requires a reason on the body", async () => {
    setup();
    const res = await refund(
      postJSON("https://x/api/admin/orders/LL-1/refund", {}),
      { params: Promise.resolve({ orderNumber: "LL-1" }) },
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 and records the simulated refund when no Stripe key", async () => {
    const handle = setup({
      selects: {
        orders: {
          data: {
            id: "order-1",
            order_number: "LL-2026-1042",
            total_cents: 4900,
            stripe_payment_intent: "pi_test",
            status: "paid",
          },
        },
      },
      updates: { orders: { data: { id: "order-1" } } },
    });
    const res = await refund(
      postJSON("https://x/api/admin/orders/LL-2026-1042/refund", {
        amount_cents: 4900,
        reason: "Customer complaint",
      }),
      { params: Promise.resolve({ orderNumber: "LL-2026-1042" }) },
    );
    expect(res.status).toBe(200);
    const audit = findCall(handle.calls, {
      table: "audit_log",
      op: "insert",
    });
    expect(audit?.payload).toMatchObject({ action: "order.refund" });
    expect(
      ((audit?.payload as { metadata: Record<string, unknown> }).metadata as Record<string, unknown>).simulated,
    ).toBe(true);
  });
});

describe("POST /api/admin/mission/gifts/[id]/assign", () => {
  it("requires recipient_id and writes the update", async () => {
    const handle = setup({
      updates: { mission_gifts: { data: { id: "gift-1" } } },
    });
    const bad = await assignGift(
      postJSON("https://x/api/admin/mission/gifts/gift-1/assign", {}),
      { params: Promise.resolve({ id: "gift-1" }) },
    );
    expect(bad.status).toBe(400);

    const good = await assignGift(
      postJSON("https://x/api/admin/mission/gifts/gift-1/assign", {
        recipient_id: "rec-xyz",
      }),
      { params: Promise.resolve({ id: "gift-1" }) },
    );
    expect(good.status).toBe(200);
    expect(
      findCall(handle.calls, { table: "mission_gifts", op: "update" })?.payload,
    ).toMatchObject({ recipient_id: "rec-xyz", status: "allocated" });
  });
});

describe("POST /api/admin/mission/gifts/[id]/mark-delivered", () => {
  it("updates the gift with an optional story", async () => {
    const handle = setup({
      updates: { mission_gifts: { data: { id: "gift-1" } } },
    });
    const res = await deliverGift(
      postJSON("https://x/api/admin/mission/gifts/gift-1/mark-delivered", {
        story: "47 women wore them at Sunday service.",
      }),
      { params: Promise.resolve({ id: "gift-1" }) },
    );
    expect(res.status).toBe(200);
    const update = findCall(handle.calls, {
      table: "mission_gifts",
      op: "update",
    });
    expect(update?.payload).toMatchObject({
      status: "delivered",
      story: "47 women wore them at Sunday service.",
    });
  });
});

describe("POST /api/admin/inbox/[id]/draft", () => {
  it("rejects empty drafts and writes a draft on success", async () => {
    const handle = setup({
      updates: { contact_messages: { data: { id: "m-1" } } },
    });
    const empty = await draftReply(
      postJSON("https://x/api/admin/inbox/m-1/draft", { reply: "  " }),
      { params: Promise.resolve({ id: "m-1" }) },
    );
    expect(empty.status).toBe(400);

    const good = await draftReply(
      postJSON("https://x/api/admin/inbox/m-1/draft", {
        reply: "Hi, your veil will arrive by Friday.",
      }),
      { params: Promise.resolve({ id: "m-1" }) },
    );
    expect(good.status).toBe(200);
    expect(
      findCall(handle.calls, { table: "contact_messages", op: "update" })
        ?.payload,
    ).toMatchObject({
      reply_draft: "Hi, your veil will arrive by Friday.",
      status: "drafted",
    });
  });
});

describe("POST /api/admin/inbox/[id]/send", () => {
  it("sends (simulated, no key) and flips the message to replied", async () => {
    const handle = setup({
      selects: {
        contact_messages: {
          data: {
            id: "m-1",
            name: "Patricia",
            email: "patricia@example.com",
            subject: "Sizing question",
          },
        },
      },
      updates: {
        contact_messages: { data: { id: "m-1", email: "patricia@example.com" } },
      },
    });
    const res = await sendReply(
      postJSON("https://x/api/admin/inbox/m-1/send", {
        reply: "Hola Patricia — yes, it'll arrive in time.",
      }),
      { params: Promise.resolve({ id: "m-1" }) },
    );
    expect(res.status).toBe(200);
    const update = findCall(handle.calls, {
      table: "contact_messages",
      op: "update",
    });
    expect(update?.payload).toMatchObject({
      status: "replied",
      reply_draft: null,
    });
    expect(
      (update?.payload as Record<string, unknown>).reply_sent,
    ).toContain("Patricia");
    const audit = findCall(handle.calls, {
      table: "audit_log",
      op: "insert",
    });
    expect(
      ((audit?.payload as { metadata: Record<string, unknown> }).metadata as Record<string, unknown>).simulated,
    ).toBe(true);
  });
});

describe("POST /api/admin/inbox/[id]/archive", () => {
  it("archives the message and writes an audit row", async () => {
    const handle = setup({
      updates: { contact_messages: { data: { id: "m-1" } } },
    });
    const res = await archiveMsg(
      postJSON("https://x/api/admin/inbox/m-1/archive", {}),
      { params: Promise.resolve({ id: "m-1" }) },
    );
    expect(res.status).toBe(200);
    expect(
      findCall(handle.calls, { table: "contact_messages", op: "update" })
        ?.payload,
    ).toMatchObject({ status: "archived" });
    expect(findCall(handle.calls, { table: "audit_log", op: "insert" })?.payload)
      .toMatchObject({ action: "inbox.archived" });
  });
});
