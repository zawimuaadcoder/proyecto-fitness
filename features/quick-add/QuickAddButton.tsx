"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QuickAddKind } from "@/types/domain";
import { useQuickAdd } from "./QuickAdd";

/** Botón de cabecera que abre el registro rápido de un tipo concreto. */
export function QuickAddButton({ kind, label }: { kind: QuickAddKind; label: string }) {
  const { open } = useQuickAdd();
  return (
    <Button variant="primary" size="sm" icon={<Plus />} onClick={() => open(kind)}>
      {label}
    </Button>
  );
}
