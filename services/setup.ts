import "server-only";
import { connection } from "next/server";
import { missingEnv } from "@/lib/server/env";
import { db, isMissingSchema } from "@/lib/server/supabase";

export type SetupStatus = { ok: true } | { ok: false; problem: "env"; missing: string[] } | { ok: false; problem: "schema" | "connection"; detail: string };

/** Detecta configuración incompleta para mostrar instrucciones en vez de un error. */
let verified = false;

export async function checkSetup(): Promise<SetupStatus> {
  // Siempre en tiempo de petición: nunca prerenderizar con el estado del build.
  await connection();
  // Tras la primera comprobación correcta, no se repite en esta instancia.
  if (verified) return { ok: true };
  const missing = missingEnv();
  if (missing.length) return { ok: false, problem: "env", missing };
  try {
    // GET (no HEAD): así un error de PostgREST trae cuerpo con código y mensaje.
    const { error, status } = await db().from("weekly_summaries").select("id").limit(1);
    if (error) {
      const detail = [`HTTP ${status}`, error.code, error.message, error.hint].filter(Boolean).join(" · ");
      console.error("[setup]", detail);
      return isMissingSchema(error.code)
        ? { ok: false, problem: "schema", detail }
        : { ok: false, problem: "connection", detail };
    }
    verified = true;
    return { ok: true };
  } catch (error) {
    return { ok: false, problem: "connection", detail: error instanceof Error ? error.message : String(error) };
  }
}
