const secLogin = document.getElementById('sec-login');
const secPanel = document.getElementById('sec-panel');
const formLogin = document.getElementById('form-login');
const btnLogout = document.getElementById('btn-logout');
const loginError = document.getElementById('login-error');

const formAnuncio = document.getElementById('form-anuncio');
const formTitle = document.getElementById('form-title');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const tablaBody = document.getElementById('tabla-anuncios-body');

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

btnLogout.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  revisarSesion();
});

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

formAnuncio.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('anuncio-id').value;

  const fotosArray = [
    document.getElementById('an-foto-1').value.trim(),
    document.getElementById('an-foto-2').value.trim(),
    document.getElementById('an-foto-3').value.trim(),
    document.getElementById('an-foto-4').value.trim(),
    document.getElementById('an-foto-5').value.trim(),
  ].filter(url => url !== '');

  const payload = {
    nombre: document.getElementById('an-nombre').value,
    categoria: document.getElementById('an-categoria').value,
    seccion: document.getElementById('an-seccion').value,
    ciudad: document.getElementById('an-ciudad').value,
    telefono: document.getElementById('an-telefono').value,
    whatsapp: document.getElementById('an-whatsapp').value,
    direccion: document.getElementById('an-direccion').value,
    descuento: document.getElementById('an-descuento').value,
    logo_url: document.getElementById('an-logo').value,
    imagen_url: document.getElementById('an-imagen').value,
    video_url: document.getElementById('an-video').value.trim(),
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
  document.getElementById('an-logo').value = a.logo_url || '';
  document.getElementById('an-imagen').value = a.imagen_url || '';
  document.getElementById('an-video').value = a.video_url || '';
  document.getElementById('an-descripcion').value = a.descripcion || '';

  const fotos = a.fotos || [];
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`an-foto-${i}`).value = fotos[i - 1] || '';
  }

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
