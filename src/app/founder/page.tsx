import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Heart, Quote } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "A Letter from the Founder",
  description:
    "A personal note from the founder of Lace by La Luz about faith, family, and why every veil carries a century of love.",
};

export default function FounderLetterPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blush/25 via-rose/5 to-ivory overflow-hidden py-24 sm:py-28">
        <div className="lace-pattern absolute inset-0 opacity-25 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 text-center animate-fade-up">
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-4 font-medium">
            A Letter
          </p>
          <div className="gold-line mx-auto mb-8" />
          <h1 className="font-heading text-4xl sm:text-5xl text-charcoal mb-6 leading-tight">
            From Our <span className="italic text-burgundy">Founder</span>
          </h1>
          <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
            A personal note on faith, family, and the love that lives inside
            every veil we make.
          </p>

          {/* Founders Image */}
          <div className="mt-12">
            <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-lg ring-1 ring-gold/10">
              <Image
                src="/images/founders.jpeg"
                alt="Our founder and her sister at La Luz del Mundo"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <p className="mt-4 text-sm text-warm-gray italic">
              Our founder and her sister at La Luz del Mundo
            </p>
          </div>
        </div>
      </section>

      {/* Letter */}
      <section className="relative py-20 bg-ivory overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.blush/20)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="luxury-card rounded-[2rem] p-8 sm:p-14 relative overflow-hidden">
              <div className="absolute top-6 left-6 text-gold/20">
                <Quote className="w-16 h-16" strokeWidth={0.8} />
              </div>

              <div className="relative space-y-6 text-warm-gray leading-[1.9] text-[17px]">
                <p className="text-charcoal font-heading italic text-lg">
                  Dear sister,
                </p>

                <p>
                  I grew up watching the women in my family prepare for
                  worship. My grandmother folding her veil. My mother
                  smoothing hers over her hair with a quiet tenderness I will
                  never forget. I remember being small and thinking —{" "}
                  <em>
                    this is what love looks like when it doesn&apos;t need
                    words.
                  </em>
                </p>

                <p>
                  For three generations, our family has worshipped at{" "}
                  <span className="text-charcoal italic">
                    La Luz del Mundo
                  </span>
                  . This year, as the church celebrates one hundred years, I
                  keep thinking about all the sisters — across a century and
                  across the world — whose faith was held together by
                  something as small and sacred as a piece of lace.
                </p>

                <p>
                  That is why I started Lace by La Luz. I wanted to make
                  veils that felt worthy of the moments they would witness.
                  Soft enough to honor a grandmother&apos;s memory. Beautiful
                  enough that a young sister, standing in worship for the
                  first time, feels she is wearing something made{" "}
                  <em>for her</em>. And I wanted every purchase to become a
                  gift to a sister who might otherwise have nothing to wear.
                </p>

                <p>
                  Our buy-one, give-one model isn&apos;t charity. It&apos;s
                  sisterhood — the kind I grew up watching my mother practice
                  without ever giving it a name. One veil to the sister who
                  ordered it. One veil to the sister she will never meet.
                  Both held together by the same thread.
                </p>

                <p>
                  If you have come this far, thank you. Thank you for
                  believing that small, beautiful things matter. Thank you
                  for trusting our family with yours. And thank you for
                  walking into the next hundred years with us.
                </p>

                <p className="text-charcoal font-heading italic">
                  With love and light,
                </p>

                <div className="pt-4">
                  {/* Signature-style block (swap for a real PNG later) */}
                  <p className="font-heading text-3xl italic text-burgundy leading-none">
                    La Luz
                  </p>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gold mt-2 font-medium">
                    Founder · Lace by La Luz
                  </p>
                </div>
              </div>

              {/* Paper edge flourish */}
              <div className="gold-line-wide mt-10 opacity-40" />
              <div className="mt-4 flex items-center gap-2 text-[11px] text-warm-gray/70 italic">
                <Heart className="w-3 h-3 text-rose-gold fill-rose-gold" />
                Written in the centennial year, 2026
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-12 text-center">
              <Link
                href="/centennial"
                className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy/70 group transition-colors"
              >
                Explore our centennial year
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
