// Server-side gate for every /admin/* page. Validates the actor
// against lace.app_users via the Supabase auth cookie and redirects
// when missing. Renders the client AdminShell only after.

import { redirect } from "next/navigation";
import { getAdminActorFromCookies } from "@/lib/admin-auth";
import { isLaceDbConfigured } from "@/lib/db";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In zero-config dev the DB isn't wired — fall back to a non-blocking
  // demo actor so the admin still renders. Production has the DB so this
  // branch never runs there.
  if (!isLaceDbConfigured()) {
    return (
      <AdminShell
        initialActor={{
          id: "demo",
          auth_user_id: null,
          email: "demo@local",
          name: "Demo Owner",
          role: "owner",
          confirm_money_actions: true,
          confirm_destructive: true,
          daily_briefing_enabled: false,
        }}
      >
        {children}
      </AdminShell>
    );
  }

  const actor = await getAdminActorFromCookies();
  if (!actor) {
    redirect("/login?next=/admin");
  }
  if (actor.role === "viewer") {
    redirect("/?notice=admin-access-needed");
  }

  return <AdminShell initialActor={actor}>{children}</AdminShell>;
}
