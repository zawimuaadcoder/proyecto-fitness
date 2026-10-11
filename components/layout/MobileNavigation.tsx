"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { QuickAddFab } from "@/features/quick-add/QuickAdd";
import { MOBILE_NAV, isActive } from "./nav";

/**
 * Navegación inferior para móvil. El activo se marca con una píldora centrada
 * detrás del icono (simétrica por construcción: vive dentro de cada pestaña),
 * más texto en tinta y trazo más grueso; nunca solo con color.
 */
export function MobileNavigation() {
  const pathname = usePathname();
  const active = MOBILE_NAV.find((i) => isActive(pathname, i))?.href ?? null;

  return (
    <>
      <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-5 z-40 md:hidden">
        <QuickAddFab />
      </div>
      <nav
        aria-label="Navegación principal"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 bg-page/95 shadow-[0_-1px_0_var(--line)] backdrop-blur-2xl md:hidden"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 px-2">
          {MOBILE_NAV.map((item) => {
            const on = item.href === active;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-1 outline-none"
              >
                <span
                  className={cn(
                    "flex h-7 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-200 ease-[var(--ease-out)]",
                    on ? "scale-100 bg-hover-2" : "scale-95 bg-transparent",
                  )}
                >
                  <Icon className={cn("size-[20px] transition-colors duration-200", on ? "text-ink" : "text-ink-3")} strokeWidth={on ? 2.2 : 1.8} />
                </span>
                <span className={cn("text-[11px] leading-none transition-colors duration-200", on ? "font-medium text-ink" : "text-ink-3")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
