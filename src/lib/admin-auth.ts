// ─────────────────────────────────────────────────────────────
// Lace — Admin authentication helpers (server-only).
//
// Every admin write route should require an authenticated actor.
// The client attaches the Supabase JWT in an Authorization header
// (see src/lib/admin-fetch.ts); these helpers validate it against
// Supabase auth and return the mapped lace.app_users row.
//
// First-owner bootstrap:
//   - LACE_OWNER_EMAIL env var marks the owner's email. The first
//     authenticated visit by that email upserts an app_users row
//     with role='owner'. Everyone else lands as 'viewer' until
//     promoted from the console (Phase 2.L).
//   - If LACE_OWNER_EMAIL is unset, the very first sign-in becomes
//     owner. Defensible default for solo stores.
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { getLaceDb, type LaceServiceClient } from "./db";

export type ActorRole = "owner" | "staff" | "viewer";

export interface AdminActor {
  /** lace.app_users.id (uuid) */
  id: string;
  /** lace.app_users.auth_user_id — maps to auth.users.id. Null for
   *  rows provisioned before they ever signed in. */
  auth_user_id: string | null;
  email: string;
  name: string | null;
  role: ActorRole;
  confirm_money_actions: boolean;
  confirm_destructive: boolean;
  daily_briefing_enabled: boolean;
}

/** Human-readable label for audit_log.actor_label. */
export function actorLabel(actor: AdminActor): string {
  if (actor.name) return `${actor.name} (${actor.role})`;
  return `${actor.email} (${actor.role})`;
}

function extractJwt(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return match ? match[1] : null;
}

async function isFirstOwnerSlotOpen(
  db: LaceServiceClient,
): Promise<boolean> {
  const { count } = await db
    .from("app_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner");
  return (count ?? 0) === 0;
}

interface AppUserRow {
  id: string;
  auth_user_id: string | null;
  email: string;
  name: string | null;
  role: ActorRole;
  confirm_money_actions: boolean;
  confirm_destructive: boolean;
  daily_briefing_enabled: boolean;
}

const ACTOR_COLS =
  "id, auth_user_id, email, name, role, confirm_money_actions, confirm_destructive, daily_briefing_enabled";

/**
 * Validate a Supabase JWT, return (and lazily provision) the
 * matching lace.app_users row. Returns null when the JWT is
 * missing or invalid, or when the DB is not configured.
 */
export async function getAdminActor(
  req: NextRequest,
): Promise<AdminActor | null> {
  const jwt = extractJwt(req);
  if (!jwt) return null;
  const db = getLaceDb();
  if (!db) return null;

  const {
    data: { user },
    error,
  } = await db.auth.getUser(jwt);
  if (error || !user || !user.email) return null;
  const email = user.email.toLowerCase();

  // Find existing app_user by auth_user_id (preferred) or email.
  const existingByAuth = await db
    .from("app_users")
    .select(ACTOR_COLS)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (existingByAuth.data) {
    return existingByAuth.data as AppUserRow;
  }
  const existingByEmail = await db
    .from("app_users")
    .select(ACTOR_COLS)
    .eq("email", email)
    .maybeSingle();
  if (existingByEmail.data) {
    const row = existingByEmail.data as AppUserRow;
    // Backfill auth_user_id on the email row so subsequent lookups
    // hit the auth_user_id branch (faster, more stable).
    if (row.auth_user_id !== user.id) {
      await db
        .from("app_users")
        .update({ auth_user_id: user.id })
        .eq("id", row.id);
    }
    return { ...row, auth_user_id: user.id };
  }

  // First sight of this email — provision a row.
  const ownerEmail = process.env.LACE_OWNER_EMAIL?.toLowerCase().trim();
  let role: ActorRole;
  if (ownerEmail && email === ownerEmail) {
    role = "owner";
  } else if (!ownerEmail && (await isFirstOwnerSlotOpen(db))) {
    // No designated owner email and the table has no owners yet —
    // first authenticated visitor takes the chair.
    role = "owner";
  } else {
    role = "viewer";
  }

  const insert = await db
    .from("app_users")
    .insert({
      auth_user_id: user.id,
      email,
      name:
        (user.user_metadata?.name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        null,
      role,
    })
    .select(ACTOR_COLS)
    .single();
  if (insert.error || !insert.data) {
    console.error("[admin-auth] failed to provision app_user:", insert.error);
    return null;
  }
  return insert.data as AppUserRow;
}

/**
 * Helper for route handlers: returns the actor or null. Routes that
 * need a guaranteed actor should check for null themselves and
 * return a 401 — keeps the response shape under their control.
 */
export async function requireAdminActor(
  req: NextRequest,
): Promise<AdminActor | null> {
  return getAdminActor(req);
}
