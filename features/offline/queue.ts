"use client";

import { LOCAL_PREFS } from "@/lib/constants";

/**
 * Cola local para registros hechos sin conexión. Es la única excepción a
 * "localStorage solo para preferencias": guarda temporalmente lo pendiente de
 * sincronizar y se vacía en cuanto vuelve la red.
 */

export type QueueKind = "weight" | "workout" | "cardio" | "note" | "habitLog";

export interface QueuedItem {
  id: string;
  profileId: string;
  kind: QueueKind;
  payload: unknown;
  createdAt: number;
}

const listeners = new Set<() => void>();

function read(): QueuedItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PREFS.offlineQueue) ?? "[]") as QueuedItem[];
  } catch {
    return [];
  }
}

function write(items: QueuedItem[]) {
  try {
    localStorage.setItem(LOCAL_PREFS.offlineQueue, JSON.stringify(items));
  } catch {
    // almacenamiento no disponible: se pierde la cola, la UI ya avisó
  }
  listeners.forEach((l) => l());
}

export const offlineQueue = {
  list: read,
  count(profileId: string) {
    return read().filter((i) => i.profileId === profileId).length;
  },
  add(item: Omit<QueuedItem, "id" | "createdAt">) {
    write([...read(), { ...item, id: crypto.randomUUID?.() ?? String(Date.now()), createdAt: Date.now() }]);
  },
  remove(id: string) {
    write(read().filter((i) => i.id !== id));
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === LOCAL_PREFS.offlineQueue && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};
