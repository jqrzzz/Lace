// POST /api/admin/products/[slug]/restore — un-archive (active=true).

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getLaceDb } from "@/lib/db";
import { restoreProductBySlug } from "@/lib/agent/actions";
import { actorLabel, getAdminActor } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const actor = await getAdminActor(req);
  if (!actor) return fail("Not signed in.", { status: 401 });
  if (actor.role !== "owner") {
    return fail("Restore needs an owner.", { status: 403 });
  }
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).toLowerCase();
  const db = getLaceDb();
  if (!db) return fail("Database is not configured.", { status: 503 });

  const result = await restoreProductBySlug(db, slug, {
    actorLabel: actorLabel(actor),
    actorType: "user",
  });
  if (!result.ok)
    return fail(result.error ?? "Could not restore the product.", {
      status: 400,
    });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${raw}/edit`);
  revalidatePath("/shop");
  return ok({ effects: result.effects });
}
