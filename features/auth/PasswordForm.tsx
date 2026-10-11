"use client";

import { ArrowRight, Eye, EyeOff, Flame, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { setupPassword, submitPassword } from "./actions";

export function PasswordForm({ mode, needsToken = false }: { mode: "login" | "setup"; needsToken?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "setup" && password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    startTransition(async () => {
      const res = mode === "setup" ? await setupPassword(password, token) : await submitPassword(password);
      if (res.ok) {
        router.replace("/perfiles");
        router.refresh();
      } else {
        setError(res.error ?? "Error");
        setShake((s) => s + 1);
      }
    });
  }

  const input =
    "h-12 w-full rounded-[10px] bg-field shadow-hairline px-4 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:shadow-[0_0_0_1px_var(--accent),0_0_0_4px_var(--accent-tint)]";

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] size-[420px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--orange-tint), transparent 65%)" }}
      />
      <form onSubmit={onSubmit} className="animate-fade-up relative w-full max-w-[360px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-5 flex size-12 items-center justify-center rounded-[14px] bg-surface shadow-card">
            <Flame className="animate-flame size-6 text-orange" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1.5 text-sm text-ink-3">
            {mode === "setup" ? "Primer acceso: define la contraseña del grupo." : "Introduce la contraseña del grupo."}
          </p>
        </div>

        <div key={shake} className={cn("flex flex-col gap-2.5", shake > 0 && "animate-[pop-in_260ms_var(--ease-expo)]")}>
          <div className="relative">
            <Lock aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              type={show ? "text" : "password"}
              autoComplete={mode === "setup" ? "new-password" : "current-password"}
              aria-label="Contraseña del grupo"
              placeholder="Contraseña"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(input, "pl-10 pr-12")}
            />
            <button
              type="button"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={show}
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 hover:text-ink"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {mode === "setup" && needsToken && (
            <input
              type="password"
              autoComplete="off"
              aria-label="Código de configuración (SETUP_TOKEN)"
              placeholder="Código de configuración"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={input}
            />
          )}
          {mode === "setup" && (
            <input
              type={show ? "text" : "password"}
              autoComplete="new-password"
              aria-label="Repite la contraseña"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={input}
            />
          )}
          {error && (
            <p role="alert" className="animate-fade-in px-1 text-[13px] text-red">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" loading={pending} disabled={!password} className="mt-1 w-full">
            {mode === "setup" ? "Guardar y entrar" : "Entrar"}
            {!pending && <ArrowRight />}
          </Button>
        </div>
        {mode === "setup" && (
          <p className="mt-5 text-center text-xs text-ink-3">Se guarda solo como hash (scrypt). Podrás cambiarla en Ajustes.</p>
        )}
      </form>
    </main>
  );
}
