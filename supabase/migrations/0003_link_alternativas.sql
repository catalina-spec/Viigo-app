-- Link de la propiedad (portal, corredor o ficha) en cada alternativa.
alter table public.alternativas add column if not exists link text
  check (link is null or link ~* '^https?://');
