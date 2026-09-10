-- =====================================================================
-- 0004_google_translate_usage.sql — Infraestructura TEMPORAL
--
-- Existe únicamente mientras la opción "Google Translate" del traductor
-- esté activa (la materia dura 1 mes). Ver docs/IA.md §Google Translate.
--
-- AL TERMINAR LA MATERIA, ejecutar en orden:
--   1. npx supabase secrets unset GOOGLE_TRANSLATE_API_KEY
--   2. Revocar/eliminar la API key en Google Cloud Console
--   3. DROP TABLE public.google_translate_usage;
-- =====================================================================

create table public.google_translate_usage (
  usage_month      date primary key,   -- primer día del mes, ej. 2026-10-01
  characters_used  integer not null default 0,
  updated_at       timestamptz not null default now()
);

comment on table public.google_translate_usage is
  'TEMPORAL. Cuenta caracteres enviados a Google Translate para no superar el '
  'tope gratuito de 500,000/mes de Google Cloud. Se borra al terminar la materia.';

alter table public.google_translate_usage enable row level security;
-- Sin políticas para 'authenticated' a propósito: solo la Edge Function
-- (con service_role) lee y escribe esta tabla. El cliente no debe verla.

-- Función que la Edge Function llama para reservar caracteres antes de traducir.
-- Devuelve false si el mes ya alcanzó el tope (deja margen bajo el límite real
-- de Google: 400,000 en vez de 500,000, para no rozar el borde).
create or replace function public.reserve_google_translate_chars(p_chars integer)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_month date := date_trunc('month', now())::date;
  v_used  integer;
begin
  insert into public.google_translate_usage (usage_month, characters_used)
  values (v_month, 0)
  on conflict (usage_month) do nothing;

  select characters_used into v_used
    from public.google_translate_usage
   where usage_month = v_month
     for update;

  if v_used + p_chars > 400000 then
    return false;
  end if;

  update public.google_translate_usage
     set characters_used = characters_used + p_chars,
         updated_at = now()
   where usage_month = v_month;

  return true;
end;
$$;

revoke all on function public.reserve_google_translate_chars(integer) from public, anon, authenticated;
-- Solo se ejecuta con service_role, desde la Edge Function `translate` con engine='google'.
