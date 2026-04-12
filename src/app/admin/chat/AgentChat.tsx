"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Sparkles, Wrench, ShieldCheck, User, Bot } from "lucide-react";
import type { AgentMessage, AgentSession } from "@/lib/lace/types";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "How are we doing today?",
  "Who bought the Esperanza veil this week?",
  "Draft a reply to Patricia about the quinceañera.",
  "Write a centennial Instagram caption.",
  "How many veils have we gifted to Nairobi?",
];

export default function AgentChat({
  sessions,
  initialMessages,
}: {
  sessions: AgentSession[];
  initialMessages: AgentMessage[];
}) {
  const [activeId, setActiveId] = useState(sessions[0]?.id ?? "");
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const turn = (messages[messages.length - 1]?.turn ?? 0) + 1;
    const userMsg: AgentMessage = {
      id: `local-${Date.now()}`,
      session_id: activeId,
      turn,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/agent/turn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: activeId,
          userText: text,
          actor: "Luz Maria (owner)",
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | {
            ok: true;
            data: { messages: AgentMessage[] };
            mode?: "live" | "demo";
          }
        | { ok: false; error: string }
        | null;
      if (body && body.ok && Array.isArray(body.data?.messages)) {
        setDemoMode(body.mode === "demo");
        if (body.data.messages.length > 0) {
          setMessages((m) => [...m, ...body.data.messages]);
        }
      } else {
        setMessages((m) => [
          ...m,
          {
            id: `local-${Date.now() + 1}`,
            session_id: activeId,
            turn: turn + 1,
            role: "assistant",
            content:
              "My connection blinked — try again in a moment.",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `local-${Date.now() + 1}`,
          session_id: activeId,
          turn: turn + 1,
          role: "assistant",
          content: "My connection blinked — try again in a moment.",
          created_at: new Date().toISOString(),
        },
      ]);
    }
    setSending(false);
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-220px)] min-h-[520px]">
      {/* Session list */}
      <aside className="bg-white border border-border-light rounded-2xl p-3 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray px-3 py-2">
          Recent sessions
        </p>
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={cn(
              "w-full text-left px-3 py-3 rounded-xl transition-colors",
              s.id === activeId
                ? "bg-cream"
                : "hover:bg-cream/60"
            )}
          >
            <p className="text-sm font-medium text-charcoal truncate">
              {s.title}
            </p>
            <p className="text-xs text-warm-gray mt-0.5">
              {s.actor_label} · {s.channel}
            </p>
            {s.approvals_pending > 0 && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-burgundy bg-burgundy/10 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-2.5 h-2.5" />
                {s.approvals_pending} pending
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Chat panel */}
      <div className="bg-white border border-border-light rounded-2xl flex flex-col overflow-hidden">
        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.length === 0 ? (
            <EmptyState onPick={(p) => setInput(p)} />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          {sending && (
            <div className="flex items-center gap-2 text-sm text-warm-gray">
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              Luz is thinking…
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border-light px-4 py-3 bg-cream">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="px-3 py-1.5 text-xs bg-white border border-border rounded-full text-warm-gray hover:text-charcoal hover:border-gold transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Luz…"
              className="flex-1 px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-5 py-3 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
          <p className="text-[10px] text-warm-gray mt-2 text-center flex items-center justify-center gap-2">
            {demoMode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 text-[9px] uppercase tracking-[0.15em]">
                Demo mode
              </span>
            )}
            Luz uses Claude + tool-use. Money and destructive steps route to
            Approvals.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5 text-gold" />
      </div>
      <h3 className="font-heading text-xl text-charcoal mb-1">
        How can I help?
      </h3>
      <p className="text-sm text-warm-gray max-w-md mb-6">
        I can look up orders and customers, draft replies and journal posts,
        and propose actions for your approval. Pick a starter below or ask me
        something in your own words.
      </p>
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="px-3 py-1.5 text-xs bg-white border border-border rounded-full text-warm-gray hover:text-charcoal hover:border-gold transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-xl bg-burgundy text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-charcoal text-white flex-shrink-0 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex-shrink-0 flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div className="max-w-xl">
          <div className="bg-cream rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-charcoal whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          {message.tool_name && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs bg-white border border-border rounded-full px-3 py-1.5">
              <Wrench className="w-3 h-3 text-gold" />
              <span className="text-warm-gray">
                Called <code className="text-charcoal">{message.tool_name}</code>
              </span>
              {message.approval_id && (
                <Link
                  href="/admin/approvals"
                  className="ml-1 text-burgundy hover:underline"
                >
                  · awaiting approval →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // system / tool roles — compact
  return (
    <div className="text-xs text-warm-gray italic text-center py-1">
      {message.content}
    </div>
  );
}

