// ─────────────────────────────────────────────────────────────
// Client-side fetch wrapper that understands our API envelope.
//
// `fetchJSON<T>(url, init)` returns the unwrapped `data` on success
// and throws `ApiClientError` on any failure (network, non-2xx,
// envelope `{ok: false}`). The server's `mode` flag is surfaced on
// the resolved result so UI can render a "demo mode" pill without
// re-parsing the response.
//
// Paired with `src/lib/api.ts` on the server.
// ─────────────────────────────────────────────────────────────

import type { ApiResponse, ResponseMode } from "./api";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface FetchJSONResult<T> {
  data: T;
  mode: ResponseMode | undefined;
}

export async function fetchJSON<T>(
  url: string,
  init?: RequestInit
): Promise<FetchJSONResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new ApiClientError(
      err instanceof Error ? err.message : "Network error"
    );
  }

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Invalid JSON from ${url} (${res.status})`,
      res.status
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
