"use client";

// AdminProvider — fetches /api/admin/me once on mount, gates the
// admin layout on a successful response, redirects to /login when
// the actor isn't signed in. Exposes useAdminActor() to children so
// every page can render the actor's name, role, and preferences.

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

interface AdminContextValue {
  actor: AdminActor | null;
  loading: boolean;
  /** Re-fetch /api/admin/me — call after settings change. */
  refresh: () => Promise<void>;
  /** Optimistically update local state (settings form uses this). */
  applyLocalActor: (patch: Partial<AdminActor>) => void;
}

const AdminContext = createContext<AdminContextValue>({
  actor: null,
  loading: true,
  refresh: async () => {},
  applyLocalActor: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [actor, setActor] = useState<AdminActor | null>(null);
  const [loading, setLoading] = useState(true);
  const redirected = useRef(false);

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
  }, [router, pathname]);

  useEffect(() => {
    // refresh() does an async fetch and only updates state in the
    // resolved branch — the rule fires because it can't see across
    // the async boundary, but this is the documented pattern for
    // "subscribe for updates from an external system."
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const applyLocalActor = useCallback((patch: Partial<AdminActor>) => {
    setActor((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AdminContext.Provider
      value={{ actor, loading, refresh, applyLocalActor }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminActor() {
  return useContext(AdminContext);
}
