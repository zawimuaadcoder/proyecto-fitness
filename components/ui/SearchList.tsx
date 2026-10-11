"use client";

import { Search, X } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator";

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Resalta la coincidencia (insensible a acentos y mayúsculas). */
export function Highlight({ text, query }: { text: string; query: string }) {
  const q = normalize(query);
  if (!q) return <>{text}</>;
  const index = normalize(text).indexOf(q);
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[3px] bg-accent-tint px-px text-ink">{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  );
}

/**
 * Búsqueda rápida reutilizable: filtrado en vivo, limpiar, highlight
 * deslizante, empty state, teclado (↑ ↓ Enter Esc) y táctil.
 */
export function SearchList<T>({
  items,
  getKey,
  getText,
  renderItem,
  onSelect,
  placeholder = "Buscar…",
  label,
  emptyText = "Sin resultados",
  className,
  listClassName,
  autoFocus,
  footer,
}: {
  items: T[];
  getKey: (item: T) => string;
  getText: (item: T) => string;
  renderItem: (item: T, state: { active: boolean; query: string }) => ReactNode;
  onSelect: (item: T) => void;
  placeholder?: string;
  label: string;
  emptyText?: string;
  className?: string;
  listClassName?: string;
  autoFocus?: boolean;
  footer?: (query: string) => ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = normalize(query);
    return q ? items.filter((i) => normalize(getText(i)).includes(q)) : items;
  }, [items, query, getText]);

  const safeIndex = Math.min(activeIndex, Math.max(0, filtered.length - 1));
  const activeKey = filtered[safeIndex] ? getKey(filtered[safeIndex]) : null;
  const { containerRef, register, style } = useSlidingIndicator<HTMLLIElement>(activeKey, "y");

  function move(delta: number) {
    if (!filtered.length) return;
    const next = (safeIndex + delta + filtered.length) % filtered.length;
    setActiveIndex(next);
    document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter" && filtered[safeIndex]) {
      e.preventDefault();
      onSelect(filtered[safeIndex]);
    } else if (e.key === "Escape" && query) {
      e.stopPropagation();
      setQuery("");
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label={label}
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={filtered.length ? `${listId}-${safeIndex}` : undefined}
          autoFocus={autoFocus}
          data-autofocus={autoFocus || undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-11 w-full rounded-full bg-field shadow-hairline pl-9 pr-9 text-ink outline-none placeholder:text-ink-3 focus:shadow-[0_0_0_1px_var(--accent),0_0_0_4px_var(--accent-tint)] md:h-10 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="animate-pop-in absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-3 hover:bg-hover hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="animate-fade-in rounded-[10px] border border-dashed border-line-strong px-3 py-6 text-center text-[13px] text-ink-3">
          {emptyText}
        </p>
      ) : (
        <div ref={containerRef} className={cn("relative", listClassName)}>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 rounded-[10px] bg-hover" style={style} />
          <ul id={listId} role="listbox" aria-label={label} className="relative flex flex-col">
            {filtered.map((item, index) => (
              <li
                key={getKey(item)}
                id={`${listId}-${index}`}
                ref={register(getKey(item))}
                role="option"
                aria-selected={index === safeIndex}
                onPointerMove={(e) => e.pointerType === "mouse" && setActiveIndex(index)}
                onClick={() => onSelect(item)}
                className="cursor-pointer rounded-[10px]"
              >
                {renderItem(item, { active: index === safeIndex, query })}
              </li>
            ))}
          </ul>
        </div>
      )}
      {footer?.(query)}
    </div>
  );
}
