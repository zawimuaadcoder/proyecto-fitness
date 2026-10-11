"use client";

import { Lock, LogOut, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LoadingLabel } from "@/components/ui/LoaderGrid";
import { Sheet } from "@/components/ui/Sheet";
import { APP_NAME, LOCAL_PREFS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useLocalPref } from "@/hooks/useLocalPref";
import { logout, unlockProfile } from "@/features/auth/actions";
import type { PublicProfile } from "@/types/db";
import { seedDemoAction } from "./actions";
import { PinPad } from "./PinPad";

/** Selector de perfil estilo Netflix. */
export function ProfileGrid({ profiles, autoOpen, demoAvailable }: { profiles: PublicProfile[]; autoOpen: string | null; demoAvailable: boolean }) {
  const router = useRouter();
  const [lastProfile] = useLocalPref<string | null>(LOCAL_PREFS.lastProfile, null);
  const [pinFor, setPinFor] = useState<PublicProfile | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seeding, startSeeding] = useTransition();
  const [seedError, setSeedError] = useState<string | null>(null);

  async function open(profile: PublicProfile, pin: string | null = null): Promise<boolean> {
    setError(null);
    setOpening(profile.id);
    const res = await unlockProfile(profile.id, pin);
    if (res.ok && res.data) {
      router.push(res.data.next);
      router.refresh();
      return true;
    }
    setOpening(null);
    setError(res.error ?? "No se pudo abrir");
    return false;
  }

  function seed() {
    startSeeding(async () => {
      setSeedError(null);
      const res = await seedDemoAction(Intl.DateTimeFormat().resolvedOptions().timeZone);
      if (!res.ok) setSeedError(res.error ?? "Error");
      router.refresh();
    });
  }

  function choose(profile: PublicProfile) {
    if (profile.hasPin) {
      setError(null);
      setPinFor(profile);
    } else void open(profile);
  }

  useEffect(() => {
    if (!autoOpen) return;
    const p = profiles.find((x) => x.id === autoOpen);
    if (!p) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- abrir el perfil pedido por URL una sola vez
    if (p.hasPin) setPinFor(p);
    else void open(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  return (
    <main className="flex min-h-dvh flex-col items-center px-5 py-[max(40px,env(safe-area-inset-top))]">
      <header className="flex w-full max-w-3xl items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-ink-2">{APP_NAME}</span>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" icon={<LogOut />}>
            Salir
          </Button>
        </form>
      </header>

      <section className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-10">
        <h1 className="animate-fade-up text-center text-2xl font-semibold tracking-tight md:text-3xl">¿Quién eres?</h1>
        <p className="animate-fade-up mt-2 text-center text-sm text-ink-3">Elige tu perfil para continuar.</p>

        <ul className="stagger mt-10 grid w-full grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center md:gap-8">
          {profiles.map((p) => (
            <li key={p.id} className="flex justify-center">
              <button
                type="button"
                onClick={() => choose(p)}
                disabled={opening !== null}
                aria-label={`Abrir perfil de ${p.name}${p.hasPin ? " (protegido con PIN)" : ""}`}
                className="group flex w-full max-w-[132px] flex-col items-center gap-3 outline-none"
              >
                <span
                  className={cn(
                    "relative rounded-[24%] ring-offset-4 ring-offset-canvas transition-[transform,box-shadow] duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-accent group-active:scale-[0.97]",
                    lastProfile === p.id && "ring-1 ring-line-strong",
                  )}
                >
                  <Avatar name={p.name} color={p.color} emoji={p.avatarEmoji} url={p.avatarUrl} size={104} rounded="xl" className="shadow-card" />
                  {p.hasPin && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-2 shadow-soft">
                      <Lock className="size-3.5" />
                    </span>
                  )}
                  {opening === p.id && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-[22%] bg-black/45">
                      <LoadingLabel label="" showTime={false} className="text-white" />
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate text-[15px] text-ink-2 transition-colors group-hover:text-ink">{p.name}</span>
              </button>
            </li>
          ))}
          <li className="flex justify-center">
            <Link href="/perfiles/nuevo" className="group flex w-full max-w-[132px] flex-col items-center gap-3 outline-none" aria-label="Crear perfil nuevo">
              <span className="flex size-[104px] items-center justify-center rounded-[22%] border border-dashed border-line-strong text-ink-3 transition-[transform,color,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-ink-3 group-hover:text-ink group-focus-visible:ring-2 group-focus-visible:ring-accent">
                <Plus className="size-8" strokeWidth={1.5} />
              </span>
              <span className="text-[15px] text-ink-3 group-hover:text-ink-2">Nuevo perfil</span>
            </Link>
          </li>
        </ul>

        {error && !pinFor && (
          <p role="alert" className="mt-6 text-sm text-red">
            {error}
          </p>
        )}

        {demoAvailable && profiles.length === 0 && (
          <div className="animate-fade-up mt-12 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-center">
            <Sparkles className="size-5 text-accent" />
            <p className="text-sm text-ink-2">¿Quieres ver la app con datos? Crea 3 perfiles de ejemplo (Alex con 6 semanas de historial, Marta con PIN 1234 y Leo vacío).</p>
            <Button variant="subtle" loading={seeding} onClick={seed}>
              Crear perfiles demo
            </Button>
            {seeding && <LoadingLabel label="Generando historial" />}
            {seedError && <p className="text-xs text-red">{seedError}</p>}
          </div>
        )}
        {demoAvailable && profiles.length > 0 && (
          <div className="mt-12 flex flex-col items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Sparkles />} loading={seeding} onClick={seed}>
              Añadir perfiles demo
            </Button>
            {seeding && <LoadingLabel label="Generando historial" />}
            {seedError && <p className="text-xs text-red">{seedError}</p>}
          </div>
        )}
      </section>

      <Sheet open={pinFor !== null} onClose={() => setPinFor(null)} size="sm" title={pinFor ? `Hola, ${pinFor.name}` : ""} description="Introduce tu PIN de 4 dígitos">
        {pinFor && (
          <PinPad key={pinFor.id} pending={opening === pinFor.id} error={error} onComplete={(pin) => open(pinFor, pin)} />
        )}
      </Sheet>
    </main>
  );
}
