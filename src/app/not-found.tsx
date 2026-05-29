import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VelaAvatar from "@/components/ui/VelaAvatar";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-ivory">
      <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
      <div className="relative max-w-md text-center animate-fade-up">
        <VelaAvatar size={120} whole ring={false} className="mx-auto mb-5" />
        <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3 font-medium">
          Page not found
        </p>
        <h1 className="font-heading text-3xl text-charcoal mb-3">
          This veil isn&apos;t here
        </h1>
        <p className="text-warm-gray leading-relaxed mb-7">
          I looked, but this page has wandered off. Let&apos;s get you back on a
          familiar path.
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
