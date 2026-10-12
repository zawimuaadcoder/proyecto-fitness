-- ============================================================================
-- Hábitos de grupo: Fajr, Entrenar y Leer Corán
--
-- Obligatorios para todos los perfiles, todos los días, en ese orden y
-- bloqueados (la app no deja editarlos, desactivarlos ni borrarlos). En la liga
-- valen 3 puntos cada uno, fuera del tope diario (lib/domain/points.ts).
--
-- habits.group_key identifica el hábito de grupo (null = hábito personal). La
-- lista vive en lib/domain/group-habits.ts; los perfiles nuevos los reciben al
-- terminar el onboarding (services/habits.ts → ensureGroupHabits).
--
-- Alta de los perfiles existentes:
--   * se reutilizan los hábitos que ya existan con ese nombre (Fajr, Quran…) y
--     el hábito de entreno propio, para no duplicarlos ni perder registros;
--   * empiezan a contar hoy (zona horaria del perfil): no reescriben el pasado.
--
-- Idempotente, como el resto de migraciones. Sin bloques DO: cada sentencia se
-- puede ejecutar por separado (el conector de Supabase se cuelga con ellos).
-- ============================================================================

alter table public.habits add column if not exists group_key text;

create unique index if not exists habits_profile_group_key
  on public.habits (profile_id, group_key) where group_key is not null;

-- 1) Reutilizar el hábito equivalente que ya tenga cada perfil.
with g(key, name, icon, kind, patterns) as (values
  ('fajr', 'Fajr', 'sunrise', 'check', array['%fajr%']),
  ('workout', 'Entrenar', 'dumbbell', 'workout', array['%']),
  ('quran', 'Leer Corán', 'book-open', 'check', array['%quran%', '%corán%', '%coran%', '%qur''an%'])
), pick as (
  select distinct on (h.profile_id, g.key) h.id, g.key, g.name, g.icon,
    (now() at time zone coalesce(s.timezone, 'Europe/Madrid'))::date as today
  from g
  join public.habits h on h.kind = g.kind and h.group_key is null and h.name ilike any (g.patterns)
  left join public.profile_settings s on s.profile_id = h.profile_id
  where not exists (select 1 from public.habits x where x.profile_id = h.profile_id and x.group_key = g.key)
  order by h.profile_id, g.key, h.active desc, h.sort_order, h.created_at
)
update public.habits h
set name = pick.name, icon = pick.icon, required = true, active = true, group_key = pick.key,
    start_date = greatest(h.start_date, pick.today)
from pick where h.id = pick.id;

-- 2) Crear los que falten (empiezan hoy en la zona horaria del perfil).
with g(key, name, icon, kind) as (values
  ('fajr', 'Fajr', 'sunrise', 'check'),
  ('workout', 'Entrenar', 'dumbbell', 'workout'),
  ('quran', 'Leer Corán', 'book-open', 'check')
)
insert into public.habits (profile_id, name, icon, kind, required, active, start_date, group_key)
select p.id, g.name, g.icon, g.kind, true, true, (now() at time zone coalesce(s.timezone, 'Europe/Madrid'))::date, g.key
from public.profiles p
cross join g
left join public.profile_settings s on s.profile_id = p.id
where not exists (select 1 from public.habits x where x.profile_id = p.id and x.group_key = g.key);

-- 3) Todos los días de la semana.
insert into public.habit_schedules (habit_id, profile_id, weekday)
select h.id, h.profile_id, d from public.habits h cross join generate_series(1, 7) d
where h.group_key is not null
on conflict (habit_id, weekday) do nothing;

-- 4) Los primeros y en su orden, sin tocar el orden de los hábitos personales.
update public.habits
set sort_order = case group_key when 'fajr' then -3 when 'workout' then -2 else -1 end
where group_key in ('fajr', 'workout', 'quran');
