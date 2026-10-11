import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"section"> & {
  as?: "section" | "div" | "article";
  padded?: boolean;
  interactive?: boolean;
};

export function Card({ as: Tag = "section", padded = true, interactive, className, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        "relative rounded-[10px] bg-surface shadow-card",
        padded && "p-4",
        interactive && "transition-shadow duration-200 hover:shadow-raised",
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  icon?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Cabecera compacta: icono pequeño + título en mayúsculas suaves + acción. */
export function CardHeader({ title, icon, subtitle, action, className }: CardHeaderProps) {
  return (
    <header className={cn("mb-3 flex min-h-6 items-center gap-2", className)}>
      {icon && <span className="flex size-4 shrink-0 items-center justify-center text-ink-3 [&_svg]:size-4">{icon}</span>}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[13px] font-medium text-ink-2">{title}</h2>
        {subtitle && <p className="truncate text-xs text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/** Número grande tabular con unidad opcional. */
export function BigNumber({ value, unit, className }: { value: ReactNode; unit?: ReactNode; className?: string }) {
  return (
    <p className={cn("tabular flex items-baseline gap-1 font-semibold tracking-tight text-ink", className ?? "text-[28px] leading-none")}>
      {value}
      {unit && <span className="text-sm font-medium text-ink-3">{unit}</span>}
    </p>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between px-1 first:mt-0">
      <h2 className="text-[12px] font-medium text-ink-3">{children}</h2>
      {action}
    </div>
  );
}
