"use client";

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Highlight deslizante: mide el elemento activo dentro de un contenedor y
 * devuelve el estilo para un indicador absoluto que se desplaza (transform).
 */
export function useSlidingIndicator<T extends HTMLElement = HTMLElement>(
  activeKey: string | number | null,
  axis: "x" | "y" | "both" = "x",
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef(new Map<string | number, T>());
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });
  const ready = useRef(false);

  const register = useCallback(
    (key: string | number) => (el: T | null) => {
      if (el) itemsRef.current.set(key, el);
      else itemsRef.current.delete(key);
    },
    [],
  );

  const measure = useCallback(() => {
    const el = activeKey != null ? itemsRef.current.get(activeKey) : null;
    if (!el || !containerRef.current) {
      setStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }
    // Medido con rects (no offsetTop) para que funcione aunque haya
    // contenedores posicionados intermedios.
    const container = containerRef.current;
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left - c.left + container.scrollLeft - container.clientLeft;
    const y = r.top - c.top + container.scrollTop - container.clientTop;
    setStyle({
      opacity: 1,
      width: axis === "y" ? undefined : el.offsetWidth,
      height: axis === "x" ? undefined : el.offsetHeight,
      transform: `translate(${axis === "y" ? 0 : x}px, ${axis === "x" ? 0 : y}px)`,
      transition: ready.current
        ? "transform 240ms var(--ease-out), width 240ms var(--ease-out), height 240ms var(--ease-out), opacity 150ms"
        : "none",
    });
    ready.current = true;
  }, [activeKey, axis]);

  useLayoutEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measure]);

  return { containerRef, register, style, measure };
}
