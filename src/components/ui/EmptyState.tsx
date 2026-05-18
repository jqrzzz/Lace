// Shared empty-state card used across admin lists.
//
// Two tones:
//   muted — "no items yet" (orders, customers, audit, inbox); the
//           icon sits in a soft-gray treatment, copy is calm.
//   warm  — "you're caught up" (approvals empty, mission all
//           matched up); gold accent, congratulatory vibe.
//
// Pure presentation. Server-component safe.

import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  /** Optional CTA — a Link, button, or anything renderable. */
  action?: ReactNode;
  tone?: "muted" | "warm";
  /** Override padding when nesting inside a tighter container. */
  size?: "default" | "compact";
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "muted",
  size = "default",
  className,
}: EmptyStateProps) {
  const iconWrap =
    tone === "warm"
      ? "bg-gold/15 text-gold-dark"
      : "bg-cream text-soft-gray border border-border-light";
  const containerPad = size === "compact" ? "p-10" : "p-16";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-border-light text-center",
        containerPad,
        className,
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
          iconWrap,
        )}
      >
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <h3 className="font-heading text-xl text-charcoal mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-warm-gray max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
