// Tests for the DB-backed dispatch in src/lib/agent/store.ts.
//
// We mock @/lib/db so getLaceDb() returns a fake supabase client
// that records every (table, op, payload). Each test then drives
// the public store API and asserts on the recorded calls — no real
// DB, no network.

import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockCall {
  table: string;
  op: "select" | "insert" | "update" | "upsert";
  payload?: unknown;
  filters?: Record<string, unknown>;
}

const calls: MockCall[] = [];

function makeClient() {
  return {
    from: (table: string) => {
      const filters: Record<string, unknown> = {};
      const builder = {
        select: () => ({
          eq: (col: string, val: unknown) => {
            filters[col] = val;
            return {
              maybeSingle: () => {
                calls.push({ table, op: "select", filters: { ...filters } });
                return Promise.resolve({
                  data: { id: `${table}-found`, agent_messages: [] },
                  error: null,
                });
              },
              order: () => ({
                then: <R,>(
                  cb: (v: {
                    data: Record<string, unknown>[];
                    error: null;
                  }) => R | PromiseLike<R>,
                ) =>
                  Promise.resolve({
                    data: [{ id: `${table}-1` }],
                    error: null,
                  }).then(cb),
              }),
            };
          },
          order: () => {
            const out = {
              eq: (col: string, val: unknown) => {
                filters[col] = val;
                return out;
              },
              limit: (n: number) => {
                filters._limit = n;
                return out;
              },
              then: <R,>(
                cb: (v: {
                  data: Record<string, unknown>[];
                  error: null;
                }) => R | PromiseLike<R>,
              ) => {
                calls.push({
                  table,
                  op: "select",
                  filters: { ...filters },
                });
                return Promise.resolve({
                  data: [{ id: `${table}-1`, agent_messages: [] }],
                  error: null,
                }).then(cb);
              },
            };
            return out;
          },
        }),
        insert: (payload: unknown) => {
          calls.push({ table, op: "insert", payload });
          return {
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: `${table}-1`,
                    ...(payload as object),
                    agent_messages: [],
                  },
                  error: null,
                }),
            }),
            then: <R,>(
              cb: (v: { data: null; error: null }) => R | PromiseLike<R>,
            ) => Promise.resolve({ data: null, error: null }).then(cb),
          };
        },
        update: (payload: unknown) => {
          calls.push({ table, op: "update", payload });
          return {
            eq: (col: string, val: unknown) => {
              filters[col] = val;
              return {
                select: () => ({
                  maybeSingle: () =>
                    Promise.resolve({
                      data: {
                        id: val,
                        ...(payload as object),
                      },
                      error: null,
                    }),
                }),
              };
            },
          };
        },
      };
      return builder;
    },
  };
}

vi.mock("@/lib/db", () => {
  return {
    getLaceDb: () => makeClient(),
    isLaceDbConfigured: () => true,
  };
});

import {
  appendMessage,
  createApproval,
  createSession,
  decideApproval,
  executeApproval,
  listInboxStore,
  updateInboxMessage,
  writeAudit,
} from "./store";
import type { ApprovalRow } from "@/lib/lace/types";

function fakeApproval(
  action_type: string,
  payload: Record<string, unknown>,
): ApprovalRow {
  return {
    id: "a-1",
    session_id: null,
    action_type,
    action_payload: payload,
    human_summary: "test",
    risk: "normal",
    status: "approved",
    requested_by_label: "Agent",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600_000).toISOString(),
    executed_at: new Date().toISOString(),
  };
}

beforeEach(() => {
  calls.length = 0;
});

