"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Check, Info, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "info" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed top-[88px] right-4 z-[100] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {items.map((t) => (
          <ToastRow
            key={t.id}
            item={t}
            onDismiss={() =>
              setItems((prev) => prev.filter((x) => x.id !== t.id))
            }
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastRow({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const [enter, setEnter] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setEnter(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const Icon =
    item.kind === "success" ? Check : item.kind === "error" ? AlertCircle : Info;
  const accent =
    item.kind === "success"
      ? "text-burgundy"
      : item.kind === "error"
        ? "text-red-600"
        : "text-gold";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto luxury-card rounded-full pl-4 pr-2 py-2 flex items-center gap-3 min-w-[260px] max-w-[340px] shadow-xl",
        "transition-all duration-300",
        enter ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      <span
        className={cn(
          "w-7 h-7 rounded-full bg-blush/50 flex items-center justify-center flex-shrink-0",
          accent
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={2} />
      </span>
      <p className="text-sm text-charcoal flex-1 leading-tight">
        {item.message}
      </p>
      <button
        onClick={onDismiss}
        className="w-7 h-7 rounded-full flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-pearl/70 transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
