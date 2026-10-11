import "server-only";
import { connection } from "next/server";
import { missingEnv } from "@/lib/server/env";
import { db, isMissingSchema } from "@/lib/server/supabase";

export type SetupStatus = { ok: true } | { ok: false; problem: "env"; missing: string[] } | { ok: false; problem: "schema" | "connection"; detail: string };

/** Detecta configuración incompleta para mostrar instrucciones en vez de un error. */
export async function checkSetup(): Promise<SetupStatus> {
  // Siempre en tiempo de petición: nunca prerenderizar con el estado del build.
  await connection();
  const missing = missingEnv();
  if (missing.length) return { ok: false, problem: "env", missing };
  try {
    const { error } = await db().from("weekly_summaries").select("id", { head: true, count: "exact" }).limit(1);
    if (error) {
      return isMissingSchema(error.code)
        ? { ok: false, problem: "schema", detail: error.message }
        : { ok: false, problem: "connection", detail: error.message };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, problem: "connection", detail: error instanceof Error ? error.message : String(error) };
  }
}
