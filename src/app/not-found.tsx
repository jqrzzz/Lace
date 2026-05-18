import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-ivory">
      <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
      <div className="relative max-w-md text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-5">
          <Heart
            className="w-7 h-7 text-burgundy fill-burgundy/30"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
          Page not found
        </p>
        <h1 className="font-heading text-3xl text-charcoal mb-3">
          This veil isn&apos;t here
        </h1>
        <p className="text-warm-gray leading-relaxed mb-7">
          The page you were looking for has moved or never existed. Let&apos;s
          get you back on a familiar path.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="btn-luxe inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
          >
            Browse veils
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm text-warm-gray hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
