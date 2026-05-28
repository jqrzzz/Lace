"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles, X } from "lucide-react";
import VelaAvatar from "@/components/ui/VelaAvatar";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PERSONALITY,
  variantGradient,
  type PersonalityTag,
  type Product,
} from "@/lib/products";

interface VelaVeilPickerProps {
  products: Product[];
}

interface AnswerOption {
  value: string;
  label: string;
  tags: PersonalityTag[];
  swatch?: string;
}

interface Question {
  id: string;
  prompt: string;
  options: AnswerOption[];
}

const QUESTIONS: Question[] = [
  {
    id: "occasion",
    prompt: "What moment are you thinking about?",
    options: [
      { value: "communion", label: "First communion", tags: ["pure", "minimal", "soft"] },
      { value: "quinceanera", label: "Quinceañera", tags: ["floral", "warm", "soft"] },
      { value: "wedding", label: "Wedding", tags: ["classic", "warm", "special"] },
      { value: "sunday", label: "Sunday service", tags: ["classic", "soft"] },
      { value: "centennial", label: "Centennial · 100 yrs", tags: ["special", "limited", "warm"] },
    ],
  },
  {
    id: "style",
    prompt: "And what feels most like you?",
    options: [
      { value: "classic", label: "Classic & timeless", tags: ["classic", "soft"] },
      { value: "floral", label: "Floral & feminine", tags: ["floral", "warm"] },
      { value: "minimal", label: "Modern & minimal", tags: ["minimal", "pure"] },
      { value: "embellished", label: "Special & embellished", tags: ["special", "warm"] },
    ],
  },
  {
    id: "palette",
    prompt: "Last one — what palette draws you in?",
    options: [
      { value: "white", label: "Pure white", tags: ["pure", "minimal"], swatch: "#FFFFFF" },
      { value: "ivory", label: "Warm ivory", tags: ["classic", "warm"], swatch: "#FFFAF0" },
      { value: "blush", label: "Soft blush", tags: ["floral", "warm"], swatch: "#F5E1E6" },
      { value: "champagne", label: "Champagne gold", tags: ["special", "warm"], swatch: "#F0E6DB" },
    ],
  },
];

function personalityOf(product: Product): PersonalityTag[] {
  return product.personality && product.personality.length > 0
    ? product.personality
    : DEFAULT_PERSONALITY;
}

function scoreProduct(product: Product, picked: PersonalityTag[]): number {
  const productTags = personalityOf(product);
  return picked.reduce(
    (sum, t) => sum + (productTags.includes(t) ? 1 : 0),
    0
  );
}

