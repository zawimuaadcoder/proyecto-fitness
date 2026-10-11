"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { isValidTimeZone } from "@/lib/dates";
import { profileAction } from "@/lib/server/action";
import { clearProfileSession, requireAccess, selectProfileSession } from "@/lib/server/session";
import { profileSchema, profileUpdateSchema } from "@/lib/validation";
import { seedDemoProfiles } from "@/services/demo";
import { createProfile, deleteProfile, getProfileRow, listProfiles, updateProfile } from "@/services/profiles";
import type { ActionResult } from "@/types/domain";

export async function createProfileAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAccess();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const v = parsed.data;
    const profile = await createProfile({
      name: v.name,
      color: v.color,
      avatarEmoji: v.avatarEmoji,
      avatarUrl: v.avatarUrl || null,
      pin: v.pin || null,
      timezone: v.timezone && isValidTimeZone(v.timezone) ? v.timezone : undefined,
    });
    const row = await getProfileRow(profile.id);
    // Quien crea el perfil entra directamente en él (y pasa al onboarding).
    await selectProfileSession(profile.id, row?.pin_hash ?? null);
    revalidatePath("/", "layout");
    return { ok: true, data: { id: profile.id } };
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return { ok: false, error: "No se pudo crear el perfil." };
  }
}

export async function updateProfileAction(input: unknown) {
  return profileAction(profileUpdateSchema, input, async (profileId, v) => {
    await updateProfile(profileId, {
      name: v.name,
      color: v.color,
      avatarEmoji: v.avatarEmoji,
      avatarUrl: v.avatarUrl === undefined ? undefined : v.avatarUrl || null,
      pin: v.pin || null,
      removePin: v.removePin,
    });
    // Si cambia el PIN, se renueva la sesión de este dispositivo.
    if (v.pin || v.removePin) {
      const row = await getProfileRow(profileId);
      await selectProfileSession(profileId, row?.pin_hash ?? null);
    }
  });
}

export async function deleteProfileAction(confirmName: string): Promise<ActionResult<void>> {
  const result = await profileAction(profileUpdateSchema.pick({ name: true }), { name: confirmName }, async (profileId, v) => {
    const row = await getProfileRow(profileId);
    if (!row || row.name.trim().toLowerCase() !== (v.name ?? "").trim().toLowerCase()) {
      throw new Error("El nombre no coincide.");
    }
    await deleteProfile(profileId);
    await clearProfileSession();
  });
  if (result.ok) redirect("/perfiles");
  return result;
}

export async function seedDemoAction(timezone: string): Promise<ActionResult> {
  try {
    await requireAccess();
    const existing = await listProfiles();
    if (existing.some((p) => ["Alex", "Marta", "Leo"].includes(p.name))) {
      return { ok: false, error: "Los perfiles demo ya existen." };
    }
    await seedDemoProfiles(isValidTimeZone(timezone) ? timezone : "Europe/Madrid");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return { ok: false, error: "No se pudieron crear los datos demo." };
  }
}
