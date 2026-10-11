import type { ReactNode } from "react";

/** Contenedor de página con ancho máximo razonable. */
export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-5 pt-[max(20px,env(safe-area-inset-top))] md:px-8 md:pt-8 ${wide ? "max-w-[1180px]" : "max-w-[880px]"}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  eyebrow,
  description,
  action,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="animate-fade-up mb-5 flex items-end justify-between gap-4 md:mb-6">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-medium text-ink-3 first-letter:uppercase">{eyebrow}</p>}
        <h1 className="truncate text-[22px] font-semibold tracking-tight text-ink md:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-ink-3">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}
