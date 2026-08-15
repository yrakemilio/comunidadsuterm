# Comunidad SUTERM — Directorio

## 1. Crear el backend (Supabase, gratis)
1. Ve a https://supabase.com → crea cuenta → "New project".
2. Cuando esté listo, abre **SQL Editor → New query**, pega todo el contenido de `schema.sql` y ejecútalo.
3. Ve a **Authentication → Users → Add user** y crea TU cuenta (correo + contraseña). Ese será tu login de admin — es el único que podrá publicar/editar/borrar.
4. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

## 2. Conectar el sitio
Abre `config.js` y reemplaza:
```js
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY_PUBLICA";
```
con los valores reales de tu proyecto. (La "anon key" es pública y segura de exponer en el frontend — no uses nunca la "service_role" aquí.)

## 3. Migrar tus anuncios actuales de Google Sheets
En Supabase: **Table Editor → anuncios → Insert → Import data from CSV**.
Exporta tu hoja "anuncios" como CSV (Archivo → Descargar → CSV) y súbelo — las columnas ya coinciden con la tabla (ajusta `logo` → `logo_url` e `imagen1` → `imagen_url` si los nombres no calzan exacto).

## 4. Subir a Vercel
1. Sube esta carpeta a tu repo de GitHub (reemplaza el contenido actual del repo `comunidad_suterm`).
2. En Vercel, tu proyecto ya apunta a ese repo — solo haz push y se despliega solo.
3. El panel de administración queda en `tudominio.vercel.app/admin.html` — no está enlazado desde el sitio público, solo tú conoces la ruta. Nadie sin tu correo/contraseña puede publicar.

## Estructura de archivos
- `index.html` / `app.js` — directorio público
- `detalle.html` / `detalle.js` — ficha de cada anuncio
- `admin.html` / `admin.js` — panel privado (login + alta/edición/borrado + subida de imágenes)
- `style.css` — todo el diseño
- `config.js` — tus credenciales de Supabase (edítalo, no lo dejes con los valores de ejemplo)
- `schema.sql` — se ejecuta una sola vez en Supabase

## Sobre las secciones que abarcan varias ciudades
Por ahora el campo `seccion` es libre (texto), igual que `ciudad` — así que puedes seguir capturando "150 / Cuernavaca" como lo haces hoy. Si más adelante quieres que una sección agrupe varias ciudades como jerarquía real (ej. filtrar "Sección 109" y ver Cuautla + Yautepec juntos), lo siguiente sería una tabla `secciones` aparte con sus ciudades asociadas — puedo montarla cuando tengas la lista completa de secciones y qué municipios cubre cada una.
