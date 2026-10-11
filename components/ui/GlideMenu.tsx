"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Una única capa de hover que se desliza entre las filas interactivas
 * (patrón GlideMenu de Beautiful UI). Las filas se marcan con data-glide-row.
 */
export function GlideMenu({
  children,
  className,
  highlightClassName = "inset-x-0 rounded-[8px] bg-hover-2",
}: {
  children: ReactNode;
  className?: string;
  highlightClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [visible, setVisible] = useState(false);

  const moveTo = (target: EventTarget | null) => {
    const container = ref.current;
    if (!(target instanceof Element) || !container) return;
    const row = target.closest("[data-glide-row]");
    if (!(row instanceof HTMLElement) || !container.contains(row)) return;
    const c = container.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    setBox({ top: r.top - c.top, height: r.height });
    setVisible(true);
  };

  return (
    <div
      ref={ref}
      onPointerOver={(e) => e.pointerType === "mouse" && moveTo(e.target)}
      onPointerLeave={() => setVisible(false)}
      onFocusCapture={(e) => moveTo(e.target)}
      onBlurCapture={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setVisible(false);
      }}
      className={cn("group/glide relative", className)}
    >
      <span
        aria-hidden
        className={cn("pointer-events-none absolute", highlightClassName)}
        style={{
          top: box?.top ?? 0,
          height: box?.height ?? 0,
          opacity: box && visible ? 1 : 0,
          transition: "top 220ms var(--ease-out), height 220ms var(--ease-out), opacity 150ms ease",
        }}
      />
      {children}
    </div>
  );
}
