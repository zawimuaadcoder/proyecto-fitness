"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";

export interface FilterOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

/** Chip individual (también usable suelto). */
export function FilterChip({
  active,
  onClick,
  children,
  count,
  buttonRef,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "relative z-10 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] whitespace-nowrap transition-colors duration-150",
        active ? "font-medium text-ink" : "text-ink-3 hover:text-ink-2",
      )}
    >
      {children}
      {count != null && <span className={cn("tabular text-xs", active ? "text-ink-2" : "text-ink-3")}>{count}</span>}
    </button>
  );
}

/** Fila horizontal de chips con superficie activa deslizante y scroll en móvil. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: FilterOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  const { containerRef, register, style } = useSlidingIndicator<HTMLButtonElement>(value, "x");
  return (
    <div className={cn("-mx-4 overflow-x-auto px-4 no-scrollbar md:mx-0 md:px-0", className)}>
      <div ref={containerRef} role="group" aria-label={label} className="relative inline-flex gap-0.5">
        <span aria-hidden className="absolute left-0 top-0 h-8 rounded-full bg-surface shadow-card" style={style} />
        {options.map((o) => (
          <FilterChip key={o.value} active={o.value === value} onClick={() => onChange(o.value)} count={o.count} buttonRef={register(o.value)}>
            {o.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
