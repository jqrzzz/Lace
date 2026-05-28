// POST /api/admin/products — create a product.
//
// Owner-only. Catalog edits affect the storefront, so we keep them
// behind the higher bar — staff route their product proposals
// through the agent's approval queue instead.

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { createProduct, type CreateProductPayload } from "@/lib/agent/actions";
import { actorLabel, getAdminActor } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api";

export async function POST(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return fail("Not signed in.", { status: 401 });
  if (actor.role !== "owner") {
    return fail("Catalog edits need an owner.", { status: 403 });
  }
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });

  const body = (await req.json().catch(() => ({}))) as CreateProductPayload;
  const result = await createProduct(db, body, {
    actorLabel: actorLabel(actor),
    actorType: "user",
  });
  if (!result.ok)
    return fail(result.error ?? "Could not create the product.", {
      status: 400,
    });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return ok({ effects: result.effects });
}
