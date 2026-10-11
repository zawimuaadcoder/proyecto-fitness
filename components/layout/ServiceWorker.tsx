"use client";

import { useEffect } from "react";

/** Registra el service worker (PWA instalable + shell offline). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // sin SW la app funciona igual, solo sin modo offline
    });
  }, []);
  return null;
}
