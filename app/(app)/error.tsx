"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-sm flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-red-tint text-red">
        <AlertTriangle className="size-5" />
      </span>
      <h1 className="text-base font-semibold">{offline ? "Sin conexión" : "Algo no ha ido bien"}</h1>
      <p className="text-sm text-ink-3">
        {offline ? "Comprueba tu conexión. Lo que registres se guardará y se sincronizará después." : "No hemos podido cargar tus datos. Prueba de nuevo."}
      </p>
      <Button variant="secondary" icon={<RotateCcw />} onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
