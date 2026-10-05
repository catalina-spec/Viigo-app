-- ════════════════════════════════════════════════════════════════
-- Mi Ruta VIIGO · Base de datos inicial
-- Tablas, permisos (RLS) y alta automática de usuarios.
-- ════════════════════════════════════════════════════════════════

-- ───────── Asesores autorizados ─────────
-- Quien entra con uno de estos correos queda como asesor; el resto, como cliente.
create table public.asesores_permitidos (
  email text primary key
);
insert into public.asesores_permitidos (email) values
  ('catalina@viel.cl'), ('sviel@viel.cl'), ('soporte@viel.cl'), ('dante@viel.cl'), ('raimundo@viel.cl');

-- ───────── Perfiles (clientes y asesores) ─────────
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  rol text not null default 'cliente' check (rol in ('cliente', 'asesor')),
  email text not null,
  nombre text not null default '',
  apellido text not null default '',
  celular text not null default '',
  whatsapp text not null default '',
  cargo text not null default '',                    -- asesores: "Asesor VIIGO · Viel.cl"
  foto_url text,
  edad int check (edad between 18 and 90),
  edad_retiro int not null default 65 check (edad_retiro between 50 and 80),
  etapa text not null default 'start' check (etapa in ('start', 'grow', 'equity', 'legacy')),
  asesor_id uuid references public.perfiles(id) on delete set null,  -- clientes: su asesor
  creado_en timestamptz not null default now()
);

-- Datos sensibles del cliente: el asesor solo los ve con permiso vigente.
create table public.datos_privados (
  cliente_id uuid primary key references public.perfiles(id) on delete cascade,
  ingreso_jubilacion numeric,
  saldo_afp numeric,
  actualizado_en timestamptz not null default now()
);

-- Matriz de Análisis Financiero VIIGO
create table public.planillas (
  cliente_id uuid primary key references public.perfiles(id) on delete cascade,
  valores jsonb not null default '{}'::jsonb,   -- { cc: 1200000, dap: 18000000, ... }
  deudas jsonb not null default '[]'::jsonb,    -- [{ tipo, inst, orig, saldo, cuota, tasa, plazo, rest }]
  actualizado_en timestamptz not null default now()
);

-- Permiso del cliente para que su asesor vea la planilla
create table public.permisos_planilla (
  cliente_id uuid primary key references public.perfiles(id) on delete cascade,
  asesor_id uuid not null references public.perfiles(id) on delete cascade,
  hasta timestamptz,                            -- null = hasta que el cliente lo quite
  revocado_en timestamptz,
  otorgado_en timestamptz not null default now()
);

-- Registro de accesos y cambios de la planilla (lo ve el cliente)
create table public.registro_accesos (
  id bigint generated always as identity primary key,
  cliente_id uuid not null references public.perfiles(id) on delete cascade,
  texto text not null,
  creado_en timestamptz not null default now()
);

-- Ruta aceptada en la calculadora VIIGO
create table public.rutas (
  cliente_id uuid primary key references public.perfiles(id) on delete cascade,
  parametros jsonb not null,                    -- { precio, pie, tasa, plazo, edad }
  resultado jsonb not null,
  aceptada_en timestamptz not null default now()
);

-- Propiedades que el cliente guarda o el asesor sugiere
create table public.alternativas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.perfiles(id) on delete cascade,
  origen text not null check (origen in ('cliente', 'asesor')),
  nombre text not null,
  comuna text not null default '',
  tipo text not null default 'Departamento',
  precio_uf numeric not null default 0,
  m2 numeric,
  arriendo numeric,
  puntaje int,                                  -- Evaluador VIIGO (null = sin evaluar)
  nota text not null default '',
  creado_por uuid references public.perfiles(id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now()
);

-- Objetivos y pendientes (el cliente solo ve los activos)
create table public.objetivos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.perfiles(id) on delete cascade,
  texto text not null,
  origen text not null default '',              -- "Asesoría del 2 sep"
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create table public.pendientes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.perfiles(id) on delete cascade,
  texto text not null,
  responsable text not null default 'cliente' check (responsable in ('cliente', 'asesor')),
  hecho boolean not null default false,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- Asesorías (Google Calendar + Meet). estado: agendada → revision → aprobada
