"use client";

import { Delete } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { LoaderGrid } from "@/components/ui/LoaderGrid";

/** Teclado numérico de 4 dígitos (táctil + teclado físico). */
export function PinPad({
  onComplete,
  error,
  pending,
}: {
  onComplete: (pin: string) => Promise<boolean>;
  error: string | null;
  pending: boolean;
}) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(0);

  const push = useCallback(
    (digit: string) => {
      if (pending || pin.length >= 4) return;
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        void onComplete(next).then((ok) => {
          if (!ok) {
            setShake((s) => s + 1);
            setPin("");
          }
        });
      }
    },
    [onComplete, pending, pin],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) push(e.key);
      if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [push]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="flex flex-col items-center gap-6 pb-2">
      <div key={shake} className={cn("flex gap-3", shake && "animate-[pop-in_240ms_var(--ease-expo)]")} aria-live="polite" aria-label={`${pin.length} de 4 dígitos`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "size-3 rounded-full border transition-all duration-150",
              i < pin.length ? "scale-110 border-transparent bg-ink" : "border-line-strong bg-transparent",
              error && pin.length === 0 && "border-red/60",
            )}
          />
        ))}
      </div>
      <div className="h-5 text-[13px]">
        {pending ? (
          <LoaderGrid size={14} className="text-ink-3" />
        ) : (
          error && (
            <p role="alert" className="text-red">
              {error}
            </p>
          )
        )}
      </div>
      <div className="grid w-full max-w-[260px] grid-cols-3 gap-2.5">
        {keys.map((k, i) =>
          k === "" ? (
            <span key={i} />
          ) : (
            <button
              key={k}
              type="button"
              aria-label={k === "del" ? "Borrar" : k}
              onClick={() => (k === "del" ? setPin((p) => p.slice(0, -1)) : push(k))}
              className="tabular flex h-14 items-center justify-center rounded-2xl bg-field text-xl font-medium text-ink transition-[background-color,transform] duration-100 hover:bg-hover active:scale-95"
            >
              {k === "del" ? <Delete className="size-5 text-ink-3" /> : k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
