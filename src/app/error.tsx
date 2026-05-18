"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-ivory">
      <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
      <div className="relative max-w-md text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-burgundy" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-3xl text-charcoal mb-3">
          Something went a little sideways
        </h1>
        <p className="text-warm-gray leading-relaxed mb-6">
          We logged the issue. Try the page again — and if it keeps misbehaving,
          take a moment, then come back to it.
        </p>
        {error.digest && (
          <p className="text-xs text-soft-gray mb-6 font-mono">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="btn-luxe inline-flex items-center gap-2 px-7 py-3 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm text-warm-gray hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to the store
          </Link>
        </div>
      </div>
    </section>
  );
}
