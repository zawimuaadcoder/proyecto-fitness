"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProfileAction } from "./actions";
import { ProfileForm } from "./ProfileForm";

export function CreateProfile() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <ProfileForm
      submitLabel="Crear perfil"
      pending={pending}
      error={error}
      onSubmit={(v) =>
        start(async () => {
          const res = await createProfileAction({
            name: v.name,
            color: v.color,
            avatarEmoji: v.avatarEmoji,
            avatarUrl: v.avatarUrl || null,
            pin: v.pinEnabled ? v.pin : null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
          if (res.ok) {
            router.push("/onboarding");
            router.refresh();
          } else setError(res.error ?? "Error");
        })
      }
    />
  );
}
