-- ════════════════════════════════════════════════════════════════
-- Conexión de cada asesor con su Google Calendar (para crear asesorías con Meet).
-- El permiso de Google (refresh token) solo lo lee el servidor con la clave secreta;
-- desde la app nadie puede verlo.
-- ════════════════════════════════════════════════════════════════

create table public.google_conexiones (
  asesor_id uuid primary key references public.perfiles(id) on delete cascade,
  google_email text not null,
  refresh_token text not null,
  conectado_en timestamptz not null default now()
);
alter table public.google_conexiones enable row level security;
revoke all on public.google_conexiones from anon, authenticated;

-- ¿El asesor conectado ya vinculó su Google Calendar? (sin exponer el token)
create or replace function public.google_conectado() returns text
language sql stable security definer set search_path = public as $$
  select google_email from google_conexiones where asesor_id = auth.uid();
$$;
grant execute on function public.google_conectado to authenticated;
