"use client";

import { ArrowDown, ArrowUp, Columns3, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { LOCAL_PREFS } from "@/lib/constants";
import { useLocalPref } from "@/hooks/useLocalPref";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null;
  align?: "left" | "right";
  optional?: boolean;
  /** Se muestra en la vista móvil (fila/card) */
  mobile?: "title" | "value" | "meta";
}

/**
 * Tabla avanzada: ordenar, seleccionar, eliminar en bloque y ocultar columnas
 * opcionales. En móvil se convierte en filas compactas en lugar de una tabla.
 */
export function DataTable<T>({
  id,
  rows,
  columns,
  getKey,
  onRowClick,
  onDelete,
  emptyTitle,
  emptyAction,
  initialSort,
}: {
  id: string;
  rows: T[];
  columns: Column<T>[];
  getKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  onDelete?: (ids: string[]) => Promise<void>;
  emptyTitle: string;
  emptyAction?: ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
}) {
  const [sort, setSort] = useState(initialSort ?? { key: columns[0].key, dir: "desc" as const });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useLocalPref<string[]>(`${LOCAL_PREFS.tableColumns}.${id}`, []);
  const [showCols, setShowCols] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const visible = columns.filter((c) => !hidden.includes(c.key));
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const val = col.sortValue;
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      const r = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, columns, sort]);

  const allSelected = sorted.length > 0 && sorted.every((r) => selected.has(getKey(r)));
  const toggle = (k: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  if (!rows.length) return <EmptyState title={emptyTitle} action={emptyAction} />;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-9 items-center gap-2">
        {selected.size > 0 && onDelete ? (
          <>
            <span className="tabular text-[13px] text-ink-2">{selected.size} seleccionados</span>
            <ConfirmButton
              size="sm"
              loading={deleting}
              label="Eliminar"
              confirmLabel={`Eliminar ${selected.size}`}
              icon={<Trash2 />}
              onConfirm={async () => {
                setDeleting(true);
                await onDelete([...selected]);
                setDeleting(false);
                setSelected(new Set());
              }}
            />
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Cancelar
            </Button>
          </>
        ) : (
          <span className="tabular text-xs text-ink-3">{rows.length} registros</span>
        )}
        {columns.some((c) => c.optional) && (
          <div className="relative ml-auto hidden md:block">
            <Button size="sm" variant="ghost" icon={<Columns3 />} aria-expanded={showCols} onClick={() => setShowCols((s) => !s)}>
              Columnas
            </Button>
            {showCols && (
              <div className="animate-pop-in absolute right-0 top-9 z-20 w-48 rounded-xl border border-line-strong bg-surface p-1.5 shadow-float">
                {columns
                  .filter((c) => c.optional)
                  .map((c) => (
                    <label key={c.key} className="flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-[13px] text-ink-2 hover:bg-hover">
                      <input
                        type="checkbox"
                        className="accent-[var(--accent)]"
                        checked={!hidden.includes(c.key)}
                        onChange={(e) => setHidden(e.target.checked ? hidden.filter((h) => h !== c.key) : [...hidden, c.key])}
                      />
                      {c.label}
                    </label>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden overflow-hidden rounded-xl border border-line md:block">
        <table className="w-full text-[13px]">
          <thead className="bg-inset text-xs text-ink-3">
            <tr>
              {onDelete && (
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todo"
                    className="accent-[var(--accent)]"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(sorted.map(getKey)))}
                  />
                </th>
              )}
              {visible.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn("px-3 py-2.5 font-medium", c.align === "right" ? "text-right" : "text-left")}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === "desc" ? "asc" : "desc" }))}
                      className={cn("inline-flex items-center gap-1 hover:text-ink", sort.key === c.key && "text-ink-2")}
                    >
                      {c.label}
                      {sort.key === c.key && (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const k = getKey(r);
              return (
                <tr
                  key={k}
                  onClick={() => onRowClick?.(r)}
                  className={cn("border-t border-line transition-colors", onRowClick && "cursor-pointer hover:bg-hover", selected.has(k) && "bg-accent-tint")}
                >
                  {onDelete && (
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label="Seleccionar fila" className="accent-[var(--accent)]" checked={selected.has(k)} onChange={() => toggle(k)} />
                    </td>
                  )}
                  {visible.map((c) => (
                    <td key={c.key} className={cn("tabular px-3 py-2.5 text-ink-2", c.align === "right" && "text-right")}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Móvil: filas compactas */}
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface md:hidden">
        {sorted.map((r) => {
          const k = getKey(r);
          const title = columns.find((c) => c.mobile === "title");
          const value = columns.find((c) => c.mobile === "value");
          const metas = columns.filter((c) => c.mobile === "meta");
          return (
            <li key={k} className={cn("flex items-center gap-3 px-3.5 py-3", selected.has(k) && "bg-accent-tint")}>
              {onDelete && (
                <input type="checkbox" aria-label="Seleccionar" className="size-4 accent-[var(--accent)]" checked={selected.has(k)} onChange={() => toggle(k)} />
              )}
              <button type="button" onClick={() => onRowClick?.(r)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{title?.render(r)}</span>
                  <span className="block truncate text-xs text-ink-3">
                    {metas
                      .map((m) => ({ key: m.key, node: m.render(r) }))
                      .filter((m) => m.node !== "" && m.node != null)
                      .map((m, i) => (
                        <span key={m.key}>
                          {i > 0 && " · "}
                          {m.node}
                        </span>
                      ))}
                  </span>
                </span>
                <span className="tabular shrink-0 text-sm font-medium text-ink">{value?.render(r)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
