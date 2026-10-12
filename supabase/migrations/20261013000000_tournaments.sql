-- ============================================================================
-- Torneos especiales (Winter Arc, Ramadán…) y palmarés
--
-- Los torneos y sus retos viven en código (lib/domain/tournaments.ts) y los
-- puntos se calculan siempre desde el historial. Aquí solo hace falta:
--   * habits.end_date        → hábitos de evento (Ayuno, Taraweeh…) que solo
--                              se programan durante el torneo. Se crean solos
--                              (services/tournaments.ts → ensureEventHabits)
--                              con group_key «evento:<torneo>:<clave>».
--   * tournament_trophies     → podio de cada torneo (1 campeón, 2 subcampeón,
--                              3 bronce) para el palmarés.
--
-- Idempotente y sin bloques DO: cada sentencia se puede ejecutar por separado.
-- ============================================================================

alter table public.habits add column if not exists end_date date;

create table if not exists public.tournament_trophies (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  place smallint not null check (place between 1 and 3),
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, profile_id)
);
create index if not exists tournament_trophies_profile on public.tournament_trophies (profile_id);

drop trigger if exists set_updated_at on public.tournament_trophies;
create trigger set_updated_at before update on public.tournament_trophies
  for each row execute function public.set_updated_at();

-- Seguridad: RLS activo y sin acceso para los roles públicos.
alter table public.tournament_trophies enable row level security;
revoke all on public.tournament_trophies from anon, authenticated;
