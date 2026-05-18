// Shared Supabase client mock for vitest.
//
// Records every operation it sees and returns canned responses
// configured per test. Each test wires up the responses it needs;
// anything not configured returns a benign success so the handler
// under test can keep flowing.
//
// Mock supports the supabase-js shapes we actually use:
//   db.from(t).select(cols).eq(col, val).maybeSingle()
//   db.from(t).select(cols).eq(col, val).order(...).limit(n) -> awaitable
//   db.from(t).select(cols).order(...).eq(...).limit(...)    -> awaitable
//   db.from(t).select(cols, {count:'exact', head:true}).eq(...) -> awaitable
//   db.from(t).insert(payload).select(cols).single()
//   db.from(t).insert(payload).select(cols).maybeSingle()
//   db.from(t).insert(payload) -> awaitable (no select)
//   db.from(t).update(payload).eq(col, val).select(cols).maybeSingle()
//   db.from(t).update(payload).eq(col, val) -> awaitable
//   db.from(t).upsert(payload, opts).select(cols).single()
//   db.auth.getUser(jwt) -> configured response

import { vi } from "vitest";

export interface MockCall {
  table: string;
  op: "select" | "insert" | "update" | "upsert";
  payload?: unknown;
  /** Filters captured from chained .eq() calls. */
  filters?: Record<string, unknown>;
  /** Whether the call asked for { count: 'exact', head: true }. */
  countOnly?: boolean;
}

export interface MockScenario {
  /**
   * select responses keyed by `${table}` — the same key fires for
   * any select on the given table. The mock returns this object
   * from `.maybeSingle()` and wraps it as `{ data: [response] }` for
   * `.then()` (array result).
   */
  selects?: Record<string, { data: unknown; count?: number; error?: unknown }>;
  /** insert -> returned row when chained with .select().single() */
  inserts?: Record<string, { data: unknown; error?: unknown }>;
  /** update -> returned row when chained with .select().maybeSingle() */
  updates?: Record<string, { data: unknown; error?: unknown }>;
  /** upsert -> returned row when chained with .select().single() */
  upserts?: Record<string, { data: unknown; error?: unknown }>;
  /** db.auth.getUser response — typically { user: {...} } or { user: null, error } */
  authUser?: {
    data: { user: { id: string; email: string; user_metadata?: Record<string, unknown> } | null };
    error?: unknown;
  };
}

export interface MockHandle {
  db: unknown;
  calls: MockCall[];
}

