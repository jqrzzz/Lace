"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ACCOUNT_NAV = [
  { href: "/account", label: "Account", icon: User },
  { href: "/account/orders", label: "Order History", icon: ClipboardList },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-2 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="py-32 relative">
        <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
        <div className="relative max-w-md mx-auto px-4 text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-5">
            <User className="w-7 h-7 text-rose-gold" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl text-charcoal mb-3">
            Sign In to Continue
          </h1>
          <p className="text-warm-gray mb-6">
            Access your orders and mission impact.
          </p>
          <Link
            href="/login"
            className="btn-luxe inline-flex items-center gap-2 px-8 py-3.5 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
          >
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Account Header */}
      <section className="relative bg-gradient-to-b from-blush/20 to-ivory border-b border-border-light/60">
        <div className="lace-pattern absolute inset-0 opacity-15 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-2 font-medium">
                My Account
              </p>
              <h1 className="font-heading text-3xl text-charcoal">
                Welcome back
              </h1>
              <p className="text-sm text-warm-gray mt-1">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-warm-gray hover:text-charcoal border border-border rounded-full hover:border-charcoal/30 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign Out
            </button>
          </div>

          {/* Nav tabs */}
          <div className="flex gap-1 mt-6">
            {ACCOUNT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-full transition-all duration-300",
                  pathname === item.href
                    ? "bg-burgundy text-white shadow-[0_4px_12px_rgba(139,58,74,0.2)]"
                    : "text-warm-gray hover:text-charcoal hover:bg-white"
                )}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </section>
    </>
  );
}
