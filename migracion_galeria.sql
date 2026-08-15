-- ============================================================
-- MIGRACIÓN: galería de imágenes (máx. 5 por anuncio)
-- ============================================================
-- Corre esto UNA VEZ en tu proyecto de Supabase (SQL Editor -> New query)
-- si ya habías ejecutado el schema.sql original.
-- ============================================================

-- 1. Nueva columna: arreglo de URLs de imágenes
alter table anuncios add column if not exists imagenes text[] not null default '{}';

-- 2. Migrar la imagen única que ya tenías (si existía) a la nueva galería
update anuncios
set imagenes = array[imagen_url]
where imagen_url is not null and imagen_url <> '' and imagenes = '{}';

-- 3. Límite de 5 imágenes por anuncio, forzado también en la base de datos
alter table anuncios drop constraint if exists max_5_imagenes;
alter table anuncios add constraint max_5_imagenes check (array_length(imagenes, 1) is null or array_length(imagenes, 1) <= 5);

-- 4. Ya no se usa la columna vieja de una sola imagen
alter table anuncios drop column if exists imagen_url;