create table public.reuniones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.perfiles(id) on delete cascade,
  asesor_id uuid references public.perfiles(id) on delete set null,
  sesion int check (sesion between 1 and 4),
  titulo text not null default '',
  inicio timestamptz not null,
  duracion_min int,
  meet_url text,
  calendar_event_id text,
  estado text not null default 'agendada' check (estado in ('agendada', 'revision', 'aprobada', 'cancelada')),
  transcripcion text,                            -- solo asesor
  resumen text,
  objetivos text[] not null default '{}',
  acuerdos text[] not null default '{}',
  proxima text,
  creado_en timestamptz not null default now()
);

-- Mensajes entre cliente y asesor
create table public.mensajes (
  id bigint generated always as identity primary key,
  cliente_id uuid not null references public.perfiles(id) on delete cascade,
  autor_id uuid not null references public.perfiles(id) on delete cascade default auth.uid(),
  texto text not null check (length(texto) between 1 and 4000),
  creado_en timestamptz not null default now()
);

create index on public.perfiles (asesor_id);
create index on public.alternativas (cliente_id);
create index on public.objetivos (cliente_id);
create index on public.pendientes (cliente_id);
create index on public.reuniones (cliente_id, inicio);
create index on public.reuniones (asesor_id, inicio);
create index on public.mensajes (cliente_id, creado_en);
create index on public.registro_accesos (cliente_id, creado_en);

-- ════════════════ Funciones de apoyo ════════════════
create or replace function public.es_asesor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'asesor');
$$;

-- Asesor del usuario actual (evita que la política de perfiles se consulte a sí misma).
create or replace function public.mi_asesor() returns uuid
language sql stable security definer set search_path = public as $$
  select asesor_id from perfiles where id = auth.uid();
$$;

-- ¿El asesor actual tiene permiso vigente para ver la planilla de este cliente?
create or replace function public.puede_ver_planilla(cliente uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from permisos_planilla p
    where p.cliente_id = cliente and p.asesor_id = auth.uid()
      and p.revocado_en is null and (p.hasta is null or p.hasta > now())
  );
$$;

-- El asesor deja constancia cada vez que abre una planilla (el cliente lo ve).
create or replace function public.registrar_vista_planilla(cliente uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.puede_ver_planilla(cliente) then
    raise exception 'Sin permiso para ver esta planilla';
  end if;
  insert into registro_accesos (cliente_id, texto)
  select cliente, trim(nombre || ' ' || apellido) || ' abrió tu planilla.' from perfiles where id = auth.uid();
end $$;

-- Alta automática: al crearse un usuario se crea su perfil con el rol que corresponde.
-- Los clientes nuevos quedan asignados por defecto a Catalina (o a Sebastián si ella aún no tiene cuenta).
create or replace function public.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  soy_asesor boolean := exists (select 1 from asesores_permitidos a where a.email = lower(new.email));
  asesor uuid;
begin
  if not soy_asesor then
    select id into asesor from perfiles
    where email in ('catalina@viel.cl', 'sviel@viel.cl')
    order by (email = 'catalina@viel.cl') desc limit 1;
  end if;
  insert into perfiles (id, email, rol, asesor_id)
  values (new.id, lower(new.email), case when soy_asesor then 'asesor' else 'cliente' end, asesor);
  return new;
end $$;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.nuevo_usuario();

-- Nadie puede cambiarse el rol a sí mismo; solo un asesor asigna asesor a un cliente.
create or replace function public.proteger_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.rol is distinct from old.rol or new.email is distinct from old.email then
    raise exception 'No se puede cambiar el rol ni el correo';
  end if;
  if new.asesor_id is distinct from old.asesor_id and not public.es_asesor() then
    raise exception 'Solo un asesor puede asignar asesor';
  end if;
  return new;
end $$;
create trigger proteger_perfil before update on public.perfiles
  for each row execute function public.proteger_perfil();

-- ════════════════ Seguridad por fila (RLS) ════════════════
alter table public.asesores_permitidos enable row level security;
alter table public.perfiles            enable row level security;
alter table public.datos_privados      enable row level security;
alter table public.planillas           enable row level security;
alter table public.permisos_planilla   enable row level security;
alter table public.registro_accesos    enable row level security;
alter table public.rutas               enable row level security;
alter table public.alternativas        enable row level security;
alter table public.objetivos           enable row level security;
alter table public.pendientes          enable row level security;
alter table public.reuniones           enable row level security;
alter table public.mensajes            enable row level security;

-- asesores_permitidos: sin políticas → nadie la lee ni la cambia desde la app.

-- perfiles: cada uno ve el suyo; el cliente ve a su asesor; los asesores ven a todos.
create policy "ver perfiles" on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_asesor()
         or id = public.mi_asesor() or rol = 'asesor');
