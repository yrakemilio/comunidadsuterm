document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Aviso legal (una vez por navegador) ----------
const overlay = document.getElementById('legal-overlay');
const yaAcepto = localStorage.getItem('cs_aviso_aceptado');

if (!yaAcepto) {
  overlay.hidden = false;
  overlay.style.display = 'flex';
} else {
  overlay.hidden = true;
  overlay.style.display = 'none';
}

document.getElementById('aceptar-aviso').addEventListener('click', () => {
  localStorage.setItem('cs_aviso_aceptado', '1');
  overlay.hidden = true;
  overlay.style.display = 'none';
});

document.getElementById('ver-aviso').addEventListener('click', (e) => {
  e.preventDefault();
  overlay.hidden = false;
  overlay.style.display = 'flex';
});

// ---------- Estado ----------
let anuncios = [];
const grid = document.getElementById('grid');
const resultsCount = document.getElementById('results-count');
const fBuscar = document.getElementById('f-buscar');
const fSeccion = document.getElementById('f-seccion');
const fCiudad = document.getElementById('f-ciudad');
const fCategoria = document.getElementById('f-categoria');

function poblarFiltro(select, valores, etiqueta) {
  const unicos = [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  select.innerHTML = `<option value="">${etiqueta}: todas</option>` +
    unicos.map(v => `<option value="${v}">${v}</option>`).join('');
}

function iniciales(nombre) {
  return (nombre || '').split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

function renderCard(a) {
  const badge = a.logo_url
    ? `<img src="${a.logo_url}" alt="${a.nombre}" loading="lazy">`
    : `<span class="placeholder">${iniciales(a.nombre)}</span>`;

  return `
    <a class="card" href="detalle.html?id=${encodeURIComponent(a.id)}">
      <div class="card-badge">${badge}</div>
      <div class="card-body">
        <div class="card-top">
          <div>
            <p class="card-name">${a.nombre}</p>
            <p class="card-location">${a.ciudad}</p>
          </div>
          <span class="card-seccion">SECC. ${a.seccion}</span>
        </div>
        ${a.descripcion ? `<p class="card-desc">${a.descripcion}</p>` : ''}
        <div class="card-tags">
          <span class="tag">${a.categoria}</span>
          ${a.descuento ? `<span class="tag discount">${a.descuento}</span>` : ''}
        </div>
      </div>
    </a>
  `;
}

function aplicarFiltros() {
  const q = fBuscar.value.trim().toLowerCase();
  const sec = fSeccion.value;
  const ciu = fCiudad.value;
  const cat = fCategoria.value;

  const filtrados = anuncios.filter(a => {
    if (sec && a.seccion !== sec) return false;
    if (ciu && a.ciudad !== ciu) return false;
    if (cat && a.categoria !== cat) return false;
    if (q) {
      const texto = `${a.nombre} ${a.descripcion || ''}`.toLowerCase();
      if (!texto.includes(q)) return false;
    }
    return true;
  });

  renderResultados(filtrados);
}

function renderResultados(lista) {
  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="state">
        <strong>No encontramos anuncios con esos filtros</strong>
        Prueba ajustando la búsqueda o quitando algún filtro.
      </div>`;
    resultsCount.textContent = '';
    return;
  }
  resultsCount.textContent = `${lista.length} anuncio${lista.length === 1 ? '' : 's'} encontrado${lista.length === 1 ? '' : 's'}`;
  grid.innerHTML = lista.map(renderCard).join('');
}

async function cargarAnuncios() {
  if (typeof supabaseClient === 'undefined') {
    grid.innerHTML = `
      <div class="state error">
        <strong>Error de configuración</strong>
        No se pudo inicializar la conexión con Supabase. Revisa config.js.
      </div>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from('anuncios')
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false });

  if (error) {
    grid.innerHTML = `
      <div class="state error">
        <strong>No pudimos cargar los anuncios</strong>
        Intenta recargar la página en un momento. (${error.message})
      </div>`;
    resultsCount.textContent = '';
    return;
  }

  anuncios = data || [];

  if (anuncios.length === 0) {
    grid.innerHTML = `
      <div class="state">
        <strong>Aún no hay anuncios publicados</strong>
        Vuelve pronto — la Comunidad SUTERM está sumando negocios de agremiados.
      </div>`;
    resultsCount.textContent = '';
    return;
  }

  poblarFiltro(fSeccion, anuncios.map(a => a.seccion), 'Sección');
  poblarFiltro(fCiudad, anuncios.map(a => a.ciudad), 'Ciudad');
  poblarFiltro(fCategoria, anuncios.map(a => a.categoria), 'Categoría');

  renderResultados(anuncios);
}

[fBuscar, fSeccion, fCiudad, fCategoria].forEach(el => {
  if (el) {
    el.addEventListener('input', aplicarFiltros);
    el.addEventListener('change', aplicarFiltros);
  }
});

cargarAnuncios();
