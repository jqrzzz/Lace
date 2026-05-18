"use client";

// AdminProvider — receives the server-validated actor as initial
// state (passed from src/app/admin/layout.tsx), keeps it fresh, and
// exposes useAdminActor() to children. Sidebar count badges live
// here too so a single context drives every admin page.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
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
  refresh: async () => {},
  refreshCounts: async () => {},
  applyLocalActor: () => {},
});

export function AdminProvider({
  initialActor,
  children,
}: {
  initialActor: AdminActor;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [actor, setActor] = useState<AdminActor>(initialActor);
  const [counts, setCounts] = useState<AdminCounts>(EMPTY_COUNTS);

  const refreshCounts = useCallback(async () => {
    const res = await adminFetch("/api/admin/counts");
    if (!res.ok) return;
    const json = await res.json().catch(() => null);
    if (json?.data?.counts) setCounts(json.data.counts as AdminCounts);
  }, []);

  const refresh = useCallback(async () => {
    const res = await adminFetch("/api/admin/me");
    if (!res.ok) return;
    const json = await res.json().catch(() => null);
    if (json?.data?.actor) setActor(json.data.actor as AdminActor);
  }, []);

  useEffect(() => {
    // Re-pull counts whenever the route changes inside /admin. Cheap
    // (three head selects) and keeps the sidebar honest.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshCounts();
  }, [pathname, refreshCounts]);

  const applyLocalActor = useCallback((patch: Partial<AdminActor>) => {
    setActor((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <AdminContext.Provider
      value={{ actor, counts, refresh, refreshCounts, applyLocalActor }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminActor() {
  return useContext(AdminContext);
}
