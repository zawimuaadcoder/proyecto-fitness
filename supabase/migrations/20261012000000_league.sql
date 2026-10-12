-- ============================================================================
-- Liga mensual entre amigos
--
-- Los puntos NO se guardan: se calculan siempre desde el historial
-- (lib/domain/points.ts). Aquí solo hace falta:
--   * profile_settings.league_opt_in → "Participar en la liga" (por defecto sí)
--   * created_at en los registros   → antitrampas (solo puntúa lo registrado
--                                     para hoy o ayer). Ya existía en el
--                                     esquema inicial; se asegura por si la
--                                     base viene de una versión anterior.
--   * league_titles                  → histórico de campeones por mes.
--
-- Idempotente, como el resto de migraciones.
-- ============================================================================

alter table public.profile_settings add column if not exists league_opt_in boolean not null default true;

alter table public.workout_entries add column if not exists created_at timestamptz not null default now();
alter table public.cardio_entries add column if not exists created_at timestamptz not null default now();
alter table public.weight_entries add column if not exists created_at timestamptz not null default now();
alter table public.habit_logs add column if not exists created_at timestamptz not null default now();
alter table public.habit_logs add column if not exists updated_at timestamptz not null default now();

-- Campeones de cada mes (month = día 1 del mes). Puede haber cotitulares si
-- empatan en puntos y en cumplimiento medio.
create table if not exists public.league_titles (
  id uuid primary key default gen_random_uuid(),
  month date not null check (extract(day from month) = 1),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  adherence smallint not null default 0 check (adherence between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (month, profile_id)
);
create index if not exists league_titles_profile on public.league_titles (profile_id);

drop trigger if exists set_updated_at on public.league_titles;
create trigger set_updated_at before update on public.league_titles
  for each row execute function public.set_updated_at();

-- Seguridad: RLS activo y sin acceso para los roles públicos.
alter table public.league_titles enable row level security;
revoke all on public.league_titles from anon, authenticated;
