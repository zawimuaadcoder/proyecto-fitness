-- ============================================================================
-- Proyecto Fitness · esquema inicial
--
-- Modelo de acceso:
--   * La app NUNCA consulta la base de datos desde el navegador.
--   * Todas las lecturas/escrituras pasan por el servidor de Next.js, que valida
--     la sesión (contraseña de grupo + perfil desbloqueado) y usa la clave
--     secreta (service role) de Supabase, que nunca llega al cliente.
--   * RLS está activado en todas las tablas y se revocan los privilegios de los
--     roles anon/authenticated: aunque alguien obtenga la clave pública, no puede
--     leer ni escribir nada.
--
-- El script es idempotente: puede ejecutarse sobre una base que ya tenga la
-- tabla `profiles` del prototipo anterior.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Configuración global (hash de la contraseña de grupo, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.app_config (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Perfiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#7C8CFF',
  avatar_url text,
  pin_hash text,
  created_at timestamptz not null default now()
);

-- El prototipo permitía leer e insertar perfiles con la clave pública: se eliminan.
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Allow public insert profiles" on public.profiles;

alter table public.profiles add column if not exists avatar_emoji text;
alter table public.profiles add column if not exists pin_failed_attempts integer not null default 0;
alter table public.profiles add column if not exists pin_locked_until timestamptz;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.profile_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  timezone text not null default 'Europe/Madrid',
  goal text check (goal in ('lose_fat', 'gain_muscle', 'maintain', 'habits', 'other')),
  target_weight numeric(6, 2),
  workout_days smallint[] not null default '{1,3,5}',
  habits_goal_percent smallint not null default 85 check (habits_goal_percent between 0 and 100),
  weight_habits smallint not null default 40 check (weight_habits between 0 and 100),
  weight_workouts smallint not null default 30 check (weight_workouts between 0 and 100),
  weight_cardio smallint not null default 30 check (weight_cardio between 0 and 100),
  onboarded boolean not null default false,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  streak_updated_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tipos personalizados de entrenamiento/cardio (los tipos base viven en el código)
create table if not exists public.entry_types (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('workout', 'cardio')),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, category, name)
);

-- ---------------------------------------------------------------------------
-- Registros
-- ---------------------------------------------------------------------------
create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  time time,
  weight numeric(6, 2) not null check (weight > 0 and weight < 1000),
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists weight_entries_profile_date on public.weight_entries (profile_id, date desc);

create table if not exists public.workout_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  workout_type text not null,
  is_rest boolean not null default false,
  duration_min integer check (duration_min is null or (duration_min >= 0 and duration_min <= 1440)),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workout_entries_profile_date on public.workout_entries (profile_id, date desc);

create table if not exists public.cardio_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  cardio_type text not null,
  minutes integer not null check (minutes > 0 and minutes <= 1440),
  distance_km numeric(7, 2) check (distance_km is null or distance_km >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cardio_entries_profile_date on public.cardio_entries (profile_id, date desc);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_profile_date on public.notes (profile_id, date desc);

-- ---------------------------------------------------------------------------
-- Hábitos
--   kind:
--     check     → sí/no manual
--     quantity  → valor numérico con objetivo (agua 2,5 L)
--     weight    → se completa al registrar peso ese día
--     workout   → se completa con un entrenamiento (descanso = día excusado)
--     cardio    → se completa al llegar a X minutos de cardio
-- ---------------------------------------------------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  icon text not null default 'check',
  kind text not null default 'check' check (kind in ('check', 'quantity', 'weight', 'workout', 'cardio')),
  required boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  start_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists habits_profile on public.habits (profile_id, sort_order);

-- Un registro por día de la semana programado (1 = lunes … 7 = domingo)
create table if not exists public.habit_schedules (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  target_value numeric(8, 2),
  unit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, weekday)
);
create index if not exists habit_schedules_profile on public.habit_schedules (profile_id);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  value numeric(8, 2),
  status text not null default 'completed' check (status in ('completed', 'in_progress', 'skipped')),
  completed boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, date)
);
create index if not exists habit_logs_profile_date on public.habit_logs (profile_id, date desc);

-- ---------------------------------------------------------------------------
-- Objetivos y cierres semanales (semana = lunes → domingo)
-- weekly_goals es un historial: la meta vigente para una semana es la fila con
-- el mayor week_start <= semana.
-- ---------------------------------------------------------------------------
create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  workout_sessions_target smallint not null default 3 check (workout_sessions_target between 0 and 14),
  cardio_mode text not null default 'both' check (cardio_mode in ('days', 'minutes', 'both')),
  cardio_days_target smallint not null default 3 check (cardio_days_target between 0 and 7),
  cardio_minutes_target integer not null default 150 check (cardio_minutes_target between 0 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, week_start)
);

create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  adherence_percent smallint not null,
  habits_percent smallint,
  workout_count smallint not null default 0,
  workout_target smallint not null default 0,
  cardio_days smallint not null default 0,
  cardio_days_target smallint not null default 0,
  cardio_minutes integer not null default 0,
  cardio_minutes_target integer not null default 0,
  avg_weight numeric(6, 2),
  weight_unit text,
  completed_days smallint not null default 0,
  streak_at_end integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, week_start)
);

-- Hitos de racha (para celebrar solo una vez y conservar historia)
create table if not exists public.streak_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  kind text not null check (kind in ('milestone', 'record', 'perfect_day', 'perfect_week')),
  value integer not null default 0,
  seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, kind, date, value)
);

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'app_config', 'profiles', 'profile_settings', 'entry_types', 'weight_entries',
    'workout_entries', 'cardio_entries', 'notes', 'habits', 'habit_schedules',
    'habit_logs', 'weekly_goals', 'weekly_summaries', 'streak_events'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
    -- Seguridad: RLS activo y sin acceso para los roles públicos.
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end;
$$;
