"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-pearl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex flex-col mb-4">
              <span className="font-heading text-2xl tracking-[0.15em] uppercase text-white">
                Lace
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-rose-gold -mt-1">
                by La Luz
              </span>
            </div>
            <p className="text-sm text-soft-gray leading-relaxed">
              Elegant veils crafted with reverence, shared with purpose. Every
              purchase gifts beauty to a sister in need.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-medium">
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  All Veils
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?collection=Signature"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  Signature Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?collection=Essentials"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  Essentials
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?collection=Limited"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  Limited Edition
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-medium">
              About
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/story"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href="/mission"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  Buy One, Give One
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-soft-gray hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-4 font-medium">
              Stay Connected
            </h4>
            <p className="text-sm text-soft-gray mb-4">
              Be the first to know about new veils and mission updates.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-sm text-white placeholder:text-soft-gray focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gold text-charcoal text-sm font-medium rounded-full hover:bg-gold-light transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-soft-gray">
            &copy; {new Date().getFullYear()} Lace by La Luz. All rights
            reserved.
          </p>
          <p className="text-xs text-soft-gray flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-gold fill-rose-gold" /> for
            sisters everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
