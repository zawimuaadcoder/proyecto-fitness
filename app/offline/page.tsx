import { CloudOff } from "lucide-react";

export const metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-orange-tint text-orange">
        <CloudOff className="size-5" />
      </span>
      <h1 className="text-lg font-semibold">Sin conexión</h1>
      <p className="max-w-xs text-sm text-ink-3">
        Esta página aún no estaba guardada en el dispositivo. Vuelve cuando tengas red; lo que registres sin conexión se sincroniza solo.
      </p>
    </main>
  );
}
