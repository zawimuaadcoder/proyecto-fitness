"use client";

import { ChevronRight } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Contenido colapsable con altura suave + fade (sin medir el DOM). */
export function Collapse({ open, children, id }: { open: boolean; children: ReactNode; id?: string }) {
  return (
    <div id={id} className="collapse-grid" data-open={open} aria-hidden={!open} inert={!open}>
      <div>{children}</div>
    </div>
  );
}

export function Chevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <ChevronRight
      aria-hidden
      className={cn("size-4 shrink-0 text-ink-3 transition-transform duration-200 ease-[var(--ease-out)]", open && "rotate-90", className)}
    />
  );
}

/** Detalle con línea vertical a la izquierda. */
export function DetailRail({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ml-[9px] border-l border-line pl-4", className)}>{children}</div>;
}

/**
 * Fila/tarjeta expandible reutilizable: cabecera pulsable + contenido.
 * Se usa para hábitos, semanas, sesiones, métricas y ajustes avanzados.
 */
export function Expandable({
  header,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  headerClassName,
  disabled,
  chevron = "right",
}: {
  header: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  headerClassName?: string;
  disabled?: boolean;
  chevron?: "right" | "left" | "none";
}) {
  const [internal, setInternal] = useState(defaultOpen);
  const open = controlledOpen ?? internal;
  const id = useId();
  const toggle = () => {
    const next = !open;
    setInternal(next);
    onOpenChange?.(next);
  };
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={toggle}
        className={cn("flex w-full items-center gap-3 text-left disabled:cursor-default", headerClassName)}
      >
        {chevron === "left" && <Chevron open={open} />}
        <div className="min-w-0 flex-1">{header}</div>
        {chevron === "right" && !disabled && <Chevron open={open} />}
      </button>
      <Collapse open={open} id={id}>
        {children}
      </Collapse>
    </div>
  );
}
