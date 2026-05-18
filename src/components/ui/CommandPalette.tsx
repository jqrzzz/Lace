// ─────────────────────────────────────────────────────────────
// Cmd+K / Ctrl+K command palette for the admin console.
//
// Opens a modal with a filtered, keyboard-driven list of actions:
//   - Jump to any admin page
//   - Run any playbook
//   - Toggle theme
//
// Mounted once from the admin layout. Listens globally for the
// keyboard shortcut; no page-level wiring needed.
// ─────────────────────────────────────────────────────────────

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  MessageSquare,
  Zap,
  Inbox,
  ClipboardList,
  ShoppingBag,
  Heart,
  Settings,
  Search,
  Moon,
  Sun,
  Home,
  Play,
  ArrowRight,
} from "lucide-react";
import { PLAYBOOKS } from "@/lib/agent/playbooks";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/components/ui/Toast";
import { adminFetchJSON } from "@/lib/admin-fetch";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  section: "Navigate" | "Playbooks" | "Actions";
  run: () => void | Promise<void>;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Global shortcut. Opening resets query+cursor inline so the open effect
  // below only needs to handle the imperative focus call.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((wasOpen) => {
          if (!wasOpen) {
            setQuery("");
            setCursor(0);
          }
          return !wasOpen;
        });
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "nav:overview", label: "Overview", icon: LayoutDashboard, section: "Navigate", run: () => router.push("/admin") },
      { id: "nav:approvals", label: "Approvals", icon: ShieldCheck, section: "Navigate", run: () => router.push("/admin/approvals") },
      { id: "nav:chat", label: "Agent Chat", icon: MessageSquare, section: "Navigate", run: () => router.push("/admin/chat") },
      { id: "nav:playbooks", label: "Playbooks", icon: Zap, section: "Navigate", run: () => router.push("/admin/playbooks") },
      { id: "nav:inbox", label: "Inbox", icon: Inbox, section: "Navigate", run: () => router.push("/admin/inbox") },
      { id: "nav:orders", label: "Orders", icon: ClipboardList, section: "Navigate", run: () => router.push("/admin/orders") },
      { id: "nav:products", label: "Products", icon: ShoppingBag, section: "Navigate", run: () => router.push("/admin/products") },
      { id: "nav:mission", label: "Mission", icon: Heart, section: "Navigate", run: () => router.push("/admin/mission") },
      { id: "nav:audit", label: "Audit log", icon: ShieldCheck, section: "Navigate", run: () => router.push("/admin/audit") },
      { id: "nav:settings", label: "Settings", icon: Settings, section: "Navigate", run: () => router.push("/admin/settings") },
    ];

    const plays: Command[] = PLAYBOOKS.map((p) => ({
      id: `play:${p.id}`,
      label: `Run: ${p.name}`,
      hint: p.description,
      icon: Play,
      section: "Playbooks" as const,
      run: async () => {
        try {
          await adminFetchJSON<{ session_id: string }>("/api/agent/playbooks/run", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: p.id }),
          });
          toast(`Queued: ${p.name}`, "success");
        } catch {
          toast(`Could not start "${p.name}".`, "error");
        }
      },
    }));

    const actions: Command[] = [
      {
        id: "action:theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        icon: theme === "dark" ? Sun : Moon,
        section: "Actions",
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        id: "action:store",
        label: "Back to storefront",
        icon: Home,
        section: "Actions",
        run: () => router.push("/"),
      },
    ];

    return [...nav, ...plays, ...actions];
  }, [router, theme, setTheme, toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ""} ${c.section}`.toLowerCase();
      return hay.includes(q);
    });
  }, [commands, query]);

  // Clamp the cursor to the visible range at render time so a shrinking
  // filter list never points off the end. We keep `cursor` in storage as the
  // user pressed it; reads use `safeCursor`.
  const safeCursor =
    filtered.length === 0 ? 0 : Math.min(cursor, filtered.length - 1);

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach((c) => {
      const arr = map.get(c.section) ?? [];
      arr.push(c);
      map.set(c.section, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  async function runAt(index: number) {
    const cmd = filtered[index];
    if (!cmd) return;
    close();
    await cmd.run();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      void runAt(safeCursor);
    }
  }

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center pt-24 px-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-border-light overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b border-border-light">
          <Search className="w-4 h-4 text-warm-gray flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump to a page, run a playbook…"
            className="flex-1 py-3 text-sm bg-transparent focus:outline-none text-charcoal placeholder:text-warm-gray"
          />
          <kbd className="hidden sm:inline text-[10px] text-warm-gray bg-cream border border-border-light rounded-md px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-warm-gray px-4 py-6 text-center">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            grouped.map(([section, items]) => (
              <div key={section} className="px-2 pb-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-warm-gray px-2 py-1.5">
                  {section}
                </p>
                {items.map((cmd) => {
                  flatIndex += 1;
                  const active = flatIndex === safeCursor;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => void runAt(filtered.indexOf(cmd))}
                      onMouseEnter={() => setCursor(filtered.indexOf(cmd))}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                        active ? "bg-cream" : "hover:bg-cream/60"
                      }`}
                    >
                      <cmd.icon className="w-4 h-4 text-warm-gray flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal truncate">
                          {cmd.label}
                        </p>
                        {cmd.hint && (
                          <p className="text-xs text-warm-gray truncate">
                            {cmd.hint}
                          </p>
                        )}
                      </div>
                      {active && (
                        <ArrowRight className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-border-light bg-cream text-[10px] text-warm-gray flex items-center gap-4">
          <span>
            <kbd className="bg-white border border-border-light rounded px-1">↑</kbd>{" "}
            <kbd className="bg-white border border-border-light rounded px-1">↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="bg-white border border-border-light rounded px-1">↵</kbd>{" "}
            select
          </span>
          <span className="ml-auto">
            <kbd className="bg-white border border-border-light rounded px-1">⌘K</kbd>{" "}
            to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
