"use client";

import { Check, ChevronsUpDown, LogOut, Pencil, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { logout, switchProfile } from "@/features/auth/actions";
import { useAppProfile } from "@/features/app/ProfileContext";

/** Cabecera de la sidebar con menú desplegable del perfil. */
export function ProfileSwitcher({ collapsed }: { collapsed: boolean }) {
  const { profile, profiles } = useAppProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const others = profiles.filter((p) => p.id !== profile.id);
  const item =
    "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-ink-2 hover:bg-hover hover:text-ink [&_svg]:size-4 [&_svg]:text-ink-3";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Perfil: ${profile.name}. Abrir menú`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center gap-2.5 overflow-hidden rounded-[10px] px-[4px] text-left transition-colors hover:bg-hover"
      >
        <Avatar name={profile.name} color={profile.color} emoji={profile.avatarEmoji} url={profile.avatarUrl} size={28} />
        <span className={cn("min-w-0 flex-1 truncate text-sm font-medium transition-opacity duration-200", collapsed && "opacity-0")}>
          {profile.name}
        </span>
        <ChevronsUpDown className={cn("size-3.5 shrink-0 text-ink-3 transition-opacity duration-200", collapsed && "opacity-0")} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-pop-in absolute left-0 top-12 z-50 w-60 origin-top-left rounded-xl border border-line-strong bg-surface p-1.5 shadow-float"
        >
          {others.length > 0 && (
            <>
              <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-3">Cambiar a</p>
              {others.slice(0, 5).map((p) => (
                <Link key={p.id} role="menuitem" href={`/perfiles?abrir=${p.id}`} className={item} onClick={() => setOpen(false)}>
                  <Avatar name={p.name} color={p.color} emoji={p.avatarEmoji} url={p.avatarUrl} size={20} />
                  <span className="flex-1 truncate">{p.name}</span>
                  {p.hasPin && <span className="text-[11px] text-ink-3">PIN</span>}
                </Link>
              ))}
              <div className="my-1 h-px bg-line" />
            </>
          )}
          <div className={cn(item, "pointer-events-none text-ink")}>
            <Check /> {profile.name}
          </div>
          <form action={switchProfile}>
            <button role="menuitem" className={item}>
              <Users /> Cambiar perfil
            </button>
          </form>
          <Link role="menuitem" href="/ajustes#perfil" className={item} onClick={() => setOpen(false)}>
            <Pencil /> Editar perfil
          </Link>
          <Link role="menuitem" href="/perfiles/nuevo" className={item} onClick={() => setOpen(false)}>
            <Plus /> Crear perfil
          </Link>
          <Link role="menuitem" href="/ajustes" className={item} onClick={() => setOpen(false)}>
            <Settings /> Ajustes
          </Link>
          <div className="my-1 h-px bg-line" />
          <form action={logout}>
            <button role="menuitem" className={cn(item, "hover:text-red")}>
              <LogOut /> Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
