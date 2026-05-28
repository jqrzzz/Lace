"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { fetchJSON } from "@/lib/client";
import { pickFollowups } from "@/lib/concierge-followups";
import VelaAvatar from "@/components/ui/VelaAvatar";

/**
 * Public-facing chat concierge — the shopper's Vela. Grounded in the
 * brand FAQ and policies; no order lookups, no personal data. Goal
 * is deflection: answer the quick questions a human would otherwise
 * have to type out, and hand off to a human for anything real.
 *
 * The widget is mounted globally in the storefront shell. It is
 * hidden on /admin, /cart, and /order/success where it would clash.
 */

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "How big are the veils?",
  "How do I wash it?",
  "How fast is shipping?",
  "Tell me about the gifting",
];

export default function ConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const nextHistory: Msg[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextHistory);
    setInput("");
    setSending(true);
    try {
      const { data } = await fetchJSON<{ reply: string }>(
        "/api/concierge/turn",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            history: nextHistory.slice(0, -1),
            userText: trimmed,
          }),
        }
      );
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ??
            "I'm taking a quiet moment — could you try that again in a bit?",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "My connection blinked. Give me a moment and try again — or email hello@lacebylaluz.com.",
        },
      ]);
    }
    setSending(false);
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge chat" : "Chat with Vela"}
        className={
          open
            ? "fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full bg-burgundy text-white shadow-xl hover:bg-burgundy/90 flex items-center justify-center transition-transform hover:scale-105"
            : "fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full bg-white shadow-xl hover:scale-105 transition-transform ring-2 ring-gold/40 overflow-hidden"
        }
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <VelaAvatar size={56} ring={false} className="!ring-0" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[90] w-[360px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-2xl border border-border-light flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-burgundy to-charcoal text-pearl px-5 py-4 flex items-start gap-3">
            <VelaAvatar size={44} ring />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5 text-gold">
                <span className="text-[10px] uppercase tracking-[0.2em]">
                  Concierge · Vela
                </span>
              </div>
              <p className="text-sm leading-snug">
                Hola, soy Vela. Ask me about the veils, sizing, shipping, or
                our gifting mission.
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-cream/40"
          >
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-warm-gray mb-2">
                  Try one of these:
                </p>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left px-3 py-2 bg-white border border-border rounded-xl text-sm text-charcoal hover:border-gold transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] bg-burgundy text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start items-end gap-2">
                    <VelaAvatar size={28} />
                    <div className="max-w-[80%] bg-white border border-border-light text-charcoal rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                )
              )
            )}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-warm-gray">
                <VelaAvatar size={20} pulse ring={false} />
                Vela is typing…
              </div>
            )}

            {/* Contextual follow-ups after the assistant speaks. */}
            {!sending &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              (() => {
                const lastUser =
                  [...messages].reverse().find((m) => m.role === "user")
                    ?.content ?? "";
                const lastAssistant = messages[messages.length - 1].content;
                const chips = pickFollowups(lastUser, lastAssistant);
                return (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {chips.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="text-[11px] text-charcoal bg-white border border-border-light rounded-full px-2.5 py-1 hover:border-gold transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                );
              })()}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-border-light bg-white p-2 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about veils, shipping, or the mission…"
              aria-label="Ask Vela a question"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Send"
              className="w-10 h-10 bg-burgundy text-white rounded-xl flex items-center justify-center hover:bg-burgundy/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-warm-gray text-center pb-2">
            Concierge is an AI — for humans, email hello@lacebylaluz.com.
          </p>
        </div>
      )}
    </>
  );
}
