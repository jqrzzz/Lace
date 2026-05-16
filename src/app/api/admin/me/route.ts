// GET /api/admin/me
//
// Returns the signed-in actor's profile + autonomy preferences.
// Provisions the lace.app_users row on first call (first sight of
// the LACE_OWNER_EMAIL becomes owner; otherwise viewer until
// promoted manually). Client wraps this in AdminProvider on every
// /admin page load.

import { NextRequest } from "next/server";
import { getAdminActor } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return fail("Not signed in.", { status: 401 });
  return ok({ actor });
}
