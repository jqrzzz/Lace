"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "@/components/ui/CommandPalette";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/admin/chat", label: "Agent Chat", icon: MessageSquare },
  { href: "/admin/playbooks", label: "Playbooks", icon: Zap },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/mission", label: "Mission", icon: Heart },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-soft-gray hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
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
              Your AI assistant — ask anything about the store, customers, or write something for you.
            </p>
          </Link>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-4 text-sm text-soft-gray hover:text-white border-t border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden bg-charcoal text-white px-4 py-3 flex items-center justify-between">
          <span className="font-heading text-lg tracking-wide">Admin</span>
          <Link href="/" className="text-sm text-soft-gray">
            Back to Store
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden bg-white border-b border-border flex overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors",
                pathname === item.href
                  ? "border-burgundy text-burgundy"
                  : "border-transparent text-warm-gray"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Pre-launch banner */}
        <div className="bg-gold/10 border-b border-gold/20 px-4 py-2.5 text-center">
          <p className="text-xs text-gold-dark">
            <span className="font-medium">Pre-launch mode</span> — Connect Stripe and Supabase in your Vercel environment to go live.
          </p>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}
