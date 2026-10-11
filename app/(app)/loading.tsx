import { LoadingLabel } from "@/components/ui/LoaderGrid";

/** Esqueleto de carga coherente con las cards (sin spinner genérico). */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pt-[max(20px,env(safe-area-inset-top))] md:px-8 md:pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className="h-3 w-28 rounded bg-field" />
          <span className="h-6 w-48 rounded-md bg-field" />
        </div>
        <LoadingLabel label="Calculando" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-4">
        <div className="flex flex-col gap-3 lg:gap-4">
          {[148, 240, 132].map((h, i) => (
            <div key={i} className="animate-pulse rounded-[14px] border border-line bg-surface" style={{ height: h, animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
        <div className="hidden flex-col gap-4 lg:flex">
          {[150, 170].map((h, i) => (
            <div key={i} className="animate-pulse rounded-[14px] border border-line bg-surface" style={{ height: h }} />
          ))}
        </div>
      </div>
    </div>
  );
}