create policy "editar mi perfil" on public.perfiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "asesor asigna clientes" on public.perfiles for update to authenticated
  using (public.es_asesor() and rol = 'cliente') with check (public.es_asesor() and rol = 'cliente');

-- datos privados y planilla: dueño total; asesor solo lectura con permiso vigente.
create policy "dueño datos privados" on public.datos_privados for all to authenticated
  using (cliente_id = auth.uid()) with check (cliente_id = auth.uid());
create policy "asesor ve datos privados" on public.datos_privados for select to authenticated
  using (public.puede_ver_planilla(cliente_id));
create policy "dueño planilla" on public.planillas for all to authenticated
  using (cliente_id = auth.uid()) with check (cliente_id = auth.uid());
create policy "asesor ve planilla" on public.planillas for select to authenticated
  using (public.puede_ver_planilla(cliente_id));

-- permisos: el cliente los da y los quita; el asesor ve si tiene permiso.
create policy "cliente gestiona permiso" on public.permisos_planilla for all to authenticated
  using (cliente_id = auth.uid()) with check (cliente_id = auth.uid());
create policy "asesor ve su permiso" on public.permisos_planilla for select to authenticated
  using (asesor_id = auth.uid());

-- registro de accesos: el cliente lo ve y agrega sus propios eventos.
create policy "cliente ve registro" on public.registro_accesos for select to authenticated
  using (cliente_id = auth.uid());
create policy "cliente registra" on public.registro_accesos for insert to authenticated
  with check (cliente_id = auth.uid());

-- ruta: el cliente la acepta; los asesores la ven.
create policy "cliente gestiona ruta" on public.rutas for all to authenticated
  using (cliente_id = auth.uid()) with check (cliente_id = auth.uid());
create policy "asesor ve ruta" on public.rutas for select to authenticated
  using (public.es_asesor());

-- alternativas
create policy "cliente ve alternativas" on public.alternativas for select to authenticated
  using (cliente_id = auth.uid());
create policy "cliente agrega alternativa" on public.alternativas for insert to authenticated
  with check (cliente_id = auth.uid() and origen = 'cliente' and puntaje is null);
create policy "cliente quita las suyas" on public.alternativas for delete to authenticated
  using (cliente_id = auth.uid() and origen = 'cliente');
create policy "asesor gestiona alternativas" on public.alternativas for all to authenticated
  using (public.es_asesor()) with check (public.es_asesor());

-- objetivos y pendientes: el cliente solo ve los activos; el asesor gestiona todo.
create policy "cliente ve objetivos activos" on public.objetivos for select to authenticated
  using (cliente_id = auth.uid() and activo);
create policy "asesor gestiona objetivos" on public.objetivos for all to authenticated
  using (public.es_asesor()) with check (public.es_asesor());
create policy "cliente ve pendientes activos" on public.pendientes for select to authenticated
  using (cliente_id = auth.uid() and activo);
create policy "asesor gestiona pendientes" on public.pendientes for all to authenticated
  using (public.es_asesor()) with check (public.es_asesor());

-- reuniones: el cliente ve las agendadas y las aprobadas (no los borradores).
create policy "cliente ve reuniones" on public.reuniones for select to authenticated
  using (cliente_id = auth.uid() and estado in ('agendada', 'aprobada'));
create policy "asesor gestiona reuniones" on public.reuniones for all to authenticated
  using (public.es_asesor()) with check (public.es_asesor());

-- mensajes
create policy "cliente ve sus mensajes" on public.mensajes for select to authenticated
  using (cliente_id = auth.uid());
create policy "cliente escribe" on public.mensajes for insert to authenticated
  with check (cliente_id = auth.uid() and autor_id = auth.uid());
create policy "asesor ve mensajes" on public.mensajes for select to authenticated
  using (public.es_asesor());
create policy "asesor escribe" on public.mensajes for insert to authenticated
  with check (public.es_asesor() and autor_id = auth.uid());

-- Acceso de la app (la seguridad la ponen las políticas de arriba)
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke all on public.asesores_permitidos from authenticated, anon;
grant execute on function public.es_asesor, public.mi_asesor, public.puede_ver_planilla, public.registrar_vista_planilla to authenticated;
revoke execute on function public.nuevo_usuario, public.proteger_perfil from public, anon, authenticated;
