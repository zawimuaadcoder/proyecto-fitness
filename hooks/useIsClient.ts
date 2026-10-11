"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true solo en el cliente (evita desajustes de hidratación con portales). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
