"use client";

// AdminProvider — fetches /api/admin/me once on mount, gates the
// admin layout on a successful response, redirects to /login when
// the actor isn't signed in. Exposes useAdminActor() to children so
// every page can render the actor's name, role, and preferences.
// Also fetches /api/admin/counts so the sidebar can show how many
// things are waiting (approvals, inbox, pending mission gifts).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import type { AdminActor } from "@/lib/admin-auth";

export interface AdminCounts {
  approvals_pending: number;
  inbox_new: number;
  mission_pending: number;
}

interface AdminContextValue {
  actor: AdminActor | null;
  counts: AdminCounts;
  loading: boolean;
  /** Re-fetch /api/admin/me — call after settings change. */
  refresh: () => Promise<void>;
  /** Re-fetch /api/admin/counts — call after an action that changes a queue. */
  refreshCounts: () => Promise<void>;
  /** Optimistically update local state (settings form uses this). */
  applyLocalActor: (patch: Partial<AdminActor>) => void;
}

const EMPTY_COUNTS: AdminCounts = {
  approvals_pending: 0,
  inbox_new: 0,
  mission_pending: 0,
};

const AdminContext = createContext<AdminContextValue>({
  actor: null,
  counts: EMPTY_COUNTS,
  loading: true,
  refresh: async () => {},
  refreshCounts: async () => {},
  applyLocalActor: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [actor, setActor] = useState<AdminActor | null>(null);
  const [counts, setCounts] = useState<AdminCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const redirected = useRef(false);

  const refreshCounts = useCallback(async () => {
    const res = await adminFetch("/api/admin/counts");
    if (!res.ok) return;
    const json = await res.json().catch(() => null);
    if (json?.data?.counts) setCounts(json.data.counts as AdminCounts);
  }, []);

  const refresh = useCallback(async () => {
    const res = await adminFetch("/api/admin/me");
    if (res.status === 401) {
      if (!redirected.current) {
        redirected.current = true;
        const next = encodeURIComponent(pathname ?? "/admin");
        router.replace(`/login?next=${next}`);
      }
      setActor(null);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setActor(null);
      setLoading(false);
      return;
    }
    const json = await res.json().catch(() => null);
    setActor(json?.data?.actor ?? null);
    setLoading(false);
    void refreshCounts();
  }, [router, pathname, refreshCounts]);

  useEffect(() => {
    // refresh() does an async fetch and only updates state in the
    // resolved branch — the rule fires because it can't see across
    // the async boundary, but this is the documented pattern for
    // "subscribe for updates from an external system."
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  // Lightweight: re-pull counts whenever the route changes inside
  // /admin. Cheap (one tiny query) and keeps the sidebar honest.
  useEffect(() => {
    if (!actor) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshCounts();
  }, [pathname, actor, refreshCounts]);

  const applyLocalActor = useCallback((patch: Partial<AdminActor>) => {
    setActor((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AdminContext.Provider
      value={{
        actor,
        counts,
        loading,
        refresh,
        refreshCounts,
        applyLocalActor,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminActor() {
  return useContext(AdminContext);
}

