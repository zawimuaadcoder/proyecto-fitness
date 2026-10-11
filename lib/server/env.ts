import "server-only";

/**
 * Variables de entorno del servidor. Se aceptan los nombres que crea la
 * integración Vercel ↔ Supabase (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SUPABASE_SECRET_KEY…) y los manuales.
 */
export function getServerEnv() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const sessionSecret = process.env.SESSION_SECRET || "";
  const passwordHash = process.env.APP_PASSWORD_HASH || "";
  return { supabaseUrl, supabaseSecret, sessionSecret, passwordHash };
}

export function missingEnv(): string[] {
  const env = getServerEnv();
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabaseSecret) missing.push("SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY)");
  return missing;
}
