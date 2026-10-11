"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";
import { addCustomType } from "./actions";

/**
 * Selector de tipo en chips (los más usados a un tap) + "Nuevo" para crear
 * tipos personalizados sin salir del formulario.
 */
export function TypePicker({
  types,
  value,
  onChange,
  category,
  label,
}: {
  types: string[];
  value: string;
  onChange: (v: string) => void;
  category: "workout" | "cardio";
  label: string;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [extra, setExtra] = useState<string[]>([]);
  const toast = useToast();
  const all = [...types, ...extra.filter((e) => !types.includes(e))];

  async function create() {
    const clean = name.trim();
    if (!clean) return setAdding(false);
    setExtra((x) => [...x, clean]);
    onChange(clean);
    setAdding(false);
    setName("");
    const res = await addCustomType({ category, name: clean }).catch(() => null);
    if (!res?.ok) toast.error(res?.error ?? "No se pudo guardar el tipo");
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {all.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={value === t}
          onClick={() => onChange(t)}
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] transition-[background-color,color,transform] duration-150 active:scale-[0.96]",
            value === t ? "bg-ink font-medium text-canvas" : "bg-field shadow-hairline text-ink-2 hover:text-ink",
          )}
        >
          {value === t && <Check className="size-3.5" strokeWidth={2.5} />}
          {t}
        </button>
      ))}
      {adding ? (
        <span className="animate-pop-in inline-flex h-8 items-center gap-1 rounded-full bg-field shadow-hairline pl-3 pr-1">
          <input
            autoFocus
            aria-label="Nombre del nuevo tipo"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void create();
              }
              if (e.key === "Escape") {
                e.stopPropagation();
                setAdding(false);
              }
            }}
            className="w-28 bg-transparent text-[13px] outline-none"
            placeholder="Nuevo tipo"
          />
          <button type="button" aria-label="Añadir tipo" onClick={() => void create()} className="flex size-7 items-center justify-center rounded-md text-ink-2 hover:bg-hover">
            <Check className="size-3.5" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-line-strong px-3 text-[13px] text-ink-3 hover:text-ink"
        >
          <Plus className="size-3.5" /> Nuevo
        </button>
      )}
    </div>
  );
}
