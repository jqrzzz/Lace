// Client-side fetch wrapper that attaches the Supabase JWT.
//
// Admin write routes validate the JWT via getAdminActor() — without
// this wrapper they'll 401. Wrapping in one place keeps every action
// island (OrderActions, PendingGiftRow, ReplyPane, etc.) short.

"use client";

import { getAuthClient } from "@/lib/db";
import { ApiClientError, type FetchJSONResult } from "@/lib/client";
import type { ApiResponse } from "@/lib/api";

async function attachAuth(init: RequestInit): Promise<RequestInit> {
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
  return { ...init, headers };
}

export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(input, await attachAuth(init));
}

/**
 * Typed JSON fetch with auth — same envelope contract as fetchJSON
 * in @/lib/client, but auto-attaches the Supabase JWT so admin API
 * routes (getAdminActor()) accept the call.
 */
export async function adminFetchJSON<T>(
  url: string,
  init: RequestInit = {},
): Promise<FetchJSONResult<T>> {
  let res: Response;
  try {
    res = await adminFetch(url, init);
  } catch (err) {
    throw new ApiClientError(
      err instanceof Error ? err.message : "Network error",
    );
  }
  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Invalid JSON from ${url} (${res.status})`,
      res.status,
    );
  }
  if (!body || !("ok" in body)) {
    throw new ApiClientError(`Malformed response from ${url}`, res.status);
  }
  if (!body.ok) {
    throw new ApiClientError(body.error, res.status, body.code);
  }
  return { data: body.data, mode: body.mode };
}
