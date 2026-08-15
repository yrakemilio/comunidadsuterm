-- ============================================================
-- COMUNIDAD SUTERM — Esquema de base de datos (Supabase / Postgres)
-- ============================================================
-- Cómo usar:
-- 1. Crea un proyecto en https://supabase.com (plan gratuito alcanza para empezar)
-- 2. Ve a "SQL Editor" -> "New query", pega todo este archivo y dale "Run"
-- 3. Ve a "Storage" y confirma que se creó el bucket "anuncios" (público)
-- 4. Ve a "Authentication" -> "Users" -> "Add user" y crea TU cuenta de admin
--    (ese correo es el único que podrá publicar/editar/borrar anuncios)
-- ============================================================

-- Tabla principal de anuncios
create table if not exists anuncios (
  id            text primary key,                 -- slug único, ej. "easyabogados"
  nombre        text not null,
  seccion       text not null,                     -- número de sección sindical
  ciudad        text not null,                      -- ciudad/municipio
  categoria     text not null,                      -- Servicios / Productos / Alimentos...
  descripcion   text,
  whatsapp      text,
  descuento     text,
  pagina        text,
  logo_url      text,
  imagenes      text[] not null default '{}',       -- galería del anuncio, máximo 5 URLs
  activo        boolean not null default true,      -- permite ocultar sin borrar
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint max_5_imagenes check (array_length(imagenes, 1) is null or array_length(imagenes, 1) <= 5)
);

-- Mantener actualizado_en al día automáticamente
create or replace function set_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_anuncios_actualizado on anuncios;
create trigger trg_anuncios_actualizado
  before update on anuncios
  for each row execute function set_actualizado_en();

-- Seguridad a nivel de fila (RLS)
alter table anuncios enable row level security;

-- Cualquiera (incluso sin cuenta) puede LEER únicamente anuncios activos
drop policy if exists "lectura_publica_activos" on anuncios;
create policy "lectura_publica_activos"
  on anuncios for select
  to anon, authenticated
  using (activo = true);

-- Solo un usuario autenticado (tú, el admin) puede leer TODO, incluidos inactivos
drop policy if exists "lectura_admin_todo" on anuncios;
create policy "lectura_admin_todo"
  on anuncios for select
  to authenticated
  using (true);

-- Solo un usuario autenticado puede insertar / actualizar / borrar
drop policy if exists "escritura_admin" on anuncios;
create policy "escritura_admin"
  on anuncios for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- Storage: bucket público para logos e imágenes de anuncios
-- ============================================================
insert into storage.buckets (id, name, public)
values ('anuncios', 'anuncios', true)
on conflict (id) do nothing;

-- Cualquiera puede VER las imágenes (son públicas por diseño)
drop policy if exists "storage_lectura_publica" on storage.objects;
create policy "storage_lectura_publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'anuncios');

-- Solo un usuario autenticado puede subir/editar/borrar imágenes
drop policy if exists "storage_escritura_admin" on storage.objects;
create policy "storage_escritura_admin"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'anuncios')
  with check (bucket_id = 'anuncios');
