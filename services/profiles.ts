import "server-only";
import { hashSecret, isHashed, safeEqual, verifySecret } from "@/lib/server/crypto";
import { db, unwrap } from "@/lib/server/supabase";
import { lockMessage, PIN_THROTTLE, registerAttempt, resetAttempts } from "@/lib/server/throttle";
import type { ProfileRow, ProfileSettingsRow, PublicProfile } from "@/types/db";

const PUBLIC_COLUMNS = "id, name, color, avatar_url, avatar_emoji, pin_hash";

export function toPublicProfile(row: Pick<ProfileRow, "id" | "name" | "color" | "avatar_url" | "avatar_emoji" | "pin_hash">): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    avatarUrl: row.avatar_url,
    avatarEmoji: row.avatar_emoji ?? null,
    hasPin: Boolean(row.pin_hash),
  };
}

export async function listProfiles(): Promise<PublicProfile[]> {
  const rows = unwrap(
    await db().from("profiles").select(PUBLIC_COLUMNS).order("created_at", { ascending: true }),
  ) as ProfileRow[];
  return rows.map(toPublicProfile);
}

export async function getProfile(id: string): Promise<PublicProfile | null> {
  const row = unwrap(await db().from("profiles").select(PUBLIC_COLUMNS).eq("id", id).maybeSingle()) as ProfileRow | null;
  return row ? toPublicProfile(row) : null;
}

export async function getProfileRow(id: string): Promise<ProfileRow | null> {
  return unwrap(await db().from("profiles").select("*").eq("id", id).maybeSingle()) as ProfileRow | null;
}

export interface ProfileInput {
  name: string;
  color: string;
  avatarUrl?: string | null;
  avatarEmoji?: string | null;
  pin?: string | null;
  timezone?: string;
}

export async function createProfile(input: ProfileInput): Promise<PublicProfile> {
  const row = unwrap(
    await db()
      .from("profiles")
      .insert({
        name: input.name,
        color: input.color,
        avatar_url: input.avatarUrl || null,
        avatar_emoji: input.avatarEmoji || null,
        pin_hash: input.pin ? await hashSecret(input.pin) : null,
      })
      .select(PUBLIC_COLUMNS)
      .single(),
  ) as ProfileRow;

  unwrap(
    await db()
      .from("profile_settings")
      .insert({ profile_id: row.id, timezone: input.timezone || "Europe/Madrid" })
      .select("profile_id")
      .single(),
  );
  return toPublicProfile(row);
}

export async function updateProfile(
  id: string,
  input: Partial<Omit<ProfileInput, "pin">> & { pin?: string | null; removePin?: boolean },
) {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.color !== undefined) patch.color = input.color;
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl || null;
  if (input.avatarEmoji !== undefined) patch.avatar_emoji = input.avatarEmoji || null;
  if (input.removePin) patch.pin_hash = null;
  else if (input.pin) patch.pin_hash = await hashSecret(input.pin);
  unwrap(await db().from("profiles").update(patch).eq("id", id).select("id").single());
}

export async function deleteProfile(id: string) {
  unwrap(await db().from("profiles").delete().eq("id", id));
}

export type PinResult = { ok: true; pinHash: string | null } | { ok: false; error: string };

/**
 * Verifica el PIN. El intento se registra de forma atómica ANTES de comprobar
 * el hash (lib/server/throttle.ts), así que ni siquiera cientos de peticiones
 * en paralelo superan PIN_THROTTLE.max intentos por ventana de bloqueo.
 * Si el perfil viene del prototipo con el PIN en texto plano, se migra a hash.
 */
export async function verifyProfilePin(id: string, pin: string | null): Promise<PinResult> {
  const row = await getProfileRow(id);
  if (!row) return { ok: false, error: "El perfil no existe." };
  if (!row.pin_hash) return { ok: true, pinHash: null };

  const key = `pin:${id}`;
  const remaining = await registerAttempt(key, PIN_THROTTLE);
  if (remaining < 0) return { ok: false, error: lockMessage(PIN_THROTTLE) };

  let valid = false;
  let pinHash = row.pin_hash;
  if (pin && /^\d{4}$/.test(pin)) {
    if (isHashed(row.pin_hash)) valid = await verifySecret(pin, row.pin_hash);
    else if (safeEqual(pin, row.pin_hash)) {
      valid = true;
      pinHash = await hashSecret(pin);
    }
  }

  if (valid) {
    await resetAttempts(key);
    if (pinHash !== row.pin_hash) await db().from("profiles").update({ pin_hash: pinHash }).eq("id", id);
    return { ok: true, pinHash };
  }

  return {
    ok: false,
    error:
      remaining === 0
        ? `PIN incorrecto. Perfil bloqueado ${Math.ceil(PIN_THROTTLE.lockSeconds / 60)} min.`
        : `PIN incorrecto. Quedan ${remaining} ${remaining === 1 ? "intento" : "intentos"}.`,
  };
}

export async function getSettings(profileId: string): Promise<ProfileSettingsRow> {
  const row = unwrap(
    await db().from("profile_settings").select("*").eq("profile_id", profileId).maybeSingle(),
  ) as ProfileSettingsRow | null;
  if (row) return normalizeSettings(row);
  // Perfiles creados por el prototipo anterior no tenían ajustes.
  const created = unwrap(
    await db().from("profile_settings").insert({ profile_id: profileId }).select("*").single(),
  ) as ProfileSettingsRow;
  return normalizeSettings(created);
}

function normalizeSettings(row: ProfileSettingsRow): ProfileSettingsRow {
  return {
    ...row,
    target_weight: row.target_weight != null ? Number(row.target_weight) : null,
    workout_days: [...(row.workout_days ?? [])].map(Number).sort(),
    // Sin la migración de la liga la columna no existe: participa por defecto.
    league_opt_in: row.league_opt_in ?? true,
  };
}

export async function updateSettings(profileId: string, patch: Partial<ProfileSettingsRow>) {
  const { profile_id: _ignored, created_at: _c, updated_at: _u, ...rest } = patch;
  void _ignored;
  void _c;
  void _u;
  unwrap(await db().from("profile_settings").update(rest).eq("profile_id", profileId).select("profile_id").single());
}
