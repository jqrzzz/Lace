import { listApprovals } from "@/lib/lace/queries";
import ApprovalsQueue from "./ApprovalsQueue";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const [pending, approved, denied] = await Promise.all([
    listApprovals("pending"),
    listApprovals("approved"),
    listApprovals("denied"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-charcoal mb-1">Approvals</h1>
        <p className="text-sm text-warm-gray">
          Every money and destructive action the agent proposes lands here
          first. Nothing is executed without your tap.
        </p>
      </div>

      <ApprovalsQueue
        initialPending={pending}
        initialApproved={approved}
        initialDenied={denied}
      />
    </div>
  );
}
