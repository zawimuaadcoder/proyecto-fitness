import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { fingerprint, sign, verifySignature } from "./crypto";
import { getServerEnv } from "./env";
import { db } from "./supabase";

export const ACCESS_COOKIE = "fs_access";
export const PROFILE_COOKIE = "fs_profile";

const ACCESS_TTL_DAYS = 60;
const PROFILE_TTL_DAYS = 30;

function sessionSecret(): string {
  const { sessionSecret, supabaseSecret } = getServerEnv();
  if (process.env.NODE_ENV === "production" && (!sessionSecret || sessionSecret.length < 32)) {
    throw new Error("SESSION_SECRET es obligatorio en producción");
  }
  // Si no hay SESSION_SECRET dedicado, derivamos uno del secreto de Supabase.
  return sessionSecret || fingerprint(`session:${supabaseSecret}`) + supabaseSecret.slice(-8);
}

function encode(data: object): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload, sessionSecret())}`;
}

function decode<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !verifySignature(payload, signature, sessionSecret())) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as T & { exp: number };
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

const cookieOptions = (days: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: days * 86_400,
});

// ---------------------------------------------------------------------------
// Contraseña de grupo
// ---------------------------------------------------------------------------

/** Hash de la contraseña de grupo: variable de entorno o tabla app_config. */
// Caché por instancia: el hash cambia rarísima vez y se consulta en cada petición.
// Tras un cambio de contraseña, otras instancias lo ven en ≤ 60 s.
let hashCache: { value: string | null; at: number } | null = null;
const HASH_TTL_MS = 60_000;

export function invalidateGroupPasswordHash() {
  hashCache = null;
}

export const getGroupPasswordHash = cache(async (): Promise<string | null> => {
  const { passwordHash } = getServerEnv();
  if (passwordHash) return passwordHash;
  if (hashCache && hashCache.value && Date.now() - hashCache.at < HASH_TTL_MS) return hashCache.value;
  const { data, error } = await db().from("app_config").select("value").eq("key", "group_password_hash").maybeSingle();
  if (error) throw error;
  hashCache = { value: data?.value ?? null, at: Date.now() };
  return hashCache.value;
});

interface AccessToken {
  v: string;
  exp: number;
}

export async function grantAccess(passwordHash: string) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, encode({ v: fingerprint(passwordHash), exp: Date.now() + ACCESS_TTL_DAYS * 86_400_000 }), cookieOptions(ACCESS_TTL_DAYS));
}

export const hasAccess = cache(async (): Promise<boolean> => {
  const jar = await cookies();
  const token = decode<AccessToken>(jar.get(ACCESS_COOKIE)?.value);
  if (!token) return false;
  const hash = await getGroupPasswordHash();
  // Cambiar la contraseña invalida todas las sesiones existentes.
  return Boolean(hash) && token.v === fingerprint(hash!);
});

export async function requireAccess() {
  if (!(await hasAccess())) redirect("/acceso");
}

// ---------------------------------------------------------------------------
// Perfil activo
// ---------------------------------------------------------------------------

interface ProfileToken {
  pid: string;
  pv: string;
  exp: number;
}

export function pinVersion(pinHash: string | null): string {
  return fingerprint(`pin:${pinHash ?? "none"}`);
}

export async function selectProfileSession(profileId: string, pinHash: string | null) {
  const jar = await cookies();
  jar.set(
    PROFILE_COOKIE,
    encode({ pid: profileId, pv: pinVersion(pinHash), exp: Date.now() + PROFILE_TTL_DAYS * 86_400_000 }),
    cookieOptions(PROFILE_TTL_DAYS),
  );
}

export async function clearProfileSession() {
  const jar = await cookies();
  jar.delete(PROFILE_COOKIE);
}

export async function clearAllSessions() {
  const jar = await cookies();
  jar.delete(PROFILE_COOKIE);
  jar.delete(ACCESS_COOKIE);
}

/**
 * Perfil activo validado en servidor: firma, caducidad, acceso de grupo y que
 * el PIN no haya cambiado desde que se desbloqueó.
 */
export const getActiveProfileId = cache(async (): Promise<string | null> => {
  if (!(await hasAccess())) return null;
  const jar = await cookies();
  const token = decode<ProfileToken>(jar.get(PROFILE_COOKIE)?.value);
  if (!token) return null;
  const { data, error } = await db().from("profiles").select("id, pin_hash").eq("id", token.pid).maybeSingle();
  if (error || !data) return null;
  return pinVersion(data.pin_hash) === token.pv ? data.id : null;
});

export async function requireProfileId(): Promise<string> {
  await requireAccess();
  const id = await getActiveProfileId();
  if (!id) redirect("/perfiles");
  return id;
}
