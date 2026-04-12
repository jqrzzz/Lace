"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  end: number;
  duration?: number;
  suffix?: string;
  label: string;
  accent?: "gold" | "burgundy" | "rose";
}

/**
 * GiftedCounter — animated count-up that starts when the element is in view.
 * Respects prefers-reduced-motion by snapping straight to the end value.
 */
export default function GiftedCounter({
  end,
  duration = 1800,
  suffix = "",
  label,
  accent = "burgundy",
}: Props) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const el = ref.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduceMotion) {
        setValue(end);
        return;
      }
      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        // Ease-out cubic for a gentle settle at the end.
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(tick);
        else setValue(end);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  const accentClass =
    accent === "gold"
      ? "text-gradient-gold"
      : accent === "rose"
        ? "text-rose-gold"
        : "text-burgundy";

  return (
    <div ref={ref} className="text-center">
      <p
        className={`font-heading text-5xl sm:text-6xl ${accentClass} mb-2 tabular-nums`}
      >
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="text-[11px] tracking-[0.25em] uppercase text-warm-gray font-medium">
        {label}
      </p>
    </div>
  );
}
