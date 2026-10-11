"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { LOCAL_PREFS, SIDEBAR_COOKIE } from "@/lib/constants";
import { ProfileProvider, type AppProfile } from "@/features/app/ProfileContext";
import { OfflineSync } from "@/features/offline/OfflineSync";
import { QuickAddProvider, useQuickAdd } from "@/features/quick-add/QuickAdd";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./Sidebar";



function Shortcuts() {
  const { open } = useQuickAdd();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, [contenteditable], [role=dialog]")) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return null;
}

export function AppShell({
  value,
  initialCollapsed,
  children,
}: {
  value: AppProfile;
  initialCollapsed: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PREFS.lastProfile, JSON.stringify(value.profile.id));
    } catch {
      // preferencia opcional
    }
  }, [value.profile.id]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <ToastProvider>
      <ProfileProvider value={value}>
        <QuickAddProvider>
          <Shortcuts />
          <OfflineSync />
          <div className="flex min-h-dvh">
            <Sidebar collapsed={collapsed} onToggle={toggle} />
            <main id="contenido" className="min-w-0 flex-1 pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-12">
              {children}
            </main>
          </div>
          <MobileNavigation />
        </QuickAddProvider>
      </ProfileProvider>
    </ToastProvider>
  );
}
