import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cliente con la clave secreta (service role). Solo existe en el servidor:
 * el navegador nunca habla directamente con Supabase. Cada consulta debe
 * filtrar por el profile_id de la sesión validada.
 */
export function db(): SupabaseClient {
  if (client) return client;
  const { supabaseUrl, supabaseSecret } = getServerEnv();
  if (!supabaseUrl || !supabaseSecret) {
    throw new Error("Supabase no está configurado (faltan variables de entorno).");
  }
  client = createClient(supabaseUrl, supabaseSecret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return client;
}

export class DataError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

/** Códigos que indican que la migración no se ha ejecutado. */
export function isMissingSchema(code?: string): boolean {
  return code === "42P01" || code === "PGRST205" || code === "42703" || code === "PGRST204";
}

export function unwrap<T>(result: { data: T | null; error: { message: string; code?: string } | null }): T {
  if (result.error) throw new DataError(result.error.message, result.error.code);
  return result.data as T;
}

/** Descarga todas las filas paginando (PostgREST limita a 1000 por petición). */
export async function fetchAll<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string; code?: string } | null }>,
  pageSize = 1000,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const page = unwrap(await query(from, from + pageSize - 1)) ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}
