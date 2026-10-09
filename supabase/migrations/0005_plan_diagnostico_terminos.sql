-- Plan del cliente (diagnóstico gratis → Programa VIIGO pagado), sesión de diagnóstico (n = 0)
-- y aceptación de términos y condiciones.

alter table public.perfiles
  add column if not exists plan text not null default 'diagnostico' check (plan in ('diagnostico', 'programa')),
  add column if not exists terminos_version text,
  add column if not exists terminos_aceptados_en timestamptz;

-- La sesión 0 es el diagnóstico.
alter table public.reuniones drop constraint if exists reuniones_sesion_check;
alter table public.reuniones add constraint reuniones_sesion_check check (sesion between 0 and 4);
alter table public.programa_sesiones drop constraint if exists programa_sesiones_n_check;
alter table public.programa_sesiones add constraint programa_sesiones_n_check check (n between 0 and 4);

-- Solo un asesor cambia el plan; nadie se cambia el rol ni el correo.
create or replace function public.proteger_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.rol is distinct from old.rol or new.email is distinct from old.email then
    raise exception 'No se puede cambiar el rol ni el correo';
  end if;
  if new.asesor_id is distinct from old.asesor_id and not public.es_asesor() then
    raise exception 'Solo un asesor puede asignar asesor';
  end if;
  if new.plan is distinct from old.plan and not public.es_asesor() then
    raise exception 'Solo un asesor puede cambiar el plan';
  end if;
  return new;
end $$;
