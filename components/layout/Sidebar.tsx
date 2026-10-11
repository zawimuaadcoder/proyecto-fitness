"use client";

import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlideMenu } from "@/components/ui/GlideMenu";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";
import { useQuickAdd } from "@/features/quick-add/QuickAdd";
import { FOOTER_NAV, PRIMARY_NAV, SECONDARY_NAV, isActive, type NavItem } from "./nav";
import { ProfileSwitcher } from "./ProfileSwitcher";

/**
 * Sidebar colapsable 224 ↔ 52 px (patrón SidebarNav de Beautiful UI).
 * Las filas tienen ancho fijo dentro de un contenedor que se recorta, así que
 * cada icono queda centrado en x = 26 px en ambos estados; solo el texto se
 * desvanece y se desplaza 8 px. El activo se marca con un highlight que se
 * desliza; el hover usa otra capa deslizante (GlideMenu).
 */
export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const all = [...PRIMARY_NAV, ...SECONDARY_NAV, ...FOOTER_NAV];
  const active = all.find((i) => isActive(pathname, i))?.href ?? null;
  const { containerRef, register, style } = useSlidingIndicator<HTMLAnchorElement>(active, "y");
  const { open } = useQuickAdd();

  const copy = cn(
    "min-w-0 flex-1 truncate transition-[opacity,transform] duration-[180ms] ease-[var(--ease-expo)]",
    collapsed && "pointer-events-none -translate-x-2 opacity-0",
  );

  const link = (item: NavItem) => {
    const on = item.href === active;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        ref={register(item.href)}
        data-glide-row
        aria-current={on ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          "relative z-10 flex h-8 items-center gap-2 rounded-[8px] px-2 text-[14px] font-medium transition-[width,color,transform] duration-150 active:scale-[0.98]",
          collapsed ? "w-9" : "w-full",
          on ? "text-ink" : "text-ink-2 hover:text-ink",
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center">
          <Icon className="size-[18px]" strokeWidth={on ? 2.1 : 1.8} />
        </span>
        <span className={copy}>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      aria-label="Navegación principal"
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden bg-page py-3 shadow-[1px_0_0_var(--line)] transition-[width] duration-[280ms] ease-[var(--ease-expo)] md:flex",
        collapsed ? "w-[52px]" : "w-[224px]",
      )}
    >
      <div className="px-2">
        <ProfileSwitcher collapsed={collapsed} />
      </div>

      <div className="mt-2 px-2">
        <button
          type="button"
          onClick={() => open()}
          title={collapsed ? "Registrar" : undefined}
          className={cn(
            "flex h-8 items-center gap-2 overflow-hidden rounded-full bg-surface px-2 text-[14px] font-medium text-ink shadow-btn transition-[width,background-color,transform] duration-150 hover:bg-inset active:scale-[0.98]",
            collapsed ? "w-9" : "w-full",
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center">
            <Plus className="size-4" strokeWidth={2.2} />
          </span>
          <span className={cn(copy, "text-left")}>Registrar</span>
          <kbd className={cn("mr-0.5 rounded-[5px] px-1 font-mono text-[10.5px] text-ink-3 shadow-hairline", collapsed && "opacity-0")}>N</kbd>
        </button>
      </div>

      <nav ref={containerRef} className="relative mt-4 flex flex-1 flex-col px-2">
        <span
          aria-hidden
          className={cn("absolute left-2 top-0 rounded-[8px] bg-hover-2", collapsed ? "w-9" : "right-2")}
          style={style}
        />
        <GlideMenu highlightClassName={cn("left-0 rounded-[8px] bg-hover", collapsed ? "w-9" : "right-0")} className="flex flex-col gap-px">
          {PRIMARY_NAV.map(link)}
        </GlideMenu>
        <p
          className={cn(
            "mb-1 mt-5 h-4 whitespace-nowrap px-2 text-[12px] font-medium text-ink-3 transition-opacity duration-[180ms]",
            collapsed && "opacity-0",
          )}
        >
          Constancia
        </p>
        <GlideMenu highlightClassName={cn("left-0 rounded-[8px] bg-hover", collapsed ? "w-9" : "right-0")} className="flex flex-col gap-px">
          {SECONDARY_NAV.map(link)}
        </GlideMenu>
        <GlideMenu highlightClassName={cn("left-0 rounded-[8px] bg-hover", collapsed ? "w-9" : "right-0")} className="mt-auto flex flex-col gap-px">
          {FOOTER_NAV.map(link)}
        </GlideMenu>
      </nav>

      <div className="px-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          aria-expanded={!collapsed}
          className={cn(
            "mt-1 flex h-8 items-center gap-2 rounded-[8px] px-2 text-left text-[13px] text-ink-3 transition-[width,background-color,color] duration-150 hover:bg-hover hover:text-ink-2",
            collapsed ? "w-9" : "w-full",
          )}
        >
          <span className="flex size-5 shrink-0 items-center justify-center">
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </span>
          <span className={copy}>Contraer</span>
        </button>
      </div>
    </aside>
  );
}
