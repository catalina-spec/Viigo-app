-- Nueva asesora: Verónica Muñoz (contacto@vielonline.cl).
insert into public.asesores_permitidos (email) values ('contacto@vielonline.cl')
  on conflict (email) do nothing;

-- Si ya había entrado antes (quedó como cliente), la pasamos a asesora con su nombre.
-- El trigger proteger_perfil impide cambiar el rol desde la app; aquí lo pausamos solo para este cambio.
alter table public.perfiles disable trigger proteger_perfil;
update public.perfiles
  set rol = 'asesor', asesor_id = null,
      nombre = coalesce(nullif(nombre, ''), 'Verónica'),
      apellido = coalesce(nullif(apellido, ''), 'Muñoz')
  where lower(email) = 'contacto@vielonline.cl';
alter table public.perfiles enable trigger proteger_perfil;

select email, rol, nombre, apellido from public.perfiles where lower(email) = 'contacto@vielonline.cl';
