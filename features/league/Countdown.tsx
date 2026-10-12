"use client";

import { useEffect, useState } from "react";

function format(ms: number): string {
  if (ms <= 0) return "Cerrando…";
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days} d ${hours} h`;
  return `${hours} h ${minutes % 60} min`;
}

/**
 * Cuenta atrás al cierre del mes. El servidor calcula el tiempo restante en la
 * zona horaria del perfil; aquí solo se descuenta lo transcurrido desde que se
 * montó (el primer render coincide con el del servidor).
 */
export function Countdown({ remainingMs }: { remainingMs: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - start), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular" suppressHydrationWarning>
      {format(remainingMs - elapsed)}
    </span>
  );
}
