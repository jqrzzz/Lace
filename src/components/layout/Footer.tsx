"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-charcoal text-pearl overflow-hidden">
      {/* Top gold accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Lace texture */}
      <div className="absolute inset-0 lace-overlay opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex flex-col mb-5">
              <span className="font-heading text-2xl tracking-[0.18em] uppercase text-white">
                Lace
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-gold -mt-1 font-medium">
                by La Luz
              </span>
            </div>
            <div className="gold-line mb-5 opacity-30" />
            <p className="text-sm text-soft-gray leading-[1.8]">
              Elegant veils crafted with reverence, shared with purpose. Every
              purchase gifts beauty to a sister in need.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-gold mb-5 font-medium">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/shop", label: "All Veils" },
                { href: "/shop?collection=Signature", label: "Signature Collection" },
                { href: "/shop?collection=Essentials", label: "Essentials" },
                { href: "/shop?collection=Limited", label: "Limited Edition" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-soft-gray hover:text-white hover:pl-1 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-gold mb-5 font-medium">
              About
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/story", label: "Our Story" },
                { href: "/mission", label: "Buy One, Give One" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-soft-gray hover:text-white hover:pl-1 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-gold mb-5 font-medium">
              Stay Connected
            </h4>
            <p className="text-sm text-soft-gray mb-5 leading-[1.8]">
              Be the first to know about new veils and mission updates.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-full text-sm text-white placeholder:text-soft-gray/60 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all duration-300"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light text-charcoal text-sm font-medium rounded-full hover:shadow-[0_4px_20px_rgba(201,169,110,0.3)] transition-all duration-300"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-soft-gray/60">
            &copy; {new Date().getFullYear()} Lace by La Luz. All rights
            reserved.
          </p>
          <p className="text-[11px] text-soft-gray/60 flex items-center gap-1.5">
            Made with{" "}
            <Heart className="w-3 h-3 text-rose-gold fill-rose-gold" /> for
            sisters everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
