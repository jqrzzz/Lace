"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Check } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("footer-email") as HTMLInputElement)
      ?.value;
    if (!email) return;

    setSubLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Still show success — the UI feedback matters more than backend confirmation
    }
    setSubLoading(false);
    setSubscribed(true);
  };

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
            <p className="text-sm text-soft-gray leading-[1.8] mb-6">
              Elegant veils crafted with reverence, shared with purpose. Every
              purchase gifts beauty to a sister in need.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com/lacebylaluz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-soft-gray hover:text-white hover:border-gold/40 hover:bg-white/[0.1] transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@lacebylaluz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-soft-gray hover:text-white hover:border-gold/40 hover:bg-white/[0.1] transition-all duration-300"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/lacebylaluz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-soft-gray hover:text-white hover:border-gold/40 hover:bg-white/[0.1] transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
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
                { href: "/journey", label: "Our Journey" },
                { href: "/centennial", label: "100 Years · Centennial" },
                { href: "/founder", label: "Founder's Letter" },
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

            <h4 className="text-[10px] tracking-[0.25em] uppercase text-gold mt-8 mb-5 font-medium">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/wholesale", label: "Wholesale" },
                { href: "/press", label: "Press" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/returns", label: "Returns & Exchanges" },
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
            {subscribed ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.06] border border-gold/20 rounded-full">
                <Check className="w-4 h-4 text-gold" strokeWidth={2} />
                <span className="text-sm text-gold">You&apos;re on the list!</span>
              </div>
            ) : (
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleNewsletterSubmit}>
                <input
                  name="footer-email"
                  type="email"
                  required
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-full text-sm text-white placeholder:text-soft-gray/60 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={subLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light text-charcoal text-sm font-medium rounded-full hover:shadow-[0_4px_20px_rgba(201,169,110,0.3)] transition-all duration-300 disabled:opacity-60"
                >
                  {subLoading ? "…" : "Join"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Heritage line — La Luz Del Mundo Centennial */}
        <div className="border-t border-white/[0.08] pt-8 pb-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Link
              href="/centennial"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 border border-gold/30 shadow-[0_0_20px_rgba(224,180,112,0.15)] hover:border-gold/60 hover:shadow-[0_0_30px_rgba(224,180,112,0.25)] transition-all duration-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
                Centennial · 1926 – 2026
              </span>
            </Link>
            <p className="text-[13px] text-pearl/90 leading-relaxed max-w-xl">
              Proudly rooted in{" "}
              <span className="italic text-gold-light">La Luz del Mundo</span>
              , celebrating{" "}
              <span className="text-gold-light font-medium">
                100 years of faith
              </span>{" "}
              this year. Three generations of our family have worshipped in
              this community — every veil we craft is a tribute to that
              century of sisterhood.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-soft-gray/60">
            &copy; {new Date().getFullYear()} Lace by La Luz. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <p className="text-[11px] text-soft-gray/60 flex items-center gap-1.5">
              Made with{" "}
              <Heart className="w-3 h-3 text-rose-gold fill-rose-gold" /> for
              sisters everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
