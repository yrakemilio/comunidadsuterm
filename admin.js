  const loginView = document.getElementById('login-view');
const panelView = document.getElementById('panel-view');

// ---------- Sesión ----------
async function revisarSesion() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    loginView.hidden = true;
    panelView.hidden = false;
    cargarLista();
  } else {
    loginView.hidden = false;
    panelView.hidden = true;
  }
}

document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('li-email').value.trim();
  const password = document.getElementById('li-pass').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    errorEl.textContent = 'Correo o contraseña incorrectos.';
    return;
  }
  revisarSesion();
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  revisarSesion();
});

// ---------- Formulario ----------
const form = document.getElementById('form-anuncio');
const formMsg = document.getElementById('form-msg');
const formTitle = document.getElementById('form-title');
const btnCancelar = document.getElementById('btn-cancelar-edicion');
let editandoId = null; // null = creando nuevo

const campos = {
  id: document.getElementById('a-id'),
  nombre: document.getElementById('a-nombre'),
  seccion: document.getElementById('a-seccion'),
  ciudad: document.getElementById('a-ciudad'),
  categoria: document.getElementById('a-categoria'),
  descripcion: document.getElementById('a-desc'),
  whatsapp: document.getElementById('a-whats'),
  descuento: document.getElementById('a-descuento'),
  pagina: document.getElementById('a-pagina'),
  activo: document.getElementById('a-activo'),
};

function limpiarFormulario() {
  form.reset();
  campos.activo.checked = true;
  campos.id.disabled = false;
  editandoId = null;
  formTitle.textContent = 'Nuevo anuncio';
  btnCancelar.hidden = true;
}

btnCancelar.addEventListener('click', limpiarFormulario);

async function subirImagen(file, carpeta) {
  if (!file) return null;
  const ext = file.name.split('.').pop();
  const ruta = `${carpeta}/${Date.now()}.${ext}`;
  const { error } = await supabaseClient.storage.from('anuncios').upload(ruta, file, { upsert: true });
  if (error) throw error;
  const { data } = supabaseClient.storage.from('anuncios').getPublicUrl(ruta);
  return data.publicUrl;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.style.color = 'var(--ink-soft)';
  formMsg.textContent = 'Guardando…';

  try {
    const logoFile = document.getElementById('a-logo-file').files[0];
    const imgFile = document.getElementById('a-img-file').files[0];

    const registro = {
      id: campos.id.value.trim(),
      nombre: campos.nombre.value.trim(),
      seccion: campos.seccion.value.trim(),
      ciudad: campos.ciudad.value.trim(),
      categoria: campos.categoria.value.trim(),
      descripcion: campos.descripcion.value.trim(),
      whatsapp: campos.whatsapp.value.trim(),
      descuento: campos.descuento.value.trim(),
      pagina: campos.pagina.value.trim(),
      activo: campos.activo.checked,
    };

    if (logoFile) registro.logo_url = await subirImagen(logoFile, `${registro.id}/logo`);
    if (imgFile) registro.imagen_url = await subirImagen(imgFile, `${registro.id}/imagen`);

    const { error } = await supabaseClient.from('anuncios').upsert(registro, { onConflict: 'id' });
    if (error) throw error;

    formMsg.style.color = 'var(--good)';
    formMsg.textContent = 'Anuncio guardado correctamente.';
    limpiarFormulario();
    cargarLista();
  } catch (err) {
    formMsg.style.color = '#A23B2E';
    formMsg.textContent = `Error al guardar: ${err.message || err}`;
  }
});

// ---------- Lista / editar / borrar ----------
async function cargarLista() {
  const cont = document.getElementById('lista-anuncios');
  const { data, error } = await supabaseClient
    .from('anuncios')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) {
    cont.innerHTML = `<p style="color:#A23B2E;">Error al cargar: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    cont.innerHTML = `<p style="color:var(--ink-faint);">Todavía no hay anuncios.</p>`;
    return;
  }

  cont.innerHTML = data.map(a => `
    <div class="admin-list-item">
      <img src="${a.logo_url || ''}" alt="">
      <div class="grow">
        <div class="name">${a.nombre} ${a.activo ? '' : '<span style="color:var(--ink-faint);font-weight:400;">(oculto)</span>'}</div>
        <div class="meta">${a.id} · sec. ${a.seccion} · ${a.ciudad}</div>
      </div>
      <button class="icon-btn" data-editar="${a.id}">Editar</button>
      <button class="icon-btn danger" data-borrar="${a.id}">Borrar</button>
    </div>
  `).join('');

  cont.querySelectorAll('[data-editar]').forEach(btn => {
    btn.addEventListener('click', () => cargarEnFormulario(data.find(x => x.id === btn.dataset.editar)));
  });
  cont.querySelectorAll('[data-borrar]').forEach(btn => {
    btn.addEventListener('click', () => borrar(btn.dataset.borrar));
  });
}

function cargarEnFormulario(a) {
  campos.id.value = a.id;
  campos.id.disabled = true; // no se cambia el id en edición
  campos.nombre.value = a.nombre;
  campos.seccion.value = a.seccion;
  campos.ciudad.value = a.ciudad;
  campos.categoria.value = a.categoria;
  campos.descripcion.value = a.descripcion || '';
  campos.whatsapp.value = a.whatsapp || '';
  campos.descuento.value = a.descuento || '';
  campos.pagina.value = a.pagina || '';
  campos.activo.checked = a.activo;
  editandoId = a.id;
  formTitle.textContent = `Editando: ${a.nombre}`;
  btnCancelar.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function borrar(id) {
  if (!confirm('¿Borrar este anuncio permanentemente?')) return;
  const { error } = await supabaseClient.from('anuncios').delete().eq('id', id);
  if (error) { alert('Error al borrar: ' + error.message); return; }
  cargarLista();
}

revisarSesion();
