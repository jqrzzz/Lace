// ─────────────────────────────────────────────────────────────
// Lace — API response envelope helpers.
//
// Every route handler in /api/* should return one of these shapes
// so clients can rely on a single discriminator (`ok`). `mode` is
// tagged on responses from endpoints that have a demo fallback so
// the UI can render a "demo mode" chip when there's no API key.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

/** Flag exposed on responses from endpoints that have an offline fallback. */
export type ResponseMode = "live" | "demo";

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  mode?: ResponseMode;
}

export interface ApiFailure {
  ok: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** 200 OK with typed payload. */
export function ok<T>(data: T, opts?: { mode?: ResponseMode }): NextResponse {
  const body: ApiSuccess<T> = { ok: true, data };
  if (opts?.mode) body.mode = opts.mode;
  return NextResponse.json(body);
}

/** Non-2xx with a user-safe error message. */
export function fail(
  error: string,
  opts?: { status?: number; code?: string }
): NextResponse {
  const body: ApiFailure = { ok: false, error };
  if (opts?.code) body.code = opts.code;
  return NextResponse.json(body, { status: opts?.status ?? 500 });
}
