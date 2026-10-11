"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
}

/** Control segmentado con thumb deslizante. role=radiogroup + flechas. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
  stretch,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
  stretch?: boolean;
}) {
  const { containerRef, register, style } = useSlidingIndicator<HTMLButtonElement>(value, "x");
  const id = useId();

  function onKeyDown(e: KeyboardEvent) {
    const index = options.findIndex((o) => o.value === value);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = options[(index + (e.key === "ArrowRight" ? 1 : -1) + options.length) % options.length];
      onChange(next.value);
      document.getElementById(`${id}-${next.value}`)?.focus();
    }
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex rounded-[10px] border border-line bg-inset p-0.5",
        stretch && "flex w-full",
        className,
      )}
    >
      <span aria-hidden className="absolute left-0 top-0.5 bottom-0.5 rounded-lg border border-line-strong bg-field shadow-soft" style={style} />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            id={`${id}-${o.value}`}
            ref={register(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.ariaLabel}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 [&_svg]:size-3.5",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[13px]",
              stretch && "flex-1",
              active ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
