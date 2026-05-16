// Client-side fetch wrapper that attaches the Supabase JWT.
//
// Admin write routes validate the JWT via getAdminActor() — without
// this wrapper they'll 401. Wrapping in one place keeps every action
// island (OrderActions, PendingGiftRow, ReplyPane, etc.) short.

"use client";

import { getAuthClient } from "@/lib/db";

export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const supabase = getAuthClient();
  const headers = new Headers(init.headers ?? {});
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
  }
  return fetch(input, { ...init, headers });
}
