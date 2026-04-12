import { listMessages, listSessions } from "@/lib/lace/queries";
import AgentChat from "./AgentChat";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const sessions = await listSessions();
  const active = sessions[0];
  const initialMessages = active ? await listMessages(active.id) : [];

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="font-heading text-3xl text-charcoal mb-1">
          Agent Chat
        </h1>
        <p className="text-sm text-warm-gray">
          Ask Luz anything — about a customer, an order, or have her draft
          something for you. Actions that spend money or change customer state
          always come back to you for approval first.
        </p>
      </div>

      <AgentChat sessions={sessions} initialMessages={initialMessages} />
    </div>
  );
}
