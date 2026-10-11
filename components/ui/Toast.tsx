"use client";

import { AlertCircle, Check, CloudOff, Info } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info" | "offline";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  show: (message: string, tone?: ToastTone, action?: ToastItem["action"]) => void;
  success: (message?: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const icons: Record<ToastTone, ReactNode> = {
  success: <Check strokeWidth={2.5} className="text-green" />,
  error: <AlertCircle className="text-red" />,
  info: <Info className="text-accent" />,
  offline: <CloudOff className="text-orange" />,
};

/** Feedback discreto tras guardar ("✓ Guardado"), sin alerts del navegador. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback<ToastApi["show"]>(
    (message, tone = "info", action) => {
      const id = ++seq.current;
      setItems((list) => [...list.slice(-2), { id, message, tone, action }]);
      setTimeout(() => dismiss(id), tone === "error" ? 5000 : 2600);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message = "Guardado") => show(message, "success"),
      error: (message) => show(message, "error"),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "animate-fade-up pointer-events-auto flex max-w-sm items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-[13px] font-medium text-ink shadow-overlay [&_svg]:size-4",
            )}
          >
            {icons[t.tone]}
            <span>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="ml-1 rounded-md px-1.5 py-0.5 text-accent hover:bg-accent-tint"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast fuera de ToastProvider");
  return ctx;
}
