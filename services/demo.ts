import "server-only";
import { addDays, isoWeekday, startOfWeek, todayInTimeZone } from "@/lib/dates";
import { round } from "@/lib/format";
import { db, unwrap } from "@/lib/server/supabase";
import { hashSecret } from "@/lib/server/crypto";

/** PRNG determinista para que los datos demo sean estables. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

interface DemoHabit {
  name: string;
  icon: string;
  kind: "check" | "quantity" | "weight" | "workout" | "cardio";
  required: boolean;
  weekdays: number[];
  target?: number;
  unit?: string;
}

const ALL = [1, 2, 3, 4, 5, 6, 7];

async function insertMany(table: string, rows: Record<string, unknown>[]) {
  for (let i = 0; i < rows.length; i += 500) {
    unwrap(await db().from(table).insert(rows.slice(i, i + 500)));
  }
}

async function createDemoProfile(opts: {
  name: string;
  color: string;
  emoji: string;
  pin?: string;
  days: number;
  seed: number;
  startWeight: number;
  drift: number;
  reliability: number;
  timezone: string;
  goal: string;
  workoutDays: number[];
}) {
  const client = db();
  const today = todayInTimeZone(opts.timezone);
  const start = addDays(today, -opts.days);
  const random = rng(opts.seed);

  const profile = unwrap(
    await client
      .from("profiles")
      .insert({
        name: opts.name,
        color: opts.color,
        avatar_emoji: opts.emoji,
        pin_hash: opts.pin ? await hashSecret(opts.pin) : null,
      })
      .select("id")
      .single(),
  ) as { id: string };
  const pid = profile.id;

  unwrap(
    await client.from("profile_settings").insert({
      profile_id: pid,
      timezone: opts.timezone,
      goal: opts.goal,
      workout_days: opts.workoutDays,
      onboarded: opts.days > 0,
    }),
  );

  if (opts.days === 0) return pid;

  unwrap(
    await client.from("weekly_goals").insert({
      profile_id: pid,
      week_start: startOfWeek(start),
      workout_sessions_target: opts.workoutDays.length,
      cardio_mode: "both",
      cardio_days_target: 3,
      cardio_minutes_target: 150,
    }),
  );

  const habitsDef: DemoHabit[] = [
    { name: "Registrar peso", icon: "scale", kind: "weight", required: true, weekdays: [1, 3, 5] },
    { name: "Entrenamiento", icon: "dumbbell", kind: "workout", required: true, weekdays: opts.workoutDays },
    { name: "Cardio", icon: "footprints", kind: "cardio", required: true, weekdays: [2, 4, 6], target: 30, unit: "min" },
    { name: "Agua", icon: "droplet", kind: "quantity", required: true, weekdays: ALL, target: 2.5, unit: "L" },
    { name: "Dormir 7 h", icon: "moon", kind: "check", required: false, weekdays: ALL },
    { name: "Leer 15 min", icon: "book-open", kind: "check", required: false, weekdays: [1, 2, 3, 4, 5] },
  ];

  const habitIds: Record<string, string> = {};
  for (const [i, h] of habitsDef.entries()) {
    const row = unwrap(
      await client
        .from("habits")
        .insert({ profile_id: pid, name: h.name, icon: h.icon, kind: h.kind, required: h.required, sort_order: i, start_date: start })
        .select("id")
        .single(),
    ) as { id: string };
    habitIds[h.name] = row.id;
    unwrap(
      await client.from("habit_schedules").insert(
        h.weekdays.map((weekday) => ({
          habit_id: row.id,
          profile_id: pid,
          weekday,
          target_value: h.target ?? null,
          unit: h.unit ?? null,
        })),
      ),
    );
  }

  const weights: Record<string, unknown>[] = [];
  const workouts: Record<string, unknown>[] = [];
  const cardio: Record<string, unknown>[] = [];
  const logs: Record<string, unknown>[] = [];
  const splits = ["Pecho / tríceps", "Espalda / bíceps", "Pierna", "Full body"];
  const cardioTypes = ["Caminar", "Bici", "Elíptica", "Correr"];
  let splitIndex = 0;

  for (let i = 0; i <= opts.days; i++) {
    const date = addDays(start, i);
    const wd = isoWeekday(date);
    const isToday = date === today;
    // Un par de días "malos" para que la racha tenga historia realista.
    const badDay = i === Math.floor(opts.days * 0.35) || (opts.days > 20 && i === Math.floor(opts.days * 0.12));
    // Las últimas ~3 semanas son constantes para que la demo muestre una racha viva.
    const good = () => !badDay && (i > opts.days - 20 || random() < opts.reliability);

    // Peso con ruido diario: la tendencia se ve en la media, no en el día.
    if ([1, 3, 5].includes(wd) || random() < 0.35) {
      if (!isToday || random() < 0.6) {
        const trend = opts.startWeight + opts.drift * (i / Math.max(1, opts.days));
        const noise = (random() - 0.5) * 0.9;
        weights.push({ profile_id: pid, date, time: "07:30", weight: round(trend + noise, 1), unit: "kg" });
      }
    }

    if (opts.workoutDays.includes(wd)) {
      if (!isToday && good()) {
        workouts.push({
          profile_id: pid,
          date,
          workout_type: splits[splitIndex++ % splits.length],
          duration_min: 45 + Math.round(random() * 30),
          is_rest: false,
        });
      } else if (!isToday && random() < 0.5 && !badDay) {
        workouts.push({ profile_id: pid, date, workout_type: "Descanso", is_rest: true, note: "Descanso planificado" });
      }
    }

    if ([2, 4, 6].includes(wd) || random() < 0.2) {
      if (good() || isToday) {
        const minutes = isToday ? 24 : 30 + Math.round(random() * 25);
        if (isToday) {
          cardio.push({ profile_id: pid, date, cardio_type: "Caminar", minutes: 14, distance_km: 1.2 });
          cardio.push({ profile_id: pid, date, cardio_type: "Bici", minutes: 10, distance_km: 3.5 });
        } else {
          cardio.push({
            profile_id: pid,
            date,
            cardio_type: cardioTypes[Math.floor(random() * cardioTypes.length)],
            minutes,
            distance_km: round(minutes * (0.08 + random() * 0.1), 1),
          });
        }
      }
    }

    const water = isToday ? 1.8 : good() ? 2.5 + round(random() * 0.6, 1) : round(1 + random(), 1);
    logs.push({ profile_id: pid, habit_id: habitIds["Agua"], date, value: water, status: water >= 2.5 ? "completed" : "in_progress", completed: water >= 2.5 });
    if (!isToday && random() < 0.75) {
      logs.push({ profile_id: pid, habit_id: habitIds["Dormir 7 h"], date, status: "completed", completed: true });
    }
    if (wd <= 5 && !isToday && random() < 0.6) {
      logs.push({ profile_id: pid, habit_id: habitIds["Leer 15 min"], date, status: "completed", completed: true });
    }
  }

  // Registrados "a su hora": la liga solo puntúa lo apuntado el mismo día o el siguiente.
  for (const row of [...weights, ...workouts, ...cardio, ...logs]) {
    const stamp = `${row.date as string}T12:00:00Z`;
    row.created_at = stamp;
    row.updated_at = stamp;
  }

  await insertMany("weight_entries", weights);
  await insertMany("workout_entries", workouts);
  await insertMany("cardio_entries", cardio);
  await insertMany("habit_logs", logs);
  unwrap(
    await client.from("notes").insert([
      { profile_id: pid, date: addDays(today, -3), body: "Buen entreno de pierna, subí peso en sentadilla." },
      { profile_id: pid, date: addDays(today, -9), body: "Semana con viaje: cardio caminando." },
    ]),
  );
  return pid;
}

/** Crea 3 perfiles demo: uno con ~6 semanas de historia, uno reciente y uno vacío (onboarding). */
export async function seedDemoProfiles(timezone: string) {
  await createDemoProfile({
    name: "Alex",
    color: "#7C8CFF",
    emoji: "🏋️",
    days: 45,
    seed: 7,
    startWeight: 78.6,
    drift: -2.1,
    reliability: 0.985,
    timezone,
    goal: "lose_fat",
    workoutDays: [1, 3, 5, 6],
  });
  await createDemoProfile({
    name: "Marta",
    color: "#5DBB8C",
    emoji: "🏃",
    pin: "1234",
    days: 12,
    seed: 21,
    startWeight: 61.2,
    drift: 0.2,
    reliability: 0.85,
    timezone,
    goal: "habits",
    workoutDays: [2, 4, 6],
  });
  await createDemoProfile({
    name: "Leo",
    color: "#E3A25C",
    emoji: "🦊",
    days: 0,
    seed: 3,
    startWeight: 0,
    drift: 0,
    reliability: 0,
    timezone,
    goal: "maintain",
    workoutDays: [1, 3, 5],
  });
}
