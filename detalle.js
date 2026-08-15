document.getElementById('year').textContent = new Date().getFullYear();

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const container = document.getElementById('detalle-container');

function obtenerYouTubeEmbed(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

async function cargarDetalle() {
  if (!id) {
    container.innerHTML = `<div class="state error"><strong>Anuncio no especificado</strong><br><a href="index.html">Regresar al inicio</a></div>`;
    return;
  }

  const { data: a, error } = await supabaseClient
    .from('anuncios')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !a) {
    container.innerHTML = `<div class="state error"><strong>No se encontró el anuncio</strong><br><a href="index.html">Regresar al inicio</a></div>`;
    return;
  }

  document.title = `${a.nombre} — Comunidad SUTERM`;

  const banner = a.imagen_url ? `<img src="${a.imagen_url}" alt="${a.nombre}" class="detail-banner">` : '';
  const telLink = a.telefono ? `<a class="contact-btn btn-tel" href="tel:${a.telefono}">📞 Llamar (${a.telefono})</a>` : '';
  const waLink = a.whatsapp ? `<a class="contact-btn btn-wa" href="https://wa.me/${a.whatsapp.replace(/[^0-9]/g, '')}" target="_blank">💬 WhatsApp</a>` : '';

  // Video de YouTube
  let videoHtml = '';
  const embedUrl = obtenerYouTubeEmbed(a.video_url);
  if (embedUrl) {
    videoHtml = `
      <div style="margin: 20px 0;">
        <h3 style="font-size:1.05rem; color:#0f172a; margin-bottom:10px;">📹 Conoce más en nuestra entrevista:</h3>
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:10px; border:1px solid #e2e8f0;">
          <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      </div>
    `;
  }

  // Galería de fotos
  let galeriaHtml = '';
  if (a.fotos && Array.isArray(a.fotos) && a.fotos.length > 0) {
    const items = a.fotos.map(url => `
      <a href="${url}" target="_blank" style="display:block; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; height:120px;">
        <img src="${url}" alt="Foto de ${a.nombre}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
      </a>
    `).join('');

    galeriaHtml = `
      <div style="margin: 24px 0;">
        <h3 style="font-size:1.05rem; color:#0f172a; margin-bottom:10px;">📸 Galería de fotos:</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">
          ${items}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="detail-card">
      ${banner}
      <div class="detail-body">
        <div class="detail-header">
          <div>
            <h1 style="font-size:1.6rem; color:#0f172a; margin-bottom:4px;">${a.nombre}</h1>
            <p style="color:#64748b; font-size:0.95rem;">📍 ${a.ciudad} · Sección ${a.seccion}</p>
          </div>
          <span class="tag" style="font-size:0.85rem; padding:4px 10px;">${a.categoria}</span>
        </div>

        ${a.descuento ? `<div style="margin:14px 0;"><span class="tag discount" style="font-size:0.9rem; padding:6px 12px;">🏷️ Descuento a agremiados: ${a.descuento}</span></div>` : ''}

        <div style="margin:20px 0; font-size:1rem; color:#334155; line-height:1.6; white-space:pre-line;">
          ${a.descripcion || 'Sin descripción detallada.'}
        </div>

        ${videoHtml}
        ${galeriaHtml}

        ${a.direccion ? `<p style="font-size:0.9rem; color:#64748b; margin-bottom:12px;"><strong>Dirección / Ubicación:</strong> ${a.direccion}</p>` : ''}

        <div class="contact-btns">
          ${waLink}
          ${telLink}
        </div>
      </div>
    </div>
  `;
}

cargarDetalle();
