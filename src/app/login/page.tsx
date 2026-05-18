"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const { signInWithMagicLink, configured, user } = useAuth();
  const params = useSearchParams();
  const next = params?.get("next") || null;
  // Internal-path only: must start with "/" but not "//" (protocol-relative
  // URLs would otherwise redirect to evil.com via //evil.com).
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already signed in? Route them to where they were trying to go (or
  // /account by default) without making them tap a button.
  useEffect(() => {
    if (!user) return;
    const destination = safeNext ?? "/account";
    router.replace(destination);
  }, [user, safeNext, router]);

  if (user) {
    return (
      <section className="py-32 relative">
        <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
        <div className="relative max-w-md mx-auto px-4 text-center animate-fade-up flex items-center justify-center gap-3 text-warm-gray">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Welcoming you in…</span>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signInWithMagicLink(email, {
      redirectTo: safeNext ?? undefined,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/30 via-rose/5 to-ivory overflow-hidden py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/30)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-md mx-auto px-4 text-center animate-fade-up">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4 font-medium">
            Account
          </p>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6 leading-tight">
            Welcome, <span className="italic text-burgundy">Sister</span>
          </h1>
          <p className="text-lg text-warm-gray leading-relaxed">
            Sign in to track your orders and see where your gifted veils go.
          </p>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-20">
        <div className="max-w-md mx-auto px-4 animate-fade-up">
          <div className="luxury-card rounded-2xl p-8">
            {!configured && (
              <div className="bg-gold/10 border border-gold/20 rounded-xl px-4 py-3 mb-6">
                <p className="text-xs text-gold-dark">
                  Customer accounts will be available once Supabase is connected.
                </p>
              </div>
            )}

            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-7 h-7 text-burgundy" strokeWidth={1.5} />
                </div>
                <h2 className="font-heading text-2xl text-charcoal mb-3">
                  Check Your Email
                </h2>
                <p className="text-warm-gray leading-relaxed mb-2">
                  We sent a magic link to
                </p>
                <p className="text-charcoal font-medium mb-4">{email}</p>
                <p className="text-sm text-warm-gray">
                  Click the link in the email to sign in. It expires in 1 hour.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="mt-6 text-sm text-burgundy hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <div className="w-14 h-14 rounded-full bg-blush/30 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-burgundy" strokeWidth={1.5} />
                  </div>
                  <h2 className="font-heading text-2xl text-charcoal mb-2">
                    Sign In with Email
                  </h2>
                  <p className="text-sm text-warm-gray">
                    No password needed — we&apos;ll send you a magic link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-[13px] font-medium text-charcoal mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(201,169,110,0.1)] transition-all duration-200 bg-ivory/50"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !configured}
                    className="btn-luxe w-full py-3.5 bg-burgundy text-white text-sm tracking-[0.06em] rounded-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      "Send Magic Link"
                    )}
                  </button>
                </form>

                <p className="text-[11px] text-center text-soft-gray mt-5">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="text-warm-gray hover:text-charcoal underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-warm-gray hover:text-charcoal underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </>
            )}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-charcoal transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
