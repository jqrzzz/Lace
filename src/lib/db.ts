// ─────────────────────────────────────────────────────────────
// Lace — typed Supabase clients.
//
// Three factories, all reading the same env vars:
//
//   getLaceDb()        — service-role + `lace` schema. Server only.
//                        Bypasses RLS. Never expose to the browser.
//
//   getLacePublicDb()  — anon key + `lace` schema. Safe in the
//                        browser. Subject to RLS — only the rows
//                        the policies in 0005/0007 permit.
//
//   getAuthClient()    — anon key, no schema pin. Used by the
//                        AuthProvider for Supabase Auth (magic links,
//                        sessions). Auth tables live in the `auth`
//                        schema, so this one must not pin to `lace`.
//
// When Lace moves to its own Supabase project later we only have
// to change the env vars — nothing in the callers needs to change.
// ─────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Concrete type of the service-role client returned by getLaceDb (never null). */
export type LaceServiceClient = NonNullable<ReturnType<typeof getLaceDb>>;

const LACE_SCHEMA = "lace" as const;

function url(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

function anonKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
}

/**
 * Server-only client. Uses the service role key and bypasses RLS.
 * Returns null if env is not configured so callers can fall back to
 * static data during local dev.
 */
export function getLaceDb() {
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
export function getLacePublicDb() {
  const u = url();
  const k = anonKey();
  if (!u || !k) return null;
  return createClient(u, k, {
    db: { schema: LACE_SCHEMA },
  });
}

// Cached so React subscribers (AuthProvider) keep the same instance
// across renders — Supabase Auth's onAuthStateChange depends on it.
let cachedAuthClient: SupabaseClient | null | undefined;

/**
 * Anon client without a schema pin, for Supabase Auth flows
 * (magic links, sessions). Same key as getLacePublicDb but does
 * not constrain queries to `lace`, so `auth.*` works as expected.
 */
export function getAuthClient(): SupabaseClient | null {
  if (cachedAuthClient !== undefined) return cachedAuthClient;
  const u = url();
  const k = anonKey();
  cachedAuthClient = u && k ? createClient(u, k) : null;
  return cachedAuthClient;
}

/** True when both URL + service key are present (server-side readiness check). */
export function isLaceDbConfigured(): boolean {
  return Boolean(url() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** True when URL + anon key are present (client-side readiness check). */
export function isSupabaseConfigured(): boolean {
  return Boolean(url() && anonKey());
}
