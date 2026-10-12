"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Field, NumberStepper, Switch, WeekdayPicker } from "@/components/ui/Inputs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChoiceButton, WizardCard } from "@/components/ui/WizardCard";
import { GOAL_LABELS } from "@/lib/constants";
import { GROUP_HABIT_POINTS, GROUP_HABITS } from "@/lib/domain/group-habits";
import { cn } from "@/lib/cn";
import type { CardioMode, Goal, HabitKind, WeightUnit } from "@/types/db";
import { completeOnboarding } from "@/features/settings/actions";

interface PresetHabit {
  key: string;
  name: string;
  icon: string;
  kind: HabitKind;
  weekdays: number[];
  targetValue?: number;
  unit?: string;
  required: boolean;
  on: boolean;
  hint: string;
}

const ALL = [1, 2, 3, 4, 5, 6, 7];

const PRESETS: PresetHabit[] = [
  { key: "weight", name: "Registrar peso", icon: "scale", kind: "weight", weekdays: [1, 3, 5], required: true, on: true, hint: "L · X · V" },
  { key: "cardio", name: "Cardio 30 min", icon: "footprints", kind: "cardio", weekdays: [2, 4, 6], targetValue: 30, unit: "min", required: true, on: true, hint: "M · J · S" },
  { key: "water", name: "Agua", icon: "droplet", kind: "quantity", weekdays: ALL, targetValue: 2.5, unit: "L", required: true, on: true, hint: "2,5 L diarios" },
  { key: "sleep", name: "Dormir 7 h", icon: "moon", kind: "check", weekdays: ALL, required: false, on: false, hint: "Opcional" },
  { key: "steps", name: "10.000 pasos", icon: "footprints", kind: "check", weekdays: ALL, required: false, on: false, hint: "Opcional" },
  { key: "read", name: "Leer 15 min", icon: "book-open", kind: "check", weekdays: [1, 2, 3, 4, 5], required: false, on: false, hint: "Opcional" },
];

const GOAL_EMOJI: Record<Goal, string> = { lose_fat: "🔥", gain_muscle: "💪", maintain: "⚖️", habits: "🎯", other: "✨" };

const DEFAULT_DAYS: Record<number, number[]> = {
  2: [2, 5],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
};