describe("agent/store — DB dispatch", () => {
  it("createApproval inserts into agent_approvals and audits", async () => {
    const approval = await createApproval({
      session_id: "s-1",
      action_type: "refund_order",
      action_payload: { order_number: "LL-2026-1042", amount_cents: 4900 },
      human_summary: "Refund $49 on LL-2026-1042.",
      risk: "money",
      requested_by_label: "Agent",
    });

    expect(approval.id).toBe("agent_approvals-1");

    const inserts = calls.filter((c) => c.op === "insert");
    expect(inserts.map((c) => c.table)).toEqual([
      "agent_approvals",
      "audit_log",
    ]);

    const approvalInsert = inserts[0].payload as Record<string, unknown>;
    expect(approvalInsert).toMatchObject({
      session_id: "s-1",
      action_type: "refund_order",
      human_summary: "Refund $49 on LL-2026-1042.",
      risk: "money",
      requested_by_label: "Agent",
      status: "pending",
    });

    const auditInsert = inserts[1].payload as Record<string, unknown>;
    expect(auditInsert).toMatchObject({
      actor_type: "agent",
      action: "approval.created",
      entity_type: "approval",
    });
  });

  it("decideApproval updates the row and writes a user-actor audit", async () => {
    const updated = await decideApproval(
      "a-xyz",
      "approved",
      "Luz Maria (owner)",
      "ok by me",
    );

    expect(updated).not.toBeNull();
    expect(updated!.id).toBe("a-xyz");

    const update = calls.find((c) => c.op === "update");
    expect(update?.table).toBe("agent_approvals");
    expect(update?.payload).toMatchObject({
      status: "approved",
      review_comment: "ok by me",
    });
    expect((update?.payload as Record<string, unknown>).executed_at).toEqual(
      expect.any(String),
    );

    const auditInsert = calls.find(
      (c) => c.op === "insert" && c.table === "audit_log",
    );
    expect(auditInsert?.payload).toMatchObject({
      actor_type: "user",
      actor_label: "Luz Maria (owner)",
      action: "approval.approved",
    });
  });

  it("appendMessage inserts into agent_messages with the turn payload", async () => {
    const m = await appendMessage({
      session_id: "s-1",
      turn: 5,
      role: "assistant",
      content: "Sure thing.",
      tool_name: null,
      tool_input: null,
      tool_output: null,
      approval_id: null,
    });

    expect(m.id).toBe("agent_messages-1");
    const insert = calls.find(
      (c) => c.op === "insert" && c.table === "agent_messages",
    );
    expect(insert?.payload).toMatchObject({
      session_id: "s-1",
      turn: 5,
      role: "assistant",
      content: "Sure thing.",
    });
  });

  it("createSession inserts into agent_sessions with channel default", async () => {
    const s = await createSession({
      title: "Morning",
      actor_label: "Luz Maria (owner)",
    });

    expect(s.id).toBe("agent_sessions-1");
    const insert = calls.find(
      (c) => c.op === "insert" && c.table === "agent_sessions",
    );
    expect(insert?.payload).toMatchObject({
      title: "Morning",
      actor_label: "Luz Maria (owner)",
      channel: "console",
    });
  });

  it("listInboxStore selects from contact_messages ordered by created_at desc", async () => {
    const rows = await listInboxStore();
    expect(rows).toEqual(expect.any(Array));

    const select = calls.find(
      (c) => c.op === "select" && c.table === "contact_messages",
    );
    expect(select).toBeDefined();
  });

  it("updateInboxMessage updates contact_messages and returns the row", async () => {
    const updated = await updateInboxMessage("m-1", {
      status: "drafted",
      reply_draft: "Hello Patricia — yes, in time.",
    });
    expect(updated).not.toBeNull();
    expect(updated!.id).toBe("m-1");

    const update = calls.find(
      (c) => c.op === "update" && c.table === "contact_messages",
    );
    expect(update?.payload).toMatchObject({
      status: "drafted",
      reply_draft: "Hello Patricia — yes, in time.",
    });
  });

  it("executeApproval(mark_order_shipped) updates the order in DB", async () => {
    const result = await executeApproval(
      fakeApproval("mark_order_shipped", {
        order_number: "LL-2026-1042",
        tracking_number: "9405511899223456789001",
        carrier: "usps",
      }),
      "Luz Maria (owner)",
    );

    expect(result.effects[0]).toContain("shipped");

    const update = calls.find(
      (c) => c.op === "update" && c.table === "orders",
    );
    expect(update?.payload).toMatchObject({
      status: "shipped",
      tracking_number: "9405511899223456789001",
      carrier: "usps",
    });
    expect(
      (update?.payload as Record<string, unknown>).shipped_at,
    ).toEqual(expect.any(String));

    const audits = calls.filter(
      (c) => c.op === "insert" && c.table === "audit_log",
    );
    // First audit row comes from the action handler itself (order.mark_shipped);
    // the second is the approval.executed wrapper that records mom's decision.
    expect(audits[0].payload).toMatchObject({
      action: "order.mark_shipped",
      actor_type: "user",
      entity_type: "order",
    });
    expect(audits[1].payload).toMatchObject({
      action: "approval.executed",
      metadata: expect.objectContaining({
        action_type: "mark_order_shipped",
        executed: "real",
      }),
    });
  });

  it("executeApproval(assign_mission_gift) updates the gift in DB", async () => {
    const result = await executeApproval(
      fakeApproval("assign_mission_gift", {
        gift_id: "gift-abc",
        recipient_id: "rec-xyz",
      }),
      "Luz Maria (owner)",
    );

    expect(result.effects[0]).toContain("assigned");
    const update = calls.find(
      (c) => c.op === "update" && c.table === "mission_gifts",
    );
    expect(update?.payload).toMatchObject({
      recipient_id: "rec-xyz",
      status: "allocated",
    });
    expect(
      (update?.payload as Record<string, unknown>).allocated_at,
    ).toEqual(expect.any(String));
  });

  it("writeAudit defaults actor_type to 'agent' when not provided", async () => {
    await writeAudit({
      actor_label: "Playbook runner",
      action: "playbook.started",
      entity_type: "playbook",
      entity_id: "pb-1",
      metadata: { name: "Morning briefing" },
    });

    const insert = calls.find(
      (c) => c.op === "insert" && c.table === "audit_log",
    );
    expect(insert?.payload).toMatchObject({
      actor_type: "agent",
      action: "playbook.started",
    });
  });
});
