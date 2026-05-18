import { listAudit } from "@/lib/agent/store";
import { timeAgo } from "@/lib/format";
import AuditView from "./AuditView";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const entries = await listAudit(200);

  const rows = entries.map((e) => ({
    id: e.id,
    actor_label: e.actor_label,
    action: e.action,
    entity_type: e.entity_type ?? "",
    entity_id: e.entity_id ?? "",
    metadata: e.metadata,
    created_at: e.created_at,
    relative: timeAgo(e.created_at),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-charcoal mb-1">Audit log</h1>
        <p className="text-sm text-warm-gray max-w-2xl">
          Every approval the agent creates, every decision you make, every
          executed action — all in one scrollable trail. This is the trust
          surface: if something happened in the console, you can find it here.
        </p>
      </div>

      <AuditView rows={rows} />
    </div>
  );
}
