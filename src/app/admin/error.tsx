"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <h1 className="font-heading text-2xl text-charcoal mb-2">
          That didn&apos;t load
        </h1>
        <p className="text-sm text-warm-gray leading-relaxed mb-5">
          The console hit a snag fetching this page. The data is safe — just
          give it another try.
        </p>
        {error.digest && (
          <p className="text-xs text-soft-gray mb-5 font-mono">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy text-white text-sm rounded-xl hover:bg-burgundy/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-warm-gray hover:text-charcoal transition-colors"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}
