"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex items-center gap-2 h-9 pl-2 pr-4 rounded-full",
        "bg-white/[0.06] border border-white/[0.12] text-soft-gray",
        "hover:text-white hover:border-gold/40 hover:bg-white/[0.1]",
        "transition-all duration-300",
        className
      )}
    >
      <span
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300",
          isDark
            ? "bg-gold/15 text-gold"
            : "bg-white/10 text-gold-light"
        )}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5" strokeWidth={1.6} />
        ) : (
          <Sun className="w-3.5 h-3.5" strokeWidth={1.6} />
        )}
      </span>
      <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