export function OnboardingWizard({ name }: { name: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [cardioMode, setCardioMode] = useState<CardioMode>("both");
  const [cardioDays, setCardioDays] = useState<number | null>(3);
  const [cardioMinutes, setCardioMinutes] = useState<number | null>(150);
  const [habits, setHabits] = useState(PRESETS);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const total = 5;

  const next = () => setStep((s) => Math.min(total, s + 1));
  const back = step > 1 ? () => setStep((s) => s - 1) : undefined;

  function finish() {
    setError(null);
    start(async () => {
      const res = await completeOnboarding({
        weightUnit: unit,
        goal,
        targetWeight: goal === "lose_fat" || goal === "gain_muscle" ? targetWeight : null,
        workoutDays: days,
        cardioMode,
        cardioDaysTarget: cardioDays ?? 0,
        cardioMinutesTarget: cardioMinutes ?? 0,
        habits: habits
          .filter((h) => h.on)
          .map((h) => ({
            name: h.name,
            icon: h.icon,
            kind: h.kind,
            weekdays: h.weekdays,
            targetValue: h.targetValue ?? null,
            unit: h.unit ?? null,
            required: h.required,
          })),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (!res.ok) return setError(res.error ?? "No se pudo guardar");
      setDone(true);
      setTimeout(() => {
        router.replace("/hoy");
        router.refresh();
      }, 1100);
    });
  }

  if (done) {
    return (
      <div className="animate-pop-in flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-[14px] bg-green-tint text-green">
          <svg viewBox="0 0 24 24" className="check-draw size-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 className="text-xl font-semibold">Perfil configurado</h1>
        <p className="text-sm text-ink-3">Tu racha empieza hoy, {name}.</p>
      </div>
    );
  }

  return (
    <>
      {step === 1 && (
        <WizardCard step={1} total={total} title="¿En qué unidad registras tu peso?" onNext={next} onSkip={next}>
          <div role="radiogroup" aria-label="Unidad de peso" className="flex flex-col gap-2">
            {(["kg", "lb"] as const).map((u) => (
              <ChoiceButton
                key={u}
                selected={unit === u}
                onClick={() => {
                  setUnit(u);
                  setTimeout(next, 180);
                }}
                title={u === "kg" ? "Kilogramos (kg)" : "Libras (lb)"}
              />
            ))}
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          step={2}
          total={total}
          title="¿Cuál es tu objetivo principal?"
          description="Solo sirve para dar contexto a la tendencia del peso. No afecta al cumplimiento."
          onNext={next}
          onSkip={() => {
            setGoal(null);
            next();
          }}
          onBack={back}
        >
          <div role="radiogroup" aria-label="Objetivo" className="flex flex-col gap-2">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
              <ChoiceButton
                key={g}
                selected={goal === g}
                icon={GOAL_EMOJI[g]}
                title={GOAL_LABELS[g]}
                onClick={() => {
                  setGoal(g);
                  if (g !== "lose_fat" && g !== "gain_muscle") setTimeout(next, 180);
                }}
              />
            ))}
          </div>
          {(goal === "lose_fat" || goal === "gain_muscle") && (
            <Field label={`Peso objetivo (opcional, ${unit})`} className="animate-fade-up mt-4">
              <NumberStepper label="Peso objetivo" value={targetWeight} onChange={setTargetWeight} step={0.5} decimals={1} min={20} max={400} suffix={unit} />
            </Field>
          )}
        </WizardCard>
      )}

      {step === 3 && (
        <WizardCard step={3} total={total} title="¿Cuántos días entrenas?" description="Los demás días serán descanso planificado: no rompen tu racha." onNext={next} onBack={back} nextDisabled={days.length === 0}>
          <div role="radiogroup" aria-label="Días por semana" className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={days.length === n}
                onClick={() => setDays(DEFAULT_DAYS[n])}
                className={cn(
                  "tabular h-14 rounded-[10px] text-lg font-semibold transition-colors",
                  days.length === n ? "bg-surface shadow-card" : "bg-field shadow-hairline text-ink-3 hover:text-ink",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mb-2 mt-6 text-xs font-medium text-ink-2">¿Qué días?</p>
          <WeekdayPicker value={days} onChange={setDays} label="Días de entrenamiento" />
        </WizardCard>
      )}

      {step === 4 && (
        <WizardCard step={4} total={total} title="Objetivo semanal de cardio" description="Puedes medirlo en días, minutos o ambos." onNext={next} onSkip={() => { setCardioDays(0); setCardioMinutes(0); next(); }} onBack={back}>
          <SegmentedControl
            label="Modo de cardio"
            stretch
            value={cardioMode}
            onChange={setCardioMode}
            options={[
              { value: "days", label: "Días" },
              { value: "minutes", label: "Minutos" },
              { value: "both", label: "Ambos" },
            ]}
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {cardioMode !== "minutes" && (
              <Field label="Días">
                <NumberStepper label="Días de cardio" value={cardioDays} onChange={setCardioDays} min={0} max={7} />
              </Field>
            )}
            {cardioMode !== "days" && (
              <Field label="Minutos">
                <NumberStepper label="Minutos de cardio" value={cardioMinutes} onChange={setCardioMinutes} step={10} min={0} max={2000} />
              </Field>
            )}
          </div>
        </WizardCard>
      )}

      {step === 5 && (
        <WizardCard
          step={5}
          total={total}
          title="Hábitos diarios"
          description="Un día cuenta para la racha cuando cumples todos los obligatorios programados."
          onNext={finish}
          onBack={back}
          nextLabel="Terminar"
          pending={pending}
        >
          <p className="mb-2 text-xs font-medium text-ink-3">Del grupo · obligatorios todos los días</p>
          <ul className="mb-4 flex flex-col divide-y divide-line rounded-[10px] bg-surface shadow-card">
            {GROUP_HABITS.map((h) => (
              <li key={h.key} className="flex items-center gap-3 px-3.5 py-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent-tint text-accent">
                  <HabitIcon name={h.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{h.name}</span>
                  <span className="block text-xs text-ink-3">Todos los días · {GROUP_HABIT_POINTS} pts en la liga</span>
                </span>
                <span className="rounded-md bg-orange-tint px-2 py-1 text-[11px] font-medium text-orange">Grupo</span>
              </li>
            ))}
          </ul>
          <p className="mb-2 text-xs font-medium text-ink-3">Tuyos</p>
          <ul className="flex flex-col divide-y divide-line rounded-[10px] bg-surface shadow-card">
            {habits.map((h, i) => (
              <li key={h.key} className="flex items-center gap-3 px-3.5 py-3">
                <span className={cn("flex size-8 items-center justify-center rounded-lg", h.on ? "bg-accent-tint text-accent" : "bg-field text-ink-3")}>
                  <HabitIcon name={h.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{h.name}</span>
                  <span className="block text-xs text-ink-3">{h.hint}</span>
                </span>
                {h.on && (
                  <button
                    type="button"
                    aria-pressed={h.required}
                    onClick={() => setHabits((list) => list.map((x, j) => (j === i ? { ...x, required: !x.required } : x)))}
                    className={cn("rounded-md px-2 py-1 text-[11px] font-medium", h.required ? "bg-orange-tint text-orange" : "bg-field text-ink-3")}
                  >
                    {h.required ? "Obligatorio" : "Opcional"}
                  </button>
                )}
                <Switch checked={h.on} label={`Activar ${h.name}`} onChange={(v) => setHabits((list) => list.map((x, j) => (j === i ? { ...x, on: v } : x)))} />
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-3">
            <Check className="size-3.5" /> Podrás editar, crear o desactivar hábitos cuando quieras.
          </p>
          {error && (
            <p role="alert" className="mt-3 text-[13px] text-red">
              {error}
            </p>
          )}
        </WizardCard>
      )}
    </>
  );
}
