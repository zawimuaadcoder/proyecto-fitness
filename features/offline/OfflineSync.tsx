"use client";

import { CloudOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LoadingLabel } from "@/components/ui/LoaderGrid";
import { useToast } from "@/components/ui/Toast";
import { useAppProfile } from "@/features/app/ProfileContext";
import { offlineQueue } from "./queue";
import { queueActions } from "./useMutation";

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

/** Banner de estado offline + sincronización automática de la cola. */
export function OfflineSync() {
  const online = useOnline();
  const { profile } = useAppProfile();
  const toast = useToast();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const busy = useRef(false);
  const pending = useSyncExternalStore(
    offlineQueue.subscribe,
    () => offlineQueue.count(profile.id),
    () => 0,
  );

  const flush = useCallback(async () => {
    if (busy.current || !navigator.onLine) return;
    const items = offlineQueue.list().filter((i) => i.profileId === profile.id);
    if (!items.length) return;
    busy.current = true;
    setSyncing(true);
    let synced = 0;
    for (const item of items) {
      try {
        const res = await queueActions[item.kind](item.payload);
        // Si el servidor lo rechaza (datos no válidos), se descarta para no bloquear la cola.
        offlineQueue.remove(item.id);
        if (res.ok) synced++;
      } catch {
        break; // sigue sin red
      }
    }
    busy.current = false;
    setSyncing(false);
    if (synced) {
      toast.success(`${synced} registro${synced === 1 ? "" : "s"} sincronizado${synced === 1 ? "" : "s"}`);
      router.refresh();
    }
  }, [profile.id, router, toast]);

  useEffect(() => {
    if (!online) return;
    // Al recuperar la conexión (o al montar) se vacía la cola pendiente.
    const t = setTimeout(() => void flush(), 300);
    return () => clearTimeout(t);
  }, [online, flush]);

  if (online && !syncing) return null;

  return (
    <div className="animate-fade-up fixed left-1/2 top-[max(12px,env(safe-area-inset-top))] z-[65] -translate-x-1/2 rounded-full bg-surface px-3.5 py-1.5 shadow-overlay">
      {syncing ? (
        <LoadingLabel label="Sincronizando" />
      ) : (
        <span role="status" className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
          <CloudOff className="size-3.5 text-orange" />
          Sin conexión
          {pending > 0 && <span className="tabular text-ink-3">· {pending} pendiente{pending === 1 ? "" : "s"}</span>}
        </span>
      )}
    </div>
  );
}
