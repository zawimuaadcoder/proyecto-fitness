"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";

/** Pestañas por URL con indicador deslizante (navegación real, compartible). */
export function LinkTabs({ tabs, active, label }: { tabs: { href: string; label: string; key: string }[]; active: string; label: string }) {
  const { containerRef, register, style } = useSlidingIndicator<HTMLAnchorElement>(active, "x");
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <nav ref={containerRef} aria-label={label} className="relative inline-flex rounded-[10px] border border-line bg-inset p-0.5">
        <span aria-hidden className="absolute left-0 top-0.5 bottom-0.5 rounded-lg border border-line-strong bg-field shadow-soft" style={style} />
        {tabs.map((t) => (
          <Link
            key={t.key}
            ref={register(t.key)}
            href={t.href}
            scroll={false}
            aria-current={t.key === active ? "page" : undefined}
            className={cn(
              "relative z-10 inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium whitespace-nowrap transition-colors duration-200",
              t.key === active ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
