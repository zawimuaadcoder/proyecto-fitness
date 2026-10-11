"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { hashSecret, verifySecret } from "@/lib/server/crypto";
import { getServerEnv } from "@/lib/server/env";
import {
  clearAllSessions,
  clearProfileSession,
  getGroupPasswordHash,
  grantAccess,
  hasAccess,
  requireAccess,
  selectProfileSession,
} from "@/lib/server/session";
import { db, unwrap } from "@/lib/server/supabase";
import { countProfileData } from "@/services/snapshot";
import { getSettings, verifyProfilePin } from "@/services/profiles";
import type { ActionResult } from "@/types/domain";

const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(128);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function submitPassword(password: string): Promise<ActionResult> {
  try {
    const hash = await getGroupPasswordHash();
    if (!hash) return { ok: false, error: "La contraseña de grupo aún no está configurada." };
    if (!(await verifySecret(password, hash))) {
      await delay(500); // frena ataques de fuerza bruta
      return { ok: false, error: "Contraseña incorrecta." };
    }
    await grantAccess(hash);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "No se pudo verificar. Revisa la conexión con la base de datos." };
  }
}

/** Primer arranque: si no hay contraseña de grupo se define aquí (solo una vez). */
export async function setupPassword(password: string): Promise<ActionResult> {
  try {
    if (getServerEnv().passwordHash || (await getGroupPasswordHash())) {
      return { ok: false, error: "La contraseña ya está configurada." };
    }
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const hash = await hashSecret(parsed.data);
    const { error } = await db().from("app_config").insert({ key: "group_password_hash", value: hash });
    if (error) return { ok: false, error: "No se pudo guardar (¿ya existe?)." };
    await grantAccess(hash);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "No se pudo guardar la contraseña." };
  }
}

export async function changePassword(current: string, next: string): Promise<ActionResult> {
  try {
    if (!(await hasAccess())) return { ok: false, error: "Sesión caducada." };
    if (getServerEnv().passwordHash) {
      return { ok: false, error: "La contraseña está definida en APP_PASSWORD_HASH (Vercel). Cámbiala allí." };
    }
    const hash = await getGroupPasswordHash();
    if (!hash || !(await verifySecret(current, hash))) return { ok: false, error: "La contraseña actual no es correcta." };
    const parsed = passwordSchema.safeParse(next);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const newHash = await hashSecret(parsed.data);
    unwrap(await db().from("app_config").update({ value: newHash }).eq("key", "group_password_hash"));
    // Las demás sesiones quedan invalidadas; esta se renueva.
    await grantAccess(newHash);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "No se pudo cambiar la contraseña." };
  }
}

export async function unlockProfile(profileId: string, pin: string | null): Promise<ActionResult<{ next: string }>> {
  try {
    await requireAccess();
    if (!z.string().uuid().safeParse(profileId).success) return { ok: false, error: "Perfil no válido" };
    const result = await verifyProfilePin(profileId, pin);
    if (!result.ok) return { ok: false, error: result.error };
    await selectProfileSession(profileId, result.pinHash);
    const settings = await getSettings(profileId);
    const hasData = settings.onboarded || (await countProfileData(profileId)) > 0;
    return { ok: true, data: { next: hasData ? "/hoy" : "/onboarding" } };
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return { ok: false, error: "No se pudo abrir el perfil." };
  }
}

export async function switchProfile() {
  await clearProfileSession();
  redirect("/perfiles");
}

export async function logout() {
  await clearAllSessions();
  redirect("/acceso");
}