function pickWinner(
  products: Product[],
  picked: PersonalityTag[]
): Product | null {
  if (products.length === 0) return null;
  let best: Product | null = null;
  let bestScore = 0;
  for (const p of products) {
    const score = scoreProduct(p, picked);
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best ?? products[0];
}

function reasonFor(product: Product, picked: PersonalityTag[]): string {
  const productTags = personalityOf(product);
  const overlap = picked.filter((t) => productTags.includes(t));
  if (overlap.includes("limited")) {
    return `If this is a once-in-a-lifetime moment, the ${product.name} was made for exactly that — only one hundred numbered pieces, each with gold thread.`;
  }
  if (overlap.includes("floral") && overlap.includes("warm")) {
    return `You'd love the ${product.name}. Floral lace, soft warm tones, made to feel like a love letter you can wear.`;
  }
  if (overlap.includes("minimal") && overlap.includes("pure")) {
    return `The ${product.name} is quiet on purpose — clean lines, pure white, nothing between you and the moment.`;
  }
  if (overlap.includes("classic") && overlap.includes("warm")) {
    return `The ${product.name} reads timeless: ivory lace with a soft scalloped edge that has lived in our family for three generations.`;
  }
  return `Based on what you told me, the ${product.name} feels like the right one — ${product.tagline.toLowerCase()}.`;
}

export default function VelaVeilPicker({ products }: VelaVeilPickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PersonalityTag[]>([]);

  function reset() {
    setStep(0);
    setAnswers([]);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function answer(opt: AnswerOption) {
    const nextAnswers = [...answers, ...opt.tags];
    setAnswers(nextAnswers);
    setStep((s) => s + 1);
  }

  const total = QUESTIONS.length;
  const done = step >= total;
  const winner = done ? pickWinner(products, answers) : null;
  const reason = winner ? reasonFor(winner, answers) : "";
  const question = !done ? QUESTIONS[step] : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-r from-cream via-pearl to-cream px-5 py-4 sm:px-7 sm:py-5 flex items-center gap-4 sm:gap-5 hover:border-gold/60 hover:shadow-[0_8px_28px_rgba(201,169,110,0.18)] transition-all duration-500"
      >
        <div className="absolute inset-0 lace-pattern opacity-15 pointer-events-none" />
        <VelaAvatar size={56} className="flex-shrink-0 relative z-10" />
        <div className="flex-1 text-left relative z-10">
          <p className="text-[10px] tracking-[0.32em] uppercase text-gold font-medium mb-1">
            From Vela
          </p>
          <p className="text-base sm:text-lg text-charcoal font-heading">
            Not sure where to start? Let me help you find yours.
          </p>
        </div>
        <span className="relative z-10 hidden sm:inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-burgundy group-hover:gap-3 transition-all duration-300">
          Ask Vela
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
        <span className="relative z-10 sm:hidden text-burgundy">
          <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    );
  }

  return (
    <div className="relative rounded-2xl border border-gold/30 bg-gradient-to-br from-cream via-pearl to-cream overflow-hidden shadow-[0_12px_40px_rgba(44,37,39,0.08)]">
      <div className="absolute inset-0 lace-pattern opacity-12 pointer-events-none" />

      <button
        type="button"
        onClick={close}
        aria-label="Close picker"
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm border border-border hover:border-charcoal/40 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>

      <div className="relative p-7 sm:p-10">
        <div className="flex items-start gap-5 sm:gap-7 mb-7">
          <VelaAvatar size={72} className="flex-shrink-0 hidden sm:block" />
          <VelaAvatar size={52} className="flex-shrink-0 sm:hidden" />
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.32em] uppercase text-gold font-medium mb-2">
              Vela&apos;s veil picker
            </p>
            {!done && question && (
              <p className="font-heading text-xl sm:text-2xl text-charcoal leading-snug">
                {question.prompt}
              </p>
            )}
            {done && winner && (
              <p className="font-heading text-xl sm:text-2xl text-charcoal leading-snug">
                I think I&apos;ve found it.
              </p>
            )}
          </div>
        </div>

        {!done && question && (
          <>
            <div className="flex flex-wrap gap-2.5 mb-7">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => answer(opt)}
                  className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-border text-sm text-charcoal hover:border-gold hover:bg-gold/5 transition-all duration-300"
                >
                  {opt.swatch && (
                    <span
                      className="w-4 h-4 rounded-full border border-charcoal/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] flex-shrink-0"
                      style={{ backgroundColor: opt.swatch }}
                      aria-hidden
                    />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i < step ? "w-8 bg-burgundy/70" : i === step ? "w-12 bg-burgundy" : "w-8 bg-border"
                  )}
                />
              ))}
              <span className="text-[11px] tracking-[0.22em] uppercase text-warm-gray ml-2">
                {Math.min(step + 1, total)} of {total}
              </span>
            </div>
          </>
        )}

        {done && winner && (
          <div className="grid sm:grid-cols-[180px_1fr] gap-6 sm:gap-7 items-center">
            <Link
              href={`/product/${winner.slug}`}
              className="group block aspect-[3/4] rounded-2xl border border-border-light/60 overflow-hidden relative shadow-[0_12px_36px_rgba(44,37,39,0.08)]"
              style={{ backgroundImage: variantGradient(winner.variants) }}
              aria-label={`See the ${winner.name}`}
            >
              <div className="absolute inset-0 product-lace opacity-35 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/35 via-transparent to-white/15 pointer-events-none" />
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-burgundy/85 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-gold" strokeWidth={1.5} />
                <span className="text-[9px] tracking-[0.22em] uppercase text-pearl font-semibold">
                  Vela picks
                </span>
              </div>
            </Link>

            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gold font-medium mb-1">
                {winner.collection} · {winner.style}
              </p>
              <h3 className="font-heading text-3xl text-charcoal mb-2">
                {winner.name}
              </h3>
              <p className="text-sm text-warm-gray italic mb-4">
                {winner.tagline}
              </p>
              <p className="text-sm text-charcoal leading-relaxed mb-6">
                {reason}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/product/${winner.slug}`}
                  className="btn-luxe inline-flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white text-sm tracking-[0.04em] rounded-full"
                >
                  See the {winner.name.replace(" Veil", "")}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-warm-gray hover:text-charcoal transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
