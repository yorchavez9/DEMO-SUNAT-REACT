/**
 * Cliente centralizado para la API SUNAT PRO.
 * Usa localStorage para guardar la config (base_url, api_key, api_secret).
 */

const STORAGE_KEY = 'api_sunat_config';
const AUTH_KEY = 'api_sunat_session';

// ─── Login demo (hardcoded) ───────────────────────────
export const DEMO_CREDENTIALS = {
  usuario: 'demo',
  password: 'demo123',
  nombre: 'Usuario Demo',
};

export function login(usuario, password) {
  if (usuario === DEMO_CREDENTIALS.usuario && password === DEMO_CREDENTIALS.password) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      usuario: DEMO_CREDENTIALS.usuario,
      nombre: DEMO_CREDENTIALS.nombre,
      loggedInAt: new Date().toISOString(),
    }));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSession();
}

// ─── Configuración de la API ──────────────────────────
const DEFAULT_CONFIG = {
  base_url: 'https://apisunatv2.kodevo.es/api/v1',
  api_key: 'H5jdBH0YfhjTBzmwn1zP6PjDxruytaTixX6O4gRJiuyp1IqIbNE1TwU2lmcFL2d7',
  api_secret: 'e4fb0d4e7f1bd2cab916c58d47748916ab9ce1cd7c79ee6f5c63752f4eee0612',
};

export function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isConfigured() {
  const { api_key, api_secret } = getConfig();
  return Boolean(api_key && api_secret);
}

async function request(method, path, body) {
  const { base_url, api_key, api_secret } = getConfig();

  if (!api_key || !api_secret) {
    throw new Error('Falta configurar api_key y api_secret en Configuración.');
  }

  const url = `${base_url.replace(/\/$/, '')}${path}`;

  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'X-Api-Key': api_key,
      'X-Api-Secret': api_secret,
    },
  };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';

  // Si es PDF/XML/ZIP: devolver el blob directo
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.blob();
  }

  const raw = await response.json();

  const normalized = {
    success: raw.estado === 'exito' || raw.success === true,
    message: raw.mensaje ?? raw.message,
    data: raw.datos ?? raw.data,
    errors: raw.errores ?? raw.errors,
  };

  if (!response.ok || !normalized.success) {
    const msg = normalized.message || `Error ${response.status}`;
    const err = new Error(msg);
    err.status = response.status;
    err.errors = normalized.errors;
    err.data = normalized;
    throw err;
  }

  return normalized;
}

export const api = {
  // ─── Empresa ──────────────────────────────────────────
  getEmpresa: () => request('GET', '/empresa'),

  // ─── Sucursales/Series/Clientes ────────────────────────
  listSucursales: () => request('GET', '/sucursales'),
  listSeries: (params = '') => request('GET', `/series${params}`),
  listClientes: (buscar = '') => request('GET', `/clientes?buscar=${encodeURIComponent(buscar)}`),

  // ─── Búsqueda RUC/DNI ─────────────────────────────────
  buscarDocumento: (tipo, numero) => request('GET', `/buscar-documento?tipo=${tipo}&numero=${numero}`),

  // ─── Facturas ─────────────────────────────────────────
  crearFactura: (data) => request('POST', '/facturas', data),
  listarFacturas: (query = '') => request('GET', `/facturas${query}`),
  verFactura: (id) => request('GET', `/facturas/${id}`),

  // ─── Boletas ──────────────────────────────────────────
  crearBoleta: (data) => request('POST', '/boletas', data),
  listarBoletas: (query = '') => request('GET', `/boletas${query}`),
  verBoleta: (id) => request('GET', `/boletas/${id}`),

  // ─── Notas de Crédito ─────────────────────────────────
  crearNotaCredito: (data) => request('POST', '/notas-credito', data),
  listarNotasCredito: (query = '') => request('GET', `/notas-credito${query}`),

  // ─── Notas de Débito ──────────────────────────────────
  crearNotaDebito: (data) => request('POST', '/notas-debito', data),
  listarNotasDebito: (query = '') => request('GET', `/notas-debito${query}`),

  // ─── Guías de Remisión ────────────────────────────────
  crearGuia: (data) => request('POST', '/guias-remision', data),
  listarGuias: (query = '') => request('GET', `/guias-remision${query}`),

  // ─── Resúmenes Diarios de Boletas ─────────────────────
  crearResumen: (data) => request('POST', '/resumenes', data),
  listarResumenes: (query = '') => request('GET', `/resumenes${query}`),
  estadoResumen: (id) => request('GET', `/resumenes/${id}/estado`),

  // ─── Descargas ────────────────────────────────────────
  descargarPdf: (tipo, id, format = 'a4') => request('GET', `/${tipo}/${id}/pdf?format=${format}`),
  descargarXml: (tipo, id) => request('GET', `/${tipo}/${id}/xml`),
  descargarCdr: (tipo, id) => request('GET', `/${tipo}/${id}/cdr`),

  // ─── Dashboard ────────────────────────────────────────
  panelIndicadores: () => request('GET', '/panel/indicadores'),
  panelDocumentosRecientes: () => request('GET', '/panel/documentos-recientes'),
  panelVentasMensuales: () => request('GET', '/panel/ventas-mensuales'),
  panelEstadoSunat: () => request('GET', '/panel/estado-sunat'),
  panelPorMoneda: () => request('GET', '/panel/por-moneda'),
};
