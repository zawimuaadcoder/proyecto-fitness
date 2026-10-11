"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "./Button";

/**
 * Confirmación en dos pasos sin modal: el primer toque pide confirmar,
 * el segundo ejecuta. Se cancela sola a los 4 s.
 */
export function ConfirmButton({
  onConfirm,
  label = "Eliminar",
  confirmLabel = "¿Seguro? Eliminar",
  loading,
  size = "md",
  icon = <Trash2 />,
  className,
}: {
  onConfirm: () => void | Promise<void>;
  label?: ReactNode;
  confirmLabel?: ReactNode;
  loading?: boolean;
  size?: "sm" | "md";
  icon?: ReactNode;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <Button
      variant={armed ? "danger" : "ghost"}
      size={size}
      loading={loading}
      icon={icon}
      className={className}
      aria-live="polite"
      onClick={() => (armed ? void onConfirm() : setArmed(true))}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}
