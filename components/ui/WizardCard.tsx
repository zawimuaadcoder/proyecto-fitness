"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { Odometer } from "./Odometer";
import { ProgressBar } from "./Progress";

/** Tarjeta de asistente paso a paso con contador odómetro. */
export function WizardCard({
  step,
  total,
  title,
  description,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = "Continuar",
  nextDisabled,
  pending,
}: {
  step: number;
  total: number;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  pending?: boolean;
}) {
  return (
    <section className="flex w-full flex-col" aria-labelledby="wizard-title">
      <div className="mb-6 flex items-center gap-3">
        <span className="tabular flex items-baseline text-[13px] font-medium text-ink-2" aria-label={`Paso ${step} de ${total}`}>
          <Odometer value={step} />
          <span className="mx-1 text-ink-3">/</span>
          <span className="text-ink-3">{total}</span>
        </span>
        <ProgressBar value={step / total} height={3} className="flex-1" tone="ink" />
        {onBack && (
          <button type="button" onClick={onBack} className="text-[13px] text-ink-3 hover:text-ink">
            Atrás
          </button>
        )}
      </div>
      <div key={step} className="animate-fade-up">
        <h1 id="wizard-title" className="text-[22px] font-semibold tracking-tight">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-ink-3">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-8 flex items-center gap-2">
        {onSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Omitir
          </Button>
        )}
        <Button variant="primary" size="lg" className="ml-auto min-w-36" onClick={onNext} disabled={nextDisabled} loading={pending}>
          {nextLabel}
        </Button>
      </div>
    </section>
  );
}

/** Opción grande tipo radio para asistentes (auto-avance opcional). */
export function ChoiceButton({
  selected,
  onClick,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-[10px] px-4 py-3 text-left transition-[box-shadow,background-color,transform] duration-150 active:scale-[0.99] ${
        selected ? "bg-surface shadow-card" : "bg-field shadow-hairline hover:bg-hover"
      }`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="flex-1">
        <span className="block text-[15px] font-medium text-ink">{title}</span>
        {description && <span className="block text-xs text-ink-3">{description}</span>}
      </span>
      <span
        aria-hidden
        className={`flex size-5 items-center justify-center rounded-full border transition-colors ${selected ? "border-transparent bg-ink" : "border-ink-3"}`}
      >
        {selected && <span className="size-2 rounded-full bg-canvas" />}
      </span>
    </button>
  );
}
