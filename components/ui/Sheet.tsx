"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useIsClient } from "@/hooks/useIsClient";
import { IconButton } from "./Button";

/**
 * Panel modal: hoja inferior en móvil, diálogo compacto centrado en desktop.
 * Accesible: role=dialog, aria-modal, Escape para cerrar, foco inicial y
 * trampa de foco básica.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusable = () =>
      Array.from(
        el?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [],
      ).filter((n) => !n.hasAttribute("disabled"));
    const first = el?.querySelector<HTMLElement>("[data-autofocus]") ?? focusable()[1] ?? focusable()[0];
    first?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        const items = focusable();
        if (!items.length) return;
        const firstItem = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <div className="animate-fade-in absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "animate-sheet-up md:animate-pop-in relative flex max-h-[92dvh] w-full flex-col rounded-t-[20px] border border-line-strong bg-surface shadow-float md:rounded-[16px]",
          size === "sm" && "md:max-w-sm",
          size === "md" && "md:max-w-md",
          size === "lg" && "md:max-w-2xl",
        )}
      >
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-line-strong md:hidden" aria-hidden />
        <header className="flex items-start gap-3 px-5 pb-2 pt-3 md:pt-5">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[15px] font-semibold text-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
          </div>
          <IconButton label="Cerrar" size="sm" onClick={onClose} className="-mr-2 -mt-1">
            <X />
          </IconButton>
        </header>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <footer className="safe-bottom flex gap-2 border-t border-line px-5 py-3">{footer}</footer>}
        {!footer && <div className="safe-bottom" />}
      </div>
    </div>,
    document.body,
  );
}
