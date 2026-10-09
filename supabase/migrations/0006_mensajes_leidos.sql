-- Avisos de mensajes nuevos: cada mensaje sabe si ya lo leyó quien lo recibe.
-- · El cliente ve como "nuevos" los mensajes de su asesor que aún no abre.
-- · El asesor ve como "nuevos" los mensajes de sus clientes (o de clientes sin asesor) que aún no abre.

alter table public.mensajes add column if not exists leido_en timestamptz;
create index if not exists mensajes_sin_leer_idx on public.mensajes (cliente_id) where leido_en is null;

-- ¿Este mensaje es "para mí"? (lo recibo yo y no lo escribí yo)
create or replace function public.mensaje_para_mi(p_cliente uuid, p_autor uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when p_cliente = auth.uid() then p_autor <> auth.uid()
    when public.es_asesor() then p_autor = p_cliente and exists (
      select 1 from perfiles p where p.id = p_cliente and (p.asesor_id = auth.uid() or p.asesor_id is null))
    else false
  end;
$$;

-- Cuántos mensajes sin leer tengo, por cliente.
create or replace function public.mensajes_sin_leer() returns table (cliente_id uuid, n int)
language sql stable security definer set search_path = public as $$
  select m.cliente_id, count(*)::int
  from mensajes m
  where m.leido_en is null and public.mensaje_para_mi(m.cliente_id, m.autor_id)
  group by m.cliente_id;
$$;

-- Al abrir la conversación, los mensajes recibidos quedan leídos.
create or replace function public.marcar_mensajes_leidos(p_cliente uuid) returns void
language sql security definer set search_path = public as $$
  update mensajes set leido_en = now()
  where cliente_id = p_cliente and leido_en is null and public.mensaje_para_mi(cliente_id, autor_id);
$$;

revoke execute on function public.mensaje_para_mi, public.mensajes_sin_leer, public.marcar_mensajes_leidos from public, anon;
grant execute on function public.mensaje_para_mi, public.mensajes_sin_leer, public.marcar_mensajes_leidos to authenticated;

-- Avisos al instante: la app escucha los mensajes nuevos (respeta las mismas reglas de quién ve qué).
do $$ begin
  alter publication supabase_realtime add table public.mensajes;
exception when duplicate_object then null;
end $$;
