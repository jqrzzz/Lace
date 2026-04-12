// ─────────────────────────────────────────────────────────────
// Lace — typed Supabase client, pinned to the `lace` schema.
//
// We deliberately keep two client factories:
//
//   getLaceDb()        — service-role client, bypasses RLS. Use
//                        from server code only (route handlers,
//                        server actions, workers). Never expose.
//
//   getLacePublicDb()  — anon client, obeys RLS. Safe to call from
//                        the browser for the public read paths we
//                        opened in 0005_lace_rls_and_grants.sql
//                        (active products, published journal,
//                        active mission recipients, etc).
//
// Both point at the `lace` schema so queries are written as plain
// table names (`.from("products")` not `.from("lace.products")`).
//
// When Lace moves to its own Supabase project later we only have
// to change the env vars — nothing in the callers needs to change.
// ─────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const LACE_SCHEMA = "lace" as const;

function url(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

/**
 * Server-only client. Uses the service role key and bypasses RLS.
 * Returns null if env is not configured so callers can fall back to
 * static data during local dev.
 */
export function getLaceDb(): SupabaseClient | null {
  const u = url();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!u || !serviceKey) return null;
  return createClient(u, serviceKey, {
    db: { schema: LACE_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Browser-safe client. Uses the anon key and is subject to RLS.
 * Returns null if env is not configured.
 */
export function getLacePublicDb(): SupabaseClient | null {
  const u = url();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!u || !anonKey) return null;
  return createClient(u, anonKey, {
    db: { schema: LACE_SCHEMA },
  });
}

/** True when both URL + service key are present (server-side readiness check). */
export function isLaceDbConfigured(): boolean {
  return Boolean(url() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
