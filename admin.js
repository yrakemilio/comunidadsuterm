const secLogin = document.getElementById('sec-login');
const secPanel = document.getElementById('sec-panel');
const formLogin = document.getElementById('form-login');
const btnLogout = document.getElementById('btn-logout');
const loginError = document.getElementById('login-error');

const formAnuncio = document.getElementById('form-anuncio');
const formTitle = document.getElementById('form-title');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const tablaBody = document.getElementById('tabla-anuncios-body');
const uploadStatus = document.getElementById('upload-status');

// Verificar sesión
async function revisarSesion() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    secLogin.style.display = 'none';
    secPanel.style.display = 'block';
    btnLogout.style.display = 'block';
    cargarTablaAdmin();
  } else {
    secLogin.style.display = 'block';
    secPanel.style.display = 'none';
    btnLogout.style.display = 'none';
  }
}

// Login
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    loginError.textContent = 'Credenciales inválidas: ' + error.message;
    loginError.style.display = 'block';
  } else {
    revisarSesion();
  }
});

// Logout
btnLogout.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  revisarSesion();
});

// Subir un archivo al bucket 'imagenes' de Supabase
async function subirArchivo(file) {
  if (!file) return null;
  const extension = file.name.split('.').pop();
  const nombreArchivo = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
  
  const { data, error } = await supabaseClient.storage
    .from('imagenes')
    .upload(nombreArchivo, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Error al subir:', error);
    return null;
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from('imagenes')
    .getPublicUrl(nombreArchivo);

  return publicUrlData.publicUrl;
}

// Cargar tabla
async function cargarTablaAdmin() {
  const { data, error } = await supabaseClient
    .from('anuncios')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error || !data || data.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay anuncios registrados.</td></tr>`;
    return;
  }

  tablaBody.innerHTML = data.map(a => `
    <tr>
      <td><strong>${a.nombre}</strong></td>
      <td>${a.seccion}</td>
      <td>${a.ciudad}</td>
      <td>${a.categoria}</td>
      <td>
        <button class="btn secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="editarAnuncio(${JSON.stringify(a).replace(/"/g, '&quot;')})">Editar</button>
        <button class="btn danger" style="padding:4px 8px; font-size:0.75rem;" onclick="borrarAnuncio(${a.id})">Borrar</button>
      </td>
    </tr>
  `).join('');
}

// Guardar
formAnuncio.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadStatus.style.display = 'inline-block';
  uploadStatus.textContent = 'Guardando datos y subiendo fotos...';

  const id = document.getElementById('anuncio-id').value;
  
  // Archivos seleccionados
  const fileLogo = document.getElementById('an-file-logo').files[0];
  const fileImagen = document.getElementById('an-file-imagen').files[0];
  const filesFotos = document.getElementById('an-file-fotos').files;

  // URLs actuales o nuevas
  let logo_url = document.getElementById('logo-url-actual').value;
  let imagen_url = document.getElementById('imagen-url-actual').value;
  let fotosArray = [];

  try {
    const rawFotos = document.getElementById('fotos-actuales').value;
    if (rawFotos) fotosArray = JSON.parse(rawFotos);
  } catch (err) {
    fotosArray = [];
  }

  if (fileLogo) {
    const nuevaUrl = await subirArchivo(fileLogo);
    if (nuevaUrl) logo_url = nuevaUrl;
  }

  if (fileImagen) {
    const nuevaUrl = await subirArchivo(fileImagen);
    if (nuevaUrl) imagen_url = nuevaUrl;
  }

  if (filesFotos && filesFotos.length > 0) {
    const fotosSubidas = [];
    for (let i = 0; i < Math.min(filesFotos.length, 5); i++) {
      const url = await subirArchivo(filesFotos[i]);
      if (url) fotosSubidas.push(url);
    }
    if (fotosSubidas.length > 0) fotosArray = fotosSubidas;
  }

  const payload = {
    nombre: document.getElementById('an-nombre').value,
    categoria: document.getElementById('an-categoria').value,
    seccion: document.getElementById('an-seccion').value,
    ciudad: document.getElementById('an-ciudad').value,
    telefono: document.getElementById('an-telefono').value,
    whatsapp: document.getElementById('an-whatsapp').value,
    direccion: document.getElementById('an-direccion').value,
    descuento: document.getElementById('an-descuento').value,
    logo_url: logo_url || null,
    imagen_url: imagen_url || null,
    video_url: document.getElementById('an-video').value.trim() || null,
    fotos: fotosArray,
    descripcion: document.getElementById('an-descripcion').value,
    activo: true
  };

  let res;
  if (id) {
    res = await supabaseClient.from('anuncios').update(payload).eq('id', id);
  } else {
    res = await supabaseClient.from('anuncios').insert([payload]);
  }

  uploadStatus.style.display = 'none';

  if (res.error) {
    alert('Error al guardar: ' + res.error.message);
  } else {
    limpiarFormulario();
    cargarTablaAdmin();
  }
});

function limpiarFormulario() {
  formAnuncio.reset();
  document.getElementById('anuncio-id').value = '';
  document.getElementById('logo-url-actual').value = '';
  document.getElementById('imagen-url-actual').value = '';
  document.getElementById('fotos-actuales').value = '';
  document.getElementById('logo-preview-text').textContent = '';
  document.getElementById('imagen-preview-text').textContent = '';
  document.getElementById('fotos-preview-text').textContent = '';
  formTitle.textContent = 'Publicar nuevo anuncio';
  btnCancelEdit.style.display = 'none';
}

window.editarAnuncio = function(a) {
  document.getElementById('anuncio-id').value = a.id;
  document.getElementById('an-nombre').value = a.nombre || '';
  document.getElementById('an-categoria').value = a.categoria || '';
  document.getElementById('an-seccion').value = a.seccion || '';
  document.getElementById('an-ciudad').value = a.ciudad || '';
  document.getElementById('an-telefono').value = a.telefono || '';
  document.getElementById('an-whatsapp').value = a.whatsapp || '';
  document.getElementById('an-direccion').value = a.direccion || '';
  document.getElementById('an-descuento').value = a.descuento || '';
  document.getElementById('an-video').value = a.video_url || '';
  document.getElementById('an-descripcion').value = a.descripcion || '';

  document.getElementById('logo-url-actual').value = a.logo_url || '';
  document.getElementById('imagen-url-actual').value = a.imagen_url || '';
  document.getElementById('fotos-actuales').value = JSON.stringify(a.fotos || []);

  document.getElementById('logo-preview-text').textContent = a.logo_url ? 'Ya tiene logo cargado (sube uno nuevo si deseas cambiarlo).' : '';
  document.getElementById('imagen-preview-text').textContent = a.imagen_url ? 'Ya tiene foto principal cargada.' : '';
  document.getElementById('fotos-preview-text').textContent = (a.fotos && a.fotos.length > 0) ? `Tiene ${a.fotos.length} foto(s) en galería.` : '';

  formTitle.textContent = 'Editando anuncio: ' + a.nombre;
  btnCancelEdit.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

btnCancelEdit.addEventListener('click', limpiarFormulario);

window.borrarAnuncio = async function(id) {
  if (confirm('¿Seguro que deseas eliminar este anuncio?')) {
    const { error } = await supabaseClient.from('anuncios').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      cargarTablaAdmin();
    }
  }
};

revisarSesion();
