"use client";

import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import { FOOTER_NAV, PRIMARY_NAV, SECONDARY_NAV, isActive, type NavItem } from "./nav";
import { ProfileSwitcher } from "./ProfileSwitcher";

/**
 * Sidebar premium colapsable (224 px ↔ 52 px). Los iconos viven en una
 * columna fija de 36 px dentro de un padding de 8 px, así que no se mueven
 * durante la transición; solo cambia la opacidad de las etiquetas.
 */
export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const all = [...PRIMARY_NAV, ...SECONDARY_NAV, ...FOOTER_NAV];
  const active = all.find((i) => isActive(pathname, i))?.href ?? null;
  const { containerRef, register, style } = useSlidingIndicator<HTMLAnchorElement>(active, "y");
  const { open } = useQuickAdd();

  const link = (item: NavItem) => {
    const on = item.href === active;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        ref={register(item.href)}
        aria-current={on ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          "relative z-10 flex h-9 items-center gap-3 rounded-lg px-[10px] text-[13.5px] transition-colors duration-200",
          on ? "font-medium text-ink" : "text-ink-3 hover:text-ink-2",
        )}
      >
        <Icon className="size-4 shrink-0" strokeWidth={on ? 2.2 : 1.9} />
        <span className={cn("truncate transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-100")}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      aria-label="Navegación principal"
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-canvas px-2 py-3 transition-[width] duration-[260ms] ease-[var(--ease-out)] md:flex",
        collapsed ? "w-[52px]" : "w-[224px]",
      )}
    >
      <ProfileSwitcher collapsed={collapsed} />

      <button
        type="button"
        onClick={() => open()}
        title={collapsed ? "Registrar" : undefined}
        className="mt-3 flex h-9 items-center gap-3 overflow-hidden rounded-lg border border-line bg-surface px-[9px] text-[13.5px] font-medium text-ink shadow-soft transition-colors hover:border-line-strong"
      >
        <Plus className="size-4 shrink-0" strokeWidth={2.2} />
        <span className={cn("flex-1 truncate text-left transition-opacity duration-200", collapsed && "opacity-0")}>Registrar</span>
        <kbd className={cn("rounded border border-line px-1 text-[10px] text-ink-3 transition-opacity", collapsed && "opacity-0")}>N</kbd>
      </button>

      <nav ref={containerRef} className="relative mt-4 flex flex-1 flex-col overflow-hidden">
        <span aria-hidden className="absolute inset-x-0 top-0 rounded-lg border border-line bg-surface shadow-soft" style={style} />
        <div className="flex flex-col gap-0.5">{PRIMARY_NAV.map(link)}</div>
        <p
          className={cn(
            "mb-1 mt-5 h-4 whitespace-nowrap px-[10px] text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 transition-opacity duration-200",
            collapsed && "opacity-0",
          )}
        >
          Constancia
        </p>
        <div className="flex flex-col gap-0.5">{SECONDARY_NAV.map(link)}</div>
        <div className="mt-auto flex flex-col gap-0.5">{FOOTER_NAV.map(link)}</div>
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        aria-expanded={!collapsed}
        className="mt-1 flex h-9 items-center gap-3 rounded-lg px-[10px] text-[13px] text-ink-3 hover:bg-hover hover:text-ink-2"
      >
        {collapsed ? <PanelLeftOpen className="size-4 shrink-0" /> : <PanelLeftClose className="size-4 shrink-0" />}
        <span className={cn("truncate transition-opacity duration-200", collapsed && "opacity-0")}>Contraer</span>
      </button>
    </aside>
  );
}
