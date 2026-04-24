/* ── app.js — API Explorer lógica de cliente ─────────────────────────────── */

const BASE = '';  // mismo origen (Express sirve /public como raíz)
let jwtToken = localStorage.getItem('jwt_token') || null;

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateTokenUI();
    bindNav();
    checkServer();
});

// ── NAVEGACIÓN ────────────────────────────────────────────────────────────────
const METHOD_MAP = {
    'auth-register':     ['POST',   '/api/auth/register'],
    'auth-login':        ['POST',   '/api/auth/login'],
    'usuarios-listar':   ['GET',    '/api/usuarios'],
    'usuarios-obtener':  ['GET',    '/api/usuarios/:id'],
    'usuarios-crear':    ['POST',   '/api/usuarios'],
    'usuarios-actualizar': ['PUT',  '/api/usuarios/:id'],
    'usuarios-eliminar': ['DELETE', '/api/usuarios/:id'],
    'posts-listar':      ['GET',    '/api/posts'],
    'posts-obtener':     ['GET',    '/api/posts/:id'],
    'posts-crear':       ['POST',   '/api/posts'],
    'posts-actualizar':  ['PUT',    '/api/posts/:id'],
    'posts-eliminar':    ['DELETE', '/api/posts/:id'],
    'upload-avatar':     ['POST',   '/api/upload/avatar'],
};

function bindNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            // active nav
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // show panel
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${section}`).classList.add('active');
            // hide response
            document.getElementById('responsePanel').style.display = 'none';
            // update topbar
            const [method, url] = METHOD_MAP[section] || ['GET', '/'];
            updateTopbar(method, url);
        });
    });
}

function updateTopbar(method, url) {
    const badge = document.getElementById('currentMethod');
    badge.textContent = method;
    badge.className = `section-badge ${method}`;
    document.getElementById('currentUrl').textContent = url;
}

// ── SERVER PING ───────────────────────────────────────────────────────────────
async function checkServer() {
    try {
        await fetch('/status');
        document.getElementById('serverPing').style.color = 'var(--green)';
    } catch {
        document.getElementById('serverPing').style.color = 'var(--red)';
    }
}

// ── TOKEN UTILS ───────────────────────────────────────────────────────────────
function saveToken(token) {
    jwtToken = token;
    localStorage.setItem('jwt_token', token);
    updateTokenUI();
}

function clearToken() {
    jwtToken = null;
    localStorage.removeItem('jwt_token');
    updateTokenUI();
    showToast('Sesión cerrada.');
}

function updateTokenUI() {
    const dot   = document.getElementById('tokenDot');
    const label = document.getElementById('tokenLabel');
    if (jwtToken) {
        dot.classList.add('active');
        label.textContent = 'Autenticado ✓';
    } else {
        dot.classList.remove('active');
        label.textContent = 'Sin autenticar';
    }
}

function authHeaders(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    if (jwtToken) h['Authorization'] = `Bearer ${jwtToken}`;
    return h;
}

// ── FETCH HELPER ──────────────────────────────────────────────────────────────
async function apiCall(method, url, body = null, isFormData = false) {
    const opts = { method, headers: {} };
    if (jwtToken) opts.headers['Authorization'] = `Bearer ${jwtToken}`;
    if (body && !isFormData) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    if (isFormData) opts.body = body; // FormData

    const t0 = performance.now();
    const res = await fetch(url, opts);
    const ms  = Math.round(performance.now() - t0);
    let data;
    try { data = await res.json(); } catch { data = { raw: await res.text() }; }
    showResponse(res.status, data, ms);
    return { status: res.status, data };
}

// ── RESPONSE DISPLAY ──────────────────────────────────────────────────────────
function showResponse(status, data, ms) {
    const panel = document.getElementById('responsePanel');
    const statusEl = document.getElementById('responseStatus');
    const timeEl   = document.getElementById('responseTime');
    const bodyEl   = document.getElementById('responseBody');

    panel.style.display = 'block';
    statusEl.textContent = status;
    statusEl.className   = `response-status ${status < 300 ? 'ok' : 'err'}`;
    timeEl.textContent   = `${ms} ms`;
    bodyEl.innerHTML     = syntaxHighlight(JSON.stringify(data, null, 2));

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function syntaxHighlight(json) {
    return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        match => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'json-key' : 'json-string';
            } else if (/true|false/.test(match)) {
                cls = 'json-bool';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        }
    );
}

function copyResponse() {
    const text = document.getElementById('responseBody').innerText;
    navigator.clipboard.writeText(text).then(() => showToast('JSON copiado al portapapeles.'));
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function showTokenModal(token) {
    document.getElementById('tokenPreview').textContent = token;
    document.getElementById('tokenModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('tokenModal').style.display = 'none';
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── LOADING STATE ─────────────────────────────────────────────────────────────
function setLoading(btn, state) {
    btn.classList.toggle('loading', state);
    btn.disabled = state;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
async function doRegister() {
    const nombre   = document.getElementById('reg-nombre').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const bio      = document.getElementById('reg-bio').value.trim();

    if (!nombre || !email || !password) return showToast('⚠️ Nombre, email y password son obligatorios.');

    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    const { status, data } = await apiCall('POST', '/api/auth/register', { nombre, email, password, bio });
    setLoading(btn, false);

    if (status === 201 && data?.data?.token) {
        saveToken(data.data.token);
        showTokenModal(data.data.token);
    }
}

async function doLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) return showToast('⚠️ Email y password son obligatorios.');

    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    const { status, data } = await apiCall('POST', '/api/auth/login', { email, password });
    setLoading(btn, false);

    if (status === 200 && data?.data?.token) {
        saveToken(data.data.token);
        showTokenModal(data.data.token);
    }
}

// ── USUARIOS ──────────────────────────────────────────────────────────────────
async function doListarUsuarios() {
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('GET', '/api/usuarios');
    setLoading(btn, false);
}

async function doObtenerUsuario() {
    const id = document.getElementById('get-usuario-id').value;
    if (!id) return showToast('⚠️ Introduce un ID.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('GET', `/api/usuarios/${id}`);
    setLoading(btn, false);
}

async function doCrearUsuario() {
    const nombre   = document.getElementById('crear-usuario-nombre').value.trim();
    const email    = document.getElementById('crear-usuario-email').value.trim();
    const password = document.getElementById('crear-usuario-password').value;
    const bio      = document.getElementById('crear-usuario-bio').value.trim();
    if (!nombre || !email || !password) return showToast('⚠️ Nombre, email y password son obligatorios.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('POST', '/api/usuarios', { nombre, email, password, bio });
    setLoading(btn, false);
}

async function doActualizarUsuario() {
    if (!jwtToken) return showToast('🔐 Debes iniciar sesión primero.');
    const id = document.getElementById('upd-usuario-id').value;
    if (!id) return showToast('⚠️ Introduce un ID.');
    const body = {};
    const nombre = document.getElementById('upd-usuario-nombre').value.trim();
    const email  = document.getElementById('upd-usuario-email').value.trim();
    if (nombre) body.nombre = nombre;
    if (email)  body.email  = email;
    if (!Object.keys(body).length) return showToast('⚠️ Introduce al menos un campo a actualizar.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('PUT', `/api/usuarios/${id}`, body);
    setLoading(btn, false);
}

async function doEliminarUsuario() {
    if (!jwtToken) return showToast('🔐 Debes iniciar sesión primero.');
    const id = document.getElementById('del-usuario-id').value;
    if (!id) return showToast('⚠️ Introduce un ID.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('DELETE', `/api/usuarios/${id}`);
    setLoading(btn, false);
}

// ── POSTS ─────────────────────────────────────────────────────────────────────
async function doListarPosts() {
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('GET', '/api/posts');
    setLoading(btn, false);
}

async function doObtenerPost() {
    const id = document.getElementById('get-post-id').value;
    if (!id) return showToast('⚠️ Introduce un ID.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('GET', `/api/posts/${id}`);
    setLoading(btn, false);
}

async function doCrearPost() {
    if (!jwtToken) return showToast('🔐 Debes iniciar sesión primero.');
    const titulo     = document.getElementById('crear-post-titulo').value.trim();
    const contenido  = document.getElementById('crear-post-contenido').value.trim();
    const usuarioId  = parseInt(document.getElementById('crear-post-usuarioId').value);
    if (!titulo || !contenido || !usuarioId) return showToast('⚠️ Todos los campos son obligatorios.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('POST', '/api/posts', { titulo, contenido, usuarioId });
    setLoading(btn, false);
}

async function doActualizarPost() {
    if (!jwtToken) return showToast('🔐 Debes iniciar sesión primero.');
    const id = document.getElementById('upd-post-id').value;
    if (!id) return showToast('⚠️ Introduce un ID.');
    const body = {};
    const titulo    = document.getElementById('upd-post-titulo').value.trim();
    const contenido = document.getElementById('upd-post-contenido').value.trim();
    if (titulo)    body.titulo    = titulo;
    if (contenido) body.contenido = contenido;
    if (!Object.keys(body).length) return showToast('⚠️ Introduce al menos un campo a actualizar.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('PUT', `/api/posts/${id}`, body);
    setLoading(btn, false);
}

async function doEliminarPost() {
    if (!jwtToken) return showToast('🔐 Debes iniciar sesión primero.');
    const id = document.getElementById('del-post-id').value;
    if (!id) return showToast('⚠️ Introduce un ID.');
    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('DELETE', `/api/posts/${id}`);
    setLoading(btn, false);
}

// ── UPLOAD ────────────────────────────────────────────────────────────────────
let selectedFile = null;

function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    // Validación en cliente
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
        return showToast('⚠️ Solo se aceptan JPEG, PNG o WebP.');
    }
    if (file.size > 2 * 1024 * 1024) {
        return showToast('⚠️ El archivo supera los 2 MB.');
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('fileInfo').innerHTML =
            `<strong>${file.name}</strong><br>${(file.size / 1024).toFixed(1)} KB · ${file.type}`;
        document.getElementById('uploadZone').style.display  = 'none';
        document.getElementById('filePreview').style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function removeFile() {
    selectedFile = null;
    document.getElementById('avatarFile').value = '';
    document.getElementById('uploadZone').style.display  = 'block';
    document.getElementById('filePreview').style.display = 'none';
}

async function doUploadAvatar() {
    if (!jwtToken) return showToast('🔐 Debes iniciar sesión primero.');
    if (!selectedFile) return showToast('⚠️ Selecciona una imagen primero.');

    const fd = new FormData();
    fd.append('avatar', selectedFile);

    const btn = event.target.closest('.btn-send');
    setLoading(btn, true);
    await apiCall('POST', '/api/upload/avatar', fd, true);
    setLoading(btn, false);
}

// ── DRAG & DROP ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const zone = document.getElementById('uploadZone');
    if (!zone) return;

    zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.style.borderColor = 'var(--accent)';
        zone.style.background  = 'rgba(108,99,255,.08)';
    });

    zone.addEventListener('dragleave', () => {
        zone.style.borderColor = '';
        zone.style.background  = '';
    });

    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.style.borderColor = '';
        zone.style.background  = '';
        const file = e.dataTransfer.files[0];
        if (file) {
            const input = document.getElementById('avatarFile');
            // Crear un DataTransfer para asignar el archivo al input
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFileSelect(input);
        }
    });
});
