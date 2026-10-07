-- Contenido editable del programa de 4 sesiones (láminas con link, relato, preguntas…).
-- Lo leen todos los asesores; lo editan solo los correos de editores_programa.

create table public.editores_programa (email text primary key);
insert into public.editores_programa (email) values ('catalina@viel.cl'), ('sviel@viel.cl');
alter table public.editores_programa enable row level security;
revoke all on public.editores_programa from anon, authenticated;

create table public.programa_sesiones (
  n int primary key check (n between 1 and 4),
  data jsonb not null,
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references public.perfiles(id) on delete set null default auth.uid()
);
alter table public.programa_sesiones enable row level security;

create or replace function public.puede_editar_programa() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles p join editores_programa e on e.email = lower(p.email)
    where p.id = auth.uid() and p.rol = 'asesor'
  );
$$;
grant execute on function public.puede_editar_programa to authenticated;

create policy "asesores leen el programa" on public.programa_sesiones for select to authenticated
  using (public.es_asesor());
create policy "editores crean" on public.programa_sesiones for insert to authenticated
  with check (public.puede_editar_programa());
create policy "editores editan" on public.programa_sesiones for update to authenticated
  using (public.puede_editar_programa()) with check (public.puede_editar_programa());
grant select, insert, update on public.programa_sesiones to authenticated;
