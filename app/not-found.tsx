import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="tabular text-4xl font-semibold text-ink-3">404</p>
      <h1 className="text-base font-semibold">Esta página no existe</h1>
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        Volver al inicio
      </Link>
    </main>
  );
}
