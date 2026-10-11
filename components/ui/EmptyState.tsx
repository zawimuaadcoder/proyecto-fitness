import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong text-center",
        compact ? "gap-2 px-4 py-5" : "gap-3 px-6 py-10",
        className,
      )}
    >
      {icon && (
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-field text-ink-3 [&_svg]:size-[18px]">{icon}</span>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink-2">{title}</p>
        {description && <p className="mx-auto max-w-xs text-[13px] text-ink-3">{description}</p>}
      </div>
      {action}
    </div>
  );
}
