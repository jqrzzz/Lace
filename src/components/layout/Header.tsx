"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/story", label: "Our Story" },
  { href: "/mission", label: "Mission" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cart = useCart();
  const itemCount = cart.totalItems();

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Main nav bar */}
        <div className="bg-ivory/85 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_20px_rgba(44,37,39,0.04)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-[72px]">
              {/* Logo */}
              <Link href="/" className="flex flex-col group relative">
                <span className="font-heading text-[28px] tracking-[0.18em] uppercase text-charcoal group-hover:text-burgundy transition-colors duration-300">
                  Lace
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-gold -mt-1.5 font-medium">
                  by La Luz
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-gold to-gold-light group-hover:w-full transition-all duration-500" />
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-[13px] tracking-[0.04em] transition-all duration-300 rounded-full",
                      pathname === link.href
                        ? "text-burgundy font-medium bg-blush/40"
                        : "text-warm-gray hover:text-charcoal hover:bg-pearl/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={cart.toggleCart}
                  className="relative p-2.5 text-charcoal hover:text-burgundy transition-colors duration-300 rounded-full hover:bg-blush/30"
                  aria-label="Open cart"
                >
                  <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-burgundy text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(139,58,74,0.4)]">
                      {itemCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="lg:hidden p-2.5 text-charcoal rounded-full hover:bg-pearl/50 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? (
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Menu className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lace scallop accent under nav */}
        <div className="h-[6px] lace-border-bottom opacity-60" />

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-ivory/95 backdrop-blur-xl border-b border-border shadow-xl">
            <nav className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "text-2xl font-heading tracking-wide py-3 px-4 rounded-xl transition-all duration-300 animate-fade-up",
                    pathname === link.href
                      ? "text-burgundy bg-blush/30"
                      : "text-warm-gray hover:text-charcoal hover:bg-pearl/30"
                  )}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="gold-line-wide mt-6 mb-3 opacity-40" />
              <p className="text-[10px] tracking-[0.2em] uppercase text-soft-gray text-center">
                Buy one. Give one.
              </p>
            </nav>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
