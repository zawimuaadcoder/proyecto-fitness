"use client";

import { KeyRound, LogOut, Tags, Trash2, UserRound, Users, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Inputs";
import { EntityChip } from "@/components/ui/Pills";
import { useToast } from "@/components/ui/Toast";
import { useAppProfile } from "@/features/app/ProfileContext";
import { changePassword, logout, switchProfile } from "@/features/auth/actions";
import { removeCustomType } from "@/features/entries/actions";
import { useAction } from "@/features/offline/useMutation";
import { deleteProfileAction, updateProfileAction } from "@/features/profiles/actions";
import { ProfileForm } from "@/features/profiles/ProfileForm";

export function ProfileSettingsCard() {
  const { profile } = useAppProfile();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const toast = useToast();

  return (
    <Card id="perfil">
      <CardHeader icon={<UserRound />} title="Perfil" />
      <ProfileForm
        key={formKey}
        initial={{ name: profile.name, color: profile.color, avatarEmoji: profile.avatarEmoji, avatarUrl: profile.avatarUrl ?? "" }}
        hasExistingPin={profile.hasPin}
        submitLabel="Guardar perfil"
        pending={pending}
        error={error}
        onSubmit={(v) =>
          start(async () => {
            setError(null);
            const res = await updateProfileAction({
              name: v.name,
              color: v.color,
              avatarEmoji: v.avatarEmoji,
              avatarUrl: v.avatarUrl || "",
              pin: v.pinEnabled && v.pin ? v.pin : null,
              removePin: profile.hasPin && !v.pinEnabled,
            });
            if (res.ok) {
              toast.success("Perfil guardado");
              setFormKey((k) => k + 1);
            } else setError(res.error ?? "Error");
          })
        }
      />
    </Card>
  );
}

export function CustomTypesCard() {
  const { customTypes } = useAppProfile();
  const { run } = useAction();
  return (
    <Card>
      <CardHeader icon={<Tags />} title="Tipos personalizados" subtitle="Se crean desde el registro con «+ Nuevo»" />
      {customTypes.length === 0 ? (
        <p className="text-[13px] text-ink-3">Aún no has creado tipos propios.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {customTypes.map((t) => (
            <EntityChip key={t.id} className="h-7 pr-0.5">
              <span className="text-ink-3">{t.category === "workout" ? "Entreno" : "Cardio"} ·</span> {t.name}
              <button
                type="button"
                aria-label={`Eliminar tipo ${t.name}`}
                onClick={() => run(() => removeCustomType({ id: t.id }), "Tipo eliminado")}
                className="ml-0.5 flex size-5 items-center justify-center rounded text-ink-3 hover:bg-hover hover:text-red"
              >
                <X className="size-3" />
              </button>
            </EntityChip>
          ))}
        </div>
      )}
    </Card>
  );
}

export function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const { run, pending } = useAction();
  return (
    <Card>
      <CardHeader icon={<KeyRound />} title="Contraseña del grupo" subtitle="Al cambiarla se cierran las sesiones del resto de dispositivos" />
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await run(() => changePassword(current, next), "Contraseña cambiada");
          if (res.ok) {
            setCurrent("");
            setNext("");
          }
        }}
      >
        <Field label="Actual" htmlFor="pw-current">
          <TextInput id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="Nueva (mín. 6 caracteres)" htmlFor="pw-new">
          <TextInput id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Button type="submit" variant="secondary" loading={pending} disabled={!current || next.length < 6} className="self-end">
          Cambiar contraseña
        </Button>
      </form>
    </Card>
  );
}

export function SessionCard() {
  return (
    <Card>
      <div className="flex flex-wrap gap-2">
        <form action={switchProfile}>
          <Button type="submit" variant="secondary" icon={<Users />}>
            Cambiar perfil
          </Button>
        </form>
        <form action={logout}>
          <Button type="submit" variant="ghost" icon={<LogOut />}>
            Cerrar sesión general
          </Button>
        </form>
      </div>
    </Card>
  );
}

export function DangerCard() {
  const { profile } = useAppProfile();
  const [confirm, setConfirm] = useState("");
  const { run, pending } = useAction();
  return (
    <Card className="border-red/25">
      <CardHeader icon={<Trash2 />} title="Eliminar perfil" subtitle="Borra el perfil y todos sus registros. No se puede deshacer." />
      <div className="flex flex-col gap-2 sm:flex-row">
        <TextInput aria-label={`Escribe ${profile.name} para confirmar`} placeholder={`Escribe «${profile.name}» para confirmar`} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button
          variant="danger"
          loading={pending}
          disabled={confirm.trim().toLowerCase() !== profile.name.trim().toLowerCase()}
          onClick={() => run(() => deleteProfileAction(confirm), "Perfil eliminado")}
        >
          Eliminar
        </Button>
      </div>
    </Card>
  );
}
