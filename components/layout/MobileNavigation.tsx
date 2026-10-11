"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { QuickAddFab } from "@/features/quick-add/QuickAdd";
import { MOBILE_NAV, isActive } from "./nav";

/** Navegación inferior para móvil + botón de registro rápido flotante. */
export function MobileNavigation() {
  const pathname = usePathname();
  const active = MOBILE_NAV.find((i) => isActive(pathname, i))?.href ?? null;
  const { containerRef, register, style } = useSlidingIndicator<HTMLAnchorElement>(active, "x");

  return (
    <>
      <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] right-4 z-40 md:hidden">
        <QuickAddFab />
      </div>
      <nav
        aria-label="Navegación principal"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/85 backdrop-blur-xl md:hidden"
      >
        <div ref={containerRef} className="relative mx-auto flex h-[60px] max-w-md items-stretch px-2">
          <span aria-hidden className="absolute top-1.5 h-[3px] rounded-full bg-ink" style={{ ...style, transform: `${style.transform ?? ""} scaleX(0.28)` }} />
          {MOBILE_NAV.map((item) => {
            const on = item.href === active;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={register(item.href)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] transition-colors duration-200",
                  on ? "font-medium text-ink" : "text-ink-3",
                )}
              >
                <Icon className="size-[21px]" strokeWidth={on ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
