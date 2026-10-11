-- ============================================================================
-- Limitador de intentos de autenticación (PIN de perfil y contraseña de grupo)
--
-- auth_throttle_attempt() registra el intento ANTES de verificar el secreto y
-- bloquea la fila durante la transacción (insert … on conflict do update), de
-- modo que las peticiones concurrentes se serializan: no se puede esquivar el
-- límite lanzando cientos de intentos en paralelo.
-- Devuelve los intentos restantes tras este, o -1 si la clave está bloqueada.
-- ============================================================================

create table if not exists public.auth_throttle (
  key text primary key,
  failures integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.auth_throttle enable row level security;
revoke all on public.auth_throttle from anon, authenticated;

create or replace function public.auth_throttle_attempt(p_key text, p_max integer, p_lock_seconds integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  r public.auth_throttle%rowtype;
begin
  insert into public.auth_throttle as t (key) values (p_key)
  on conflict (key) do update set updated_at = now()
  returning * into r;

  if r.locked_until is not null and r.locked_until > now() then
    return -1;
  end if;

  if r.locked_until is not null then
    r.failures := 0; -- el bloqueo anterior ya expiró
  end if;
  r.failures := r.failures + 1;

  if r.failures >= p_max then
    update public.auth_throttle
       set failures = 0, locked_until = now() + make_interval(secs => p_lock_seconds), updated_at = now()
     where key = p_key;
    return 0;
  end if;

  update public.auth_throttle
     set failures = r.failures, locked_until = null, updated_at = now()
   where key = p_key;
  return p_max - r.failures;
end;
$$;

create or replace function public.auth_throttle_reset(p_key text)
returns void
language sql
set search_path = ''
as $$
  delete from public.auth_throttle where key = p_key;
$$;

revoke all on function public.auth_throttle_attempt(text, integer, integer) from public, anon, authenticated;
revoke all on function public.auth_throttle_reset(text) from public, anon, authenticated;
grant execute on function public.auth_throttle_attempt(text, integer, integer) to service_role;
grant execute on function public.auth_throttle_reset(text) to service_role;
