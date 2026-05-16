"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Heart,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Inbox,
  Users,
  Zap,
  Settings,
  ScrollText,
  Loader2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "@/components/ui/CommandPalette";
import { useAuth } from "@/lib/auth";
import { AdminProvider, useAdminActor, type AdminCounts } from "./AdminContext";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badgeKey?: keyof AdminCounts;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  {
    href: "/admin/approvals",
    label: "Approvals",
    icon: ShieldCheck,
    badgeKey: "approvals_pending",
  },
  { href: "/admin/chat", label: "Agent Chat", icon: MessageSquare },
  { href: "/admin/playbooks", label: "Playbooks", icon: Zap },
  {
    href: "/admin/inbox",
    label: "Inbox",
    icon: Inbox,
    badgeKey: "inbox_new",
  },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  {
    href: "/admin/mission",
    label: "Mission",
    icon: Heart,
    badgeKey: "mission_pending",
  },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { actor, counts, loading } = useAdminActor();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.replace("/");
    }
  }

  if (loading || !actor) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex items-center gap-3 text-warm-gray">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {loading ? "Signing you in…" : "Taking you to sign-in…"}
          </span>
        </div>
      </div>
    );
  }

  const displayName = actor.name || actor.email;
  const initials = displayName
    .split(/[\s@]+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-pearl flex-shrink-0 hidden lg:flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex flex-col">
            <span className="font-heading text-xl tracking-[0.15em] uppercase text-white">
              Lace
            </span>
            <span className="text-[9px] tracking-[0.25em] uppercase text-rose-gold -mt-0.5">
              Admin Console
            </span>
          </div>
        </div>

        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <span className="w-9 h-9 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-medium flex-shrink-0">
              {initials || "•"}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{displayName}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-rose-gold">
                {actor.role}
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 pt-2 pb-1">
          <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-soft-gray">
              Quick switch
            </span>
            <kbd className="text-[10px] bg-white/10 text-pearl border border-white/15 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1">
          {NAV.map((item) => {
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-soft-gray hover:text-white hover:bg-white/5",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-medium rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                      active
                        ? "bg-gold text-charcoal"
                        : "bg-burgundy/80 text-pearl",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <Link
            href="/admin/chat"
            className="block bg-gold/10 rounded-xl px-4 py-3 border border-gold/20 hover:bg-gold/15 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-medium text-gold">Ask Luz</span>
            </div>
            <p className="text-[10px] text-soft-gray">
              Your AI assistant — ask anything about the store, customers, or
              write something for you.
            </p>
          </Link>
        </div>

        <div className="border-t border-white/10 grid grid-cols-2 divide-x divide-white/10">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3 text-xs text-soft-gray hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Store
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center justify-center gap-2 py-3 text-xs text-soft-gray hover:text-white transition-colors disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden bg-charcoal text-white px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-heading text-lg tracking-wide block">
              Admin
            </span>
            <span className="text-[10px] text-rose-gold uppercase tracking-[0.2em] truncate block">
              {displayName}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
            className="inline-flex items-center gap-1.5 text-xs text-soft-gray hover:text-white disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            Sign out
          </button>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden bg-white border-b border-border flex overflow-x-auto">
          {NAV.map((item) => {
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors",
                  active
                    ? "border-burgundy text-burgundy"
                    : "border-transparent text-warm-gray",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {badge > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-medium rounded-full px-1.5 py-0.5",
                      active
                        ? "bg-burgundy text-pearl"
                        : "bg-cream text-warm-gray border border-border",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Pre-launch banner */}
        <div className="bg-gold/10 border-b border-gold/20 px-4 py-2.5 text-center">
          <p className="text-xs text-gold-dark">
            <span className="font-medium">Pre-launch mode</span> — Connect
            Stripe and Supabase in your Vercel environment to go live.
          </p>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}
