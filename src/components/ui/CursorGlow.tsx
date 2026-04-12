"use client";

import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    // Skip on touch devices — no cursor to track
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        ".luxury-card, .glow-target"
      ) as HTMLElement | null;
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
        target.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
      }
    };

    document.addEventListener("mousemove", handler, { passive: true });
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return null;
}