export function makeMockDb(scenario: MockScenario = {}): MockHandle {
  const calls: MockCall[] = [];

  const selectResp = (table: string) =>
    scenario.selects?.[table] ?? { data: null, count: 0, error: null };
  const insertResp = (table: string) =>
    scenario.inserts?.[table] ?? { data: { id: `${table}-1` }, error: null };
  const updateResp = (table: string) =>
    scenario.updates?.[table] ?? { data: { id: `${table}-1` }, error: null };
  const upsertResp = (table: string) =>
    scenario.upserts?.[table] ?? { data: { id: `${table}-1` }, error: null };

  const buildArrayResult = (
    table: string,
    filters: Record<string, unknown>,
    countOnly: boolean,
  ) => {
    calls.push({
      table,
      op: "select",
      filters: { ...filters },
      countOnly,
    });
    const resp = selectResp(table);
    const data = Array.isArray(resp.data)
      ? resp.data
      : resp.data === null
        ? []
        : [resp.data];
    return {
      data: countOnly ? null : data,
      count: resp.count ?? data.length,
      error: resp.error ?? null,
    };
  };

  const fromBuilder = (table: string) => {
    const filters: Record<string, unknown> = {};
    let countOnly = false;

    function selectChain() {
      return {
        eq(col: string, val: unknown) {
          filters[col] = val;
          return selectChainAfterEq();
        },
        in(col: string, vals: unknown[]) {
          filters[col] = vals;
          return selectChainAfterEq();
        },
        gte(col: string, val: unknown) {
          filters[`${col}__gte`] = val;
          return selectChainAfterEq();
        },
        order() {
          return selectChainAfterEq();
        },
      };
    }

    function selectChainAfterEq() {
      return {
        eq(col: string, val: unknown) {
          filters[col] = val;
          return selectChainAfterEq();
        },
        in(col: string, vals: unknown[]) {
          filters[col] = vals;
          return selectChainAfterEq();
        },
        gte(col: string, val: unknown) {
          filters[`${col}__gte`] = val;
          return selectChainAfterEq();
        },
        order() {
          return selectChainAfterEq();
        },
        limit() {
          return selectChainAfterEq();
        },
        maybeSingle() {
          calls.push({
            table,
            op: "select",
            filters: { ...filters },
            countOnly,
          });
          const resp = selectResp(table);
          return Promise.resolve({ data: resp.data, error: resp.error ?? null });
        },
        single() {
          calls.push({
            table,
            op: "select",
            filters: { ...filters },
            countOnly,
          });
          const resp = selectResp(table);
          return Promise.resolve({ data: resp.data, error: resp.error ?? null });
        },
        then<R>(
          cb: (v: { data: unknown; count: number; error: unknown }) => R | PromiseLike<R>,
        ) {
          const result = buildArrayResult(table, filters, countOnly);
          return Promise.resolve(result).then(cb);
        },
      };
    }

    return {
      select(_cols?: string, opts?: { count?: string; head?: boolean }) {
        if (opts?.head) countOnly = true;
        return selectChain();
      },
      insert(payload: unknown) {
        calls.push({ table, op: "insert", payload });
        const resp = insertResp(table);
        return {
          select() {
            return {
              single() {
                return Promise.resolve({
                  data: resp.data,
                  error: resp.error ?? null,
                });
              },
              maybeSingle() {
                return Promise.resolve({
                  data: resp.data,
                  error: resp.error ?? null,
                });
              },
              then<R>(
                cb: (v: { data: unknown; error: unknown }) => R | PromiseLike<R>,
              ) {
                const data = Array.isArray(resp.data) ? resp.data : [resp.data];
                return Promise.resolve({
                  data,
                  error: resp.error ?? null,
                }).then(cb);
              },
            };
          },
          then<R>(
            cb: (v: { data: unknown; error: unknown }) => R | PromiseLike<R>,
          ) {
            return Promise.resolve({
              data: null,
              error: resp.error ?? null,
            }).then(cb);
          },
        };
      },
      update(payload: unknown) {
        const updateCall: MockCall = {
          table,
          op: "update",
          payload,
          filters,
        };
        calls.push(updateCall);
        const resp = updateResp(table);
        return {
          eq(col: string, val: unknown) {
            filters[col] = val;
            return {
              select() {
                return {
                  maybeSingle() {
                    return Promise.resolve({
                      data: resp.data,
                      error: resp.error ?? null,
                    });
                  },
                  single() {
                    return Promise.resolve({
                      data: resp.data,
                      error: resp.error ?? null,
                    });
                  },
                };
              },
              then<R>(
                cb: (v: { data: unknown; error: unknown }) => R | PromiseLike<R>,
              ) {
                return Promise.resolve({
                  data: null,
                  error: resp.error ?? null,
                }).then(cb);
              },
            };
          },
        };
      },
      upsert(payload: unknown) {
        calls.push({ table, op: "upsert", payload });
        const resp = upsertResp(table);
        return {
          select() {
            return {
              single() {
                return Promise.resolve({
                  data: resp.data,
                  error: resp.error ?? null,
                });
              },
            };
          },
          then<R>(
            cb: (v: { data: unknown; error: unknown }) => R | PromiseLike<R>,
          ) {
            return Promise.resolve({
              data: null,
              error: resp.error ?? null,
            }).then(cb);
          },
        };
      },
    };
  };

  const db = {
    from: vi.fn(fromBuilder),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve(
          scenario.authUser ?? { data: { user: null }, error: null },
        ),
      ),
    },
  };

  return { db, calls };
}

/** Convenience: find the first call matching predicate. */
export function findCall(
  calls: MockCall[],
  predicate: Partial<MockCall>,
): MockCall | undefined {
  return calls.find((c) =>
    Object.entries(predicate).every(([k, v]) => {
      if (k === "filters" && typeof v === "object" && v !== null) {
        return Object.entries(v as Record<string, unknown>).every(
          ([fk, fv]) => c.filters?.[fk] === fv,
        );
      }
      return (c as unknown as Record<string, unknown>)[k] === v;
    }),
  );
}
