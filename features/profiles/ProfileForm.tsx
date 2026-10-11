"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, Switch, TextInput } from "@/components/ui/Inputs";
import { AVATAR_EMOJIS, PROFILE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/cn";

export interface ProfileFormValues {
  name: string;
  color: string;
  avatarEmoji: string | null;
  avatarUrl: string;
  pin: string;
  pinEnabled: boolean;
}

/** Formulario compacto de perfil (crear y editar). */
export function ProfileForm({
  initial,
  hasExistingPin = false,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  initial?: Partial<ProfileFormValues>;
  hasExistingPin?: boolean;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: (values: ProfileFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? PROFILE_COLORS[0]);
  const [emoji, setEmoji] = useState<string | null>(initial?.avatarEmoji ?? null);
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? "");
  const [pinEnabled, setPinEnabled] = useState(hasExistingPin);
  const [pin, setPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setLocalError("Escribe un nombre.");
    if (pinEnabled && !hasExistingPin && !/^\d{4}$/.test(pin)) return setLocalError("El PIN debe tener 4 dígitos.");
    if (pin && !/^\d{4}$/.test(pin)) return setLocalError("El PIN debe tener 4 dígitos.");
    setLocalError(null);
    onSubmit({ name: name.trim(), color, avatarEmoji: emoji, avatarUrl: avatarUrl.trim(), pin, pinEnabled });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div className="flex items-center gap-4">
        <Avatar name={name || "?"} color={color} emoji={emoji} url={avatarUrl || null} size={64} rounded="xl" />
        <Field label="Nombre" htmlFor="p-name" className="flex-1">
          <TextInput id="p-name" value={name} maxLength={24} autoComplete="off" onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
        </Field>
      </div>

      <Field label="Color">
        <div role="radiogroup" aria-label="Color del perfil" className="flex flex-wrap gap-2">
          {PROFILE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-transform duration-150 hover:scale-105",
                color === c && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
              )}
              style={{ background: c }}
            >
              {color === c && <Check className="size-4 text-white" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Avatar (opcional)">
        <div role="radiogroup" aria-label="Emoji del avatar" className="flex flex-wrap gap-1.5">
          <button
            type="button"
            role="radio"
            aria-checked={emoji === null}
            onClick={() => setEmoji(null)}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-[8px] px-2 text-[13px] font-semibold",
              emoji === null ? "bg-surface shadow-card" : "bg-field shadow-hairline text-ink-3",
            )}
          >
            {(name.trim()[0] ?? "A").toUpperCase()}
          </button>
          {AVATAR_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={emoji === e}
              aria-label={`Avatar ${e}`}
              onClick={() => setEmoji(e)}
              className={cn(
                "flex size-10 items-center justify-center rounded-[8px] text-lg transition-colors",
                emoji === e ? "bg-surface shadow-card" : "bg-field shadow-hairline hover:bg-hover",
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <TextInput
          aria-label="URL de imagen (opcional)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="…o URL de una imagen (https://)"
          inputMode="url"
          className="mt-2"
        />
      </Field>

      <div className="rounded-[10px] bg-inset p-3.5 shadow-hairline">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">PIN de 4 dígitos</p>
            <p className="text-xs text-ink-3">{hasExistingPin ? "Este perfil tiene PIN." : "Opcional. Protege tu perfil en dispositivos compartidos."}</p>
          </div>
          <Switch checked={pinEnabled} onChange={setPinEnabled} label="Proteger con PIN" />
        </div>
        {pinEnabled && (
          <div className="animate-fade-up mt-3">
            <TextInput
              aria-label={hasExistingPin ? "Nuevo PIN (déjalo vacío para mantenerlo)" : "PIN"}
              inputMode="numeric"
              autoComplete="new-password"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder={hasExistingPin ? "Nuevo PIN (opcional)" : "••••"}
              className="tabular tracking-[0.5em]"
            />
          </div>
        )}
      </div>

      {(localError || error) && (
        <p role="alert" className="text-[13px] text-red">
          {localError || error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" loading={pending} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
