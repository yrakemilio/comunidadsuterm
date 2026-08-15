document.getElementById('year').textContent = new Date().getFullYear();

const params = new URLSearchParams(location.search);
const id = params.get('id');
const contenido = document.getElementById('contenido');

function limpiarWhatsapp(numero) {
  return (numero || '').replace(/\D/g, '');
}

function iniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

async function cargar() {
  if (!id) {
    contenido.innerHTML = `<div class="state error" style="margin-top:24px;"><strong>Anuncio no especificado</strong></div>`;
    return;
  }

  const { data: a, error } = await supabaseClient
    .from('anuncios')
    .select('*')
    .eq('id', id)
    .eq('activo', true)
    .single();

  if (error || !a) {
    contenido.innerHTML = `
      <div class="state error" style="margin-top:24px;">
        <strong>No encontramos este anuncio</strong>
        Puede que ya no esté disponible.
      </div>
      <a class="back-link" href="index.html">← Volver al directorio</a>`;
    return;
  }

  document.title = `${a.nombre} — Comunidad SUTERM`;

  const wa = limpiarWhatsapp(a.whatsapp);
  const logo = a.logo_url
    ? `<img src="${a.logo_url}" alt="${a.nombre}" style="width:100%;height:100%;object-fit:contain;">`
    : `<span class="placeholder" style="font-family:var(--display);font-weight:700;font-size:1.4rem;color:var(--accent-ink);">${iniciales(a.nombre)}</span>`;

  contenido.innerHTML = `
    <div class="detail-card">
      <div class="detail-top">
        <div class="detail-logo">${logo}</div>
        <div>
          <h1 style="font-family:var(--display);font-size:1.4rem;margin:0 0 4px;">${a.nombre}</h1>
          <p style="color:var(--ink-soft);margin:0;">${a.ciudad} · Sección ${a.seccion}</p>
        </div>
      </div>

      ${a.imagen_url ? `<img src="${a.imagen_url}" alt="" style="border-radius:12px;margin-bottom:16px;max-height:280px;object-fit:cover;width:100%;">` : ''}

      <div class="card-tags" style="margin-bottom:14px;">
        <span class="tag">${a.categoria}</span>
        ${a.descuento ? `<span class="tag discount">${a.descuento}</span>` : ''}
      </div>

      ${a.descripcion ? `<p style="color:var(--ink-soft);">${a.descripcion}</p>` : ''}

      <div class="cta-row">
        ${wa ? `<a class="btn primary" href="https://wa.me/52${wa}" target="_blank" rel="noopener">Escribir por WhatsApp</a>` : ''}
        ${a.pagina && a.pagina.includes('.') && !a.pagina.toLowerCase().includes('notiene') ? `<a class="btn" href="https://${a.pagina.replace(/^https?:\/\//,'')}" target="_blank" rel="noopener">Visitar página</a>` : ''}
      </div>
    </div>
    <a class="back-link" href="index.html">← Volver al directorio</a>
  `;
}

cargar();
