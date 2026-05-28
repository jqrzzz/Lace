import { Zap, Clock, Radio, Hand } from "lucide-react";
import { playbooksByCategory } from "@/lib/agent/playbooks";
import PlaybookRunButton from "./PlaybookRunButton";

const CATEGORY_LABELS: Record<string, string> = {
  ops: "Operations",
  customers: "Customer care",
  marketing: "Marketing",
  editorial: "Editorial",
  mission: "Mission",
};

const TRIGGER_ICONS = {
  manual: Hand,
  scheduled: Clock,
  event: Radio,
} as const;

export default function PlaybooksPage() {
  const grouped = playbooksByCategory();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-charcoal mb-1">Playbooks</h1>
        <p className="text-sm text-warm-gray max-w-2xl">
          Reusable workflows Vela can run. Schedule them, trigger them on an
          event, or tap Run now. Every money or destructive step inside a
          playbook still routes through your approvals queue.
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(grouped).map(([cat, plays]) => (
          <section key={cat}>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-warm-gray mb-3">
              {CATEGORY_LABELS[cat] ?? cat} · {plays.length}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {plays.map((p) => {
                const Icon = TRIGGER_ICONS[p.trigger.kind];
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-border-light p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <h3 className="font-heading text-lg text-charcoal flex-1">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-sm text-warm-gray mb-4 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-warm-gray mb-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="w-3 h-3" />
                        {p.trigger.kind === "scheduled"
                          ? p.trigger.description
                          : p.trigger.kind === "event"
                          ? `on ${p.trigger.on}`
                          : "manual"}
                      </span>
                      <span>· ~{p.estTokens} tokens / run</span>
                    </div>

                    {p.allowedTools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {p.allowedTools.map((t) => (
                          <code
                            key={t}
                            className="text-[10px] bg-cream border border-border-light px-2 py-0.5 rounded-full text-charcoal"
                          >
                            {t}
                          </code>
                        ))}
                      </div>
                    )}

                    <PlaybookRunButton id={p.id} name={p.name} />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
