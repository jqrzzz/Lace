"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

/**
 * Public-facing chat concierge — the shopper's Luz. Grounded in the
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
      const res = await fetch("/api/concierge/turn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          history: nextHistory.slice(0, -1),
          userText: trimmed,
        }),
      });
      const data = (await res.json()) as { reply?: string };
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
        aria-label={open ? "Close concierge chat" : "Open concierge chat"}
        className="fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full bg-burgundy text-white shadow-xl hover:bg-burgundy/90 flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[90] w-[360px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-2xl border border-border-light flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-burgundy to-charcoal text-pearl px-5 py-4">
            <div className="flex items-center gap-2 mb-0.5 text-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-[0.2em]">
                Concierge
              </span>
            </div>
            <p className="text-sm leading-snug">
              Hola, soy Luz. Ask me about the veils, sizing, shipping, or our
              gifting mission.
            </p>
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
              messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] bg-burgundy text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap"
                        : "max-w-[85%] bg-white border border-border-light text-charcoal rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap"
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-warm-gray">
                <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
                Luz is typing…
              </div>
            )}
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
