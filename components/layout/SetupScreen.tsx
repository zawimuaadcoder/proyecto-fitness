import { Database, KeyRound, PlugZap } from "lucide-react";
import type { SetupStatus } from "@/services/setup";

/** Pantalla de configuración pendiente (variables o migración). */
export function SetupScreen({ status }: { status: Exclude<SetupStatus, { ok: true }> }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-5 py-10">
      <div className="animate-fade-up rounded-[14px] bg-surface p-6 shadow-card">
        <span className="mb-4 flex size-10 items-center justify-center rounded-[10px] bg-orange-tint text-orange">
          {status.problem === "env" ? <KeyRound className="size-5" /> : status.problem === "schema" ? <Database className="size-5" /> : <PlugZap className="size-5" />}
        </span>
        {status.problem === "env" && (
          <>
            <h1 className="text-lg font-semibold">Falta configurar Supabase</h1>
            <p className="mt-2 text-sm text-ink-2">Añade estas variables de entorno en Vercel (Settings → Environment Variables) y vuelve a desplegar:</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {status.missing.map((m) => (
                <li key={m} className="rounded-lg bg-field px-3 py-2 font-mono text-xs text-ink">
                  {m}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-3">
              La clave secreta solo se usa en el servidor. Si conectaste Supabase desde la integración de Vercel, ya existe como
              SUPABASE_SERVICE_ROLE_KEY.
            </p>
          </>
        )}
        {status.problem === "schema" && (
          <>
            <h1 className="text-lg font-semibold">Falta crear las tablas</h1>
            <p className="mt-2 text-sm text-ink-2">
              Abre Supabase → SQL Editor y ejecuta el archivo{" "}
              <code className="rounded bg-field px-1.5 py-0.5 font-mono text-xs">supabase/migrations/20261011000000_init.sql</code> del
              repositorio. Es idempotente y respeta la tabla <code className="font-mono text-xs">profiles</code> existente.
            </p>
            <p className="mt-3 text-xs text-ink-3">{status.detail}</p>
          </>
        )}
        {status.problem === "connection" && (
          <>
            <h1 className="text-lg font-semibold">No se pudo conectar con la base de datos</h1>
            <p className="mt-2 text-sm text-ink-2">Revisa la URL y la clave de Supabase.</p>
            <p className="mt-3 break-words text-xs text-ink-3">{status.detail}</p>
          </>
        )}
      </div>
    </main>
  );
}
