"use client";

import { Globe, Moon, Ruler, Sun, Monitor } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, NumberStepper, Select } from "@/components/ui/Inputs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { GOAL_LABELS, LOCAL_PREFS } from "@/lib/constants";
import { useLocalPref } from "@/hooks/useLocalPref";
import { useAction } from "@/features/offline/useMutation";
import type { Goal, WeightUnit } from "@/types/db";
import { saveSettings } from "./actions";
import { EditedBadge, useEditState } from "./GoalsCard";

const ZONES = [
  "Europe/Madrid",
  "Atlantic/Canary",
  "Europe/London",
  "Europe/Lisbon",
  "Europe/Paris",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

/** Unidad, zona horaria y objetivo (contexto del peso). */
export function PreferencesCard({
  unit,
  timezone,
  goal,
  targetWeight,
}: {
  unit: WeightUnit;
  timezone: string;
  goal: Goal | null;
  targetWeight: number | null;
}) {
  const edit = useEditState({ unit, timezone, goal, targetWeight });
  const { run, pending } = useAction();
  const v = edit.value;
  const zones = ZONES.includes(timezone) ? ZONES : [timezone, ...ZONES];

  return (
    <Card>
      <CardHeader icon={<Ruler />} title="Preferencias" action={<EditedBadge state={edit.state} />} />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-ink-2">Unidad de peso</span>
          <SegmentedControl<WeightUnit>
            label="Unidad de peso"
            size="sm"
            value={v.unit}
            onChange={(u) => edit.setValue({ ...v, unit: u })}
            options={[
              { value: "kg", label: "kg" },
              { value: "lb", label: "lb" },
            ]}
          />
        </div>
        <Field label="Zona horaria (define cuándo empieza tu día)" htmlFor="tz">
          <div className="flex gap-2">
            <Select id="tz" value={v.timezone} onChange={(e) => edit.setValue({ ...v, timezone: e.target.value })}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
            <Button
              variant="secondary"
              icon={<Globe />}
              aria-label="Usar zona horaria de este dispositivo"
              onClick={() => edit.setValue({ ...v, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
            >
              <span className="hidden sm:inline">Detectar</span>
            </Button>
          </div>
        </Field>
        <Field label="Objetivo principal (contexto para el peso)" htmlFor="goal">
          <Select id="goal" value={v.goal ?? ""} onChange={(e) => edit.setValue({ ...v, goal: (e.target.value || null) as Goal | null })}>
            <option value="">Sin objetivo (peso neutral)</option>
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
              <option key={g} value={g}>
                {GOAL_LABELS[g]}
              </option>
            ))}
          </Select>
        </Field>
        {(v.goal === "lose_fat" || v.goal === "gain_muscle") && (
          <Field label={`Peso objetivo (${v.unit}, opcional)`}>
            <NumberStepper label="Peso objetivo" value={v.targetWeight} onChange={(n) => edit.setValue({ ...v, targetWeight: n })} step={0.5} decimals={1} min={0} max={400} suffix={v.unit} />
          </Field>
        )}
        {edit.dirty && (
          <div className="animate-fade-up flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={edit.reset}>
              Descartar
            </Button>
            <Button
              size="sm"
              variant="primary"
              loading={pending}
              onClick={async () => {
                const res = await run(
                  () =>
                    saveSettings({
                      weight_unit: v.unit,
                      timezone: v.timezone,
                      goal: v.goal,
                      target_weight: v.targetWeight || null,
                    }),
                  false,
                );
                if (res.ok) edit.markSaved();
              }}
            >
              Guardar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

/** Tema visual (preferencia local de este dispositivo). */
export function ThemeCard() {
  const [theme, setTheme] = useLocalPref<"dark" | "light" | "system">(LOCAL_PREFS.theme, "dark");
  useEffect(() => {
    const apply = () => {
      const t = theme === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : theme;
      document.documentElement.dataset.theme = t;
    };
    apply();
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-2">Apariencia</p>
          <p className="text-xs text-ink-3">Solo en este dispositivo</p>
        </div>
        <SegmentedControl
          label="Tema"
          size="sm"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "dark", label: <Moon />, ariaLabel: "Oscuro" },
            { value: "light", label: <Sun />, ariaLabel: "Claro" },
            { value: "system", label: <Monitor />, ariaLabel: "Sistema" },
          ]}
        />
      </div>
    </Card>
  );
}
