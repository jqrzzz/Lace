"use client";

// Client-side admin chrome: sidebar, mobile header, nav, sign-out
// button. Mounted by the server `/admin/layout.tsx` only after that
// layout has validated the actor against lace.app_users.

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
  Menu,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import CommandPalette from "@/components/ui/CommandPalette";
import { useAuth } from "@/lib/auth";
import {
  AdminProvider,
  useAdminActor,
  type AdminCounts,
} from "./AdminContext";
import type { AdminActor } from "@/lib/admin-auth";

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
  { href: "/admin/audit", label: "Activity", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({
  initialActor,
  isPrelaunch,
  children,
}: {
  initialActor: AdminActor;
  isPrelaunch: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminProvider initialActor={initialActor}>
      <Chrome isPrelaunch={isPrelaunch}>{children}</Chrome>
    </AdminProvider>
  );
}

const PRELAUNCH_DISMISS_KEY = "lace.prelaunch_banner_dismissed.v1";

function Chrome({
  isPrelaunch,
  children,
}: {
  isPrelaunch: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { actor, counts } = useAdminActor();
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);

  // Read the dismissal preference after mount so SSR markup matches.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setBannerDismissed(
      window.localStorage.getItem(PRELAUNCH_DISMISS_KEY) === "1",
    );
  }, []);

  // Close the mobile drawer whenever the route changes so navigation
  // feels natural.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function dismissBanner() {
    setBannerDismissed(true);
    try {
      window.localStorage.setItem(PRELAUNCH_DISMISS_KEY, "1");
    } catch {
      /* ignore — banner will show again next session, no harm */
    }
  }

  // The server layout guarantees actor is present by the time this
  // mounts. If it ever isn't (e.g. an in-flight sign-out), keep the
  // chrome blank rather than crashing.
  if (!actor) return null;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.replace("/");
    }
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
              <span className="text-xs font-medium text-gold">Ask Vela</span>
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

      {/* Mobile drawer + backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-opacity",
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!drawerOpen}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
          className="absolute inset-0 bg-charcoal/60"
        />
        <aside
          className={cn(
            "absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-charcoal text-pearl flex flex-col shadow-2xl transition-transform",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="font-heading text-lg tracking-[0.15em] uppercase text-white">
              Lace
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="p-1.5 text-soft-gray hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
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
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {NAV.map((item) => {
              const badge = item.badgeKey ? counts[item.badgeKey] : 0;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors",
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
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden bg-charcoal text-white px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-1.5 -ml-1.5 text-soft-gray hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 text-center flex-1">
            <span className="font-heading text-lg tracking-wide block leading-none">
              {pageLabel(pathname)}
            </span>
            <span className="text-[10px] text-rose-gold uppercase tracking-[0.2em] truncate block">
              {displayName}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
            className="p-1.5 -mr-1.5 text-soft-gray hover:text-white disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Pre-launch banner — only when env is missing AND not yet
            dismissed this browser. Auto-hides as soon as Stripe +
            Supabase are wired in production. */}
        {isPrelaunch && !bannerDismissed && (
          <div className="bg-gold/10 border-b border-gold/20 px-4 py-2.5 flex items-center justify-center gap-4">
            <p className="text-xs text-gold-dark text-center">
              <span className="font-medium">Pre-launch mode</span> — Connect
              Stripe and Supabase in your Vercel environment to go live.
            </p>
            <button
              onClick={dismissBanner}
              aria-label="Dismiss banner"
              className="text-gold-dark/70 hover:text-gold-dark"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}

function pageLabel(pathname: string | null): string {
  if (!pathname) return "Admin";
  const item = NAV.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/admin" && pathname.startsWith(n.href + "/")),
  );
  return item?.label ?? "Admin";
}
