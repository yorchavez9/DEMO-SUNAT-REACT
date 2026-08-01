import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { fmtMoney } from '../utils.js';
import {
  FileText,
  Receipt,
  TrendingDown,
  TrendingUp,
  Truck,
  Search,
  Loader2,
  XCircle,
  FileCode,
  FileArchive,
  Download,
  Ban,
  Plus,
  MoreVertical,
} from 'lucide-react';
import ProductPicker from '../components/ProductPicker.jsx';
import ItemsTable from '../components/ItemsTable.jsx';
import ResponseModal from '../components/ResponseModal.jsx';
import PdfFormatPicker from '../components/PdfFormatPicker.jsx';
import ClientSelector from '../components/ClientSelector.jsx';

const MOTIVOS_NC = [
  { cod: '01', desc: 'Anulación de la operación' },
  { cod: '02', desc: 'Anulación por error en el RUC' },
  { cod: '03', desc: 'Corrección por error en la descripción' },
  { cod: '04', desc: 'Descuento global' },
  { cod: '05', desc: 'Descuento por ítem' },
  { cod: '06', desc: 'Devolución total/parcial' },
  { cod: '07', desc: 'Bonificación/Descuento' },
  { cod: '08', desc: 'Disminución en el valor' },
  { cod: '09', desc: 'Otros' },
];

const MOTIVOS_ND = [
  { cod: '01', desc: 'Intereses por mora' },
  { cod: '02', desc: 'Aumento en el valor' },
  { cod: '03', desc: 'Penalidades / otros conceptos' },
  { cod: '04', desc: 'Ajustes de valor de exportación' },
  { cod: '05', desc: 'Ajustes por corrección de la moneda' },
  { cod: '06', desc: 'Ajustes por corrección de la cantidad' },
  { cod: '07', desc: 'Ajustes por descuentos no aplicados' },
  { cod: '08', desc: 'Ajustes por cargos adicionales' },
  { cod: '09', desc: 'Otros' },
  { cod: '11', desc: 'Ajustes de operaciones de exportación' },
  { cod: '12', desc: 'Ajustes afectos al IVAP' },
];

const LABELS = {
  'facturas':       { titulo: 'Facturas',          Icon: FileText,    method: 'listarFacturas',     hasCdr: true  },
  'boletas':        { titulo: 'Boletas',            Icon: Receipt,     method: 'listarBoletas',      hasCdr: true  },
  'notas-credito':  { titulo: 'Notas de Crédito',  Icon: TrendingDown,method: 'listarNotasCredito', hasCdr: true  },
  'notas-debito':   { titulo: 'Notas de Débito',   Icon: TrendingUp,  method: 'listarNotasDebito',  hasCdr: true  },
  'guias-remision': { titulo: 'Guías de Remisión', Icon: Truck,       method: 'listarGuias',        hasCdr: false },
};

const TIPO_DOC_MAP = {
  'facturas':      '01',
  'boletas':       '03',
  'notas-credito': '07',
  'notas-debito':  '08',
};

export default function DocumentList() {
  const { tipo } = useParams();
  const config = LABELS[tipo] || LABELS['facturas'];
  const Icon = config.Icon;
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState({ estado: '', buscar: '' });
  const [docAnular, setDocAnular] = useState(null);
  const [docNota, setDocNota] = useState(null);

  useEffect(() => {
    loadDocs();
  }, [tipo]);

  // docId_kind en proceso de descarga (ej: "123_pdf", "123_xml")
  const [downloading, setDownloading] = useState(null);

  async function loadDocs() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtro.estado) params.append('estado', filtro.estado);
      if (filtro.buscar) params.append('buscar', filtro.buscar);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await api[config.method](query);
      setDocs(Array.isArray(res.data) ? res.data : (res.data?.datos || []));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function descargar(doc, kind) {
    const key = `${doc.id}_${kind}`;
    setDownloading(key);
    try {
      let blob;
      const numero = doc.numero_completo || `${doc.serie}-${doc.correlativo}`;
      let filename;
      if (kind === 'pdf') {
        blob = await api.descargarPdf(tipo, doc.id, 'a4');
        filename = `${numero}.pdf`;
      } else if (kind === 'xml') {
        blob = await api.descargarXml(tipo, doc.id);
        filename = `${numero}.xml`;
      } else if (kind === 'cdr') {
        blob = await api.descargarCdr(tipo, doc.id);
        filename = `R-${numero}.zip`;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch (e) {
      alert(`Error al descargar ${kind.toUpperCase()}: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <h1 className="page-title">
        <Icon className="w-7 h-7" />
        {config.titulo}
      </h1>

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="label">Buscar</label>
            <input
              className="input"
              placeholder="Serie, correlativo, cliente..."
              value={filtro.buscar}
              onChange={(e) => setFiltro({ ...filtro, buscar: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Estado SUNAT</label>
            <select
              className="input"
              value={filtro.estado}
              onChange={(e) => setFiltro({ ...filtro, estado: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="enviado">Enviado</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
          <button onClick={loadDocs} className="btn-primary flex items-center gap-2">
            <Search className="w-4 h-4" /> Filtrar
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5" /> {error}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Sin documentos</div>
        ) : (
          <div className="table-wrap">
          <table className="table-std">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th className="text-right">Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                // El API devuelve datos anidados: d.totales.total, d.sunat.estado
                const total = d.totales?.total ?? d.mto_imp_venta ?? d.monto_total ?? 0;
                const estado = d.sunat?.estado ?? d.sunat_status ?? null;
                const clienteNombre = d.cliente?.razon_social
                  ?? d.client_razon_social
                  ?? d.destinatario?.razon_social
                  ?? '-';

                return (
                <tr key={d.id}>
                  <td className="font-mono font-semibold text-slate-900">{d.numero_completo || `${d.serie}-${d.correlativo}`}</td>
                  <td className="text-slate-600">{d.fecha_emision?.slice(0, 10)}</td>
                  <td className="truncate max-w-xs">{clienteNombre}</td>
                  <td className="text-right font-bold text-slate-900">
                    {fmtMoney(total, d.tipo_moneda)}
                  </td>
                  <td><EstadoBadge estado={estado} /></td>
                  <td>
                    <ActionsCell d={d} tipo={tipo} config={config} downloading={downloading} descargar={descargar} setDocNota={setDocNota} setDocAnular={setDocAnular} />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {docAnular && (
        <AnularModal
          doc={docAnular}
          tipo={tipo}
          onClose={() => setDocAnular(null)}
          onSuccess={() => { setDocAnular(null); loadDocs(); }}
        />
      )}

      {docNota && (
        <NotaModal
          doc={docNota.doc}
          tipoNota={docNota.tipo}
          onClose={() => setDocNota(null)}
          onSuccess={() => { setDocNota(null); loadDocs(); }}
        />
      )}
    </div>
  );
}

function ActionButton({ onClick, loading, Icon, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait ${color}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {label}
    </button>
  );
}

function ActionsCell({ d, tipo, config, downloading, descargar, setDocNota, setDocAnular }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);
  const estado = d.sunat?.estado ?? d.sunat_status ?? null;
  const canAnular = !!TIPO_DOC_MAP[tipo] && estado !== 'anulado' && estado !== 'anulacion_en_proceso';
  const canNota = tipo === 'facturas' && estado !== 'anulado' && estado !== 'anulacion_en_proceso';

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    // El menú es position:fixed (anclado al viewport), así que cualquier
    // scroll o resize lo dejaría descolocado: lo cerramos.
    const cerrar = () => setOpen(false);
    document.addEventListener('mousedown', handler);
    // capture: el scroll de .table-wrap no burbujea hasta window
    window.addEventListener('scroll', cerrar, true);
    window.addEventListener('resize', cerrar);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('resize', cerrar);
    };
  }, [open]);

  function toggle(e) {
    if (open) { setOpen(false); return; }
    const r = e.currentTarget.getBoundingClientRect();
    // Alto estimado: cada ítem mide ~34px, más el padding vertical del menú
    const alto = actions.length * 34 + 8;
    const abrirArriba = (r.bottom + alto + 8 > window.innerHeight) && (r.top - alto - 8 > 0);
    setCoords({
      top: abrirArriba ? r.top - alto - 4 : r.bottom + 4,
      right: Math.max(8, window.innerWidth - r.right),
    });
    setOpen(true);
  }

  const actions = [
    { key: 'pdf',    Icon: FileText,    label: 'PDF',   textClass: 'text-blue-600',  hoverClass: 'hover:bg-blue-50'  },
    { key: 'xml',    Icon: FileCode,    label: 'XML',   textClass: 'text-slate-600', hoverClass: 'hover:bg-slate-100' },
    ...(config.hasCdr ? [{ key: 'cdr', Icon: FileArchive, label: 'CDR', textClass: 'text-amber-600', hoverClass: 'hover:bg-amber-50' }] : []),
    ...(canNota ? [
      { key: 'nc', Icon: TrendingDown, label: 'Nota Crédito', textClass: 'text-blue-700',  hoverClass: 'hover:bg-blue-50'  },
      { key: 'nd', Icon: TrendingUp,   label: 'Nota Débito',  textClass: 'text-amber-600', hoverClass: 'hover:bg-amber-50' },
    ] : []),
    ...(canAnular ? [{ key: 'anular', Icon: Ban, label: 'Anular', textClass: 'text-red-600', hoverClass: 'hover:bg-red-50' }] : []),
  ];

  function handleAction(key) {
    setOpen(false);
    if (key === 'pdf')    descargar(d, 'pdf');
    else if (key === 'xml')    descargar(d, 'xml');
    else if (key === 'cdr')    descargar(d, 'cdr');
    else if (key === 'nc')     setDocNota({ doc: d, tipo: 'credito' });
    else if (key === 'nd')     setDocNota({ doc: d, tipo: 'debito' });
    else if (key === 'anular') setDocAnular(d);
  }

  const desktopLabels = { pdf: 'PDF', xml: 'XML', cdr: 'CDR', nc: 'NC', nd: 'ND', anular: 'Anular' };

  return (
    <>
      {/* Desktop (≥1024px): todos los botones inline */}
      <div className="hidden lg:flex items-center gap-1 flex-wrap">
        {actions.map((a) => (
          <ActionButton
            key={a.key}
            onClick={() => handleAction(a.key)}
            loading={downloading === `${d.id}_${a.key}`}
            Icon={a.Icon}
            label={desktopLabels[a.key] ?? a.label}
            color={`${a.textClass} ${a.hoverClass}`}
          />
        ))}
      </div>
      {/* Móvil y tableta (<1024px): dropdown */}
      <div className="lg:hidden" ref={ref}>
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center px-1.5 py-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {open && coords && (
          <div
            ref={menuRef}
            className="fixed bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-1 overflow-hidden"
            style={{ top: coords.top, right: coords.right, minWidth: '10rem' }}
          >
            {actions.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => handleAction(a.key)}
                disabled={downloading === `${d.id}_${a.key}`}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 disabled:opacity-50 ${a.textClass}`}
              >
                {downloading === `${d.id}_${a.key}` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <a.Icon className="w-3.5 h-3.5" />
                )}
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  enviado: 'Enviado',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  anulado: 'Anulado',
  anulacion_en_proceso: 'Anulación en proceso',
};

function EstadoBadge({ estado }) {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    enviado: 'bg-blue-100 text-blue-800',
    aceptado: 'bg-green-100 text-green-800',
    rechazado: 'bg-red-100 text-red-800',
    anulado: 'bg-gray-100 text-gray-600',
    anulacion_en_proceso: 'bg-orange-100 text-orange-800',
  };
  const label = ESTADO_LABELS[estado] || estado;
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[estado] || 'bg-slate-100 text-slate-600'}`}>{label || '-'}</span>;
}

function AnularModal({ doc, tipo, onClose, onSuccess }) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const numero = doc.numero_completo || `${doc.serie}-${doc.correlativo}`;
  const tipoCod = TIPO_DOC_MAP[tipo];

  // La API espera correlativo sin ceros iniciales: "000040" → "40"
  const correlativoLimpio = doc.correlativo
    ? String(parseInt(doc.correlativo, 10) || doc.correlativo)
    : doc.correlativo;

  async function confirmar() {
    if (!motivo.trim()) { setError('Ingresa el motivo de anulación.'); return; }
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (tipo === 'boletas') {
        await api.crearResumen({ fecha_resumen: today, anular: [{ id: doc.id, motivo: motivo.trim(), tipo_documento: '03' }] });
      } else {
        await api.crearAnulacion({
          fecha_generacion: today,
          fecha_comunicacion: today,
          detalles: [{ tipo_documento: tipoCod, serie: doc.serie, correlativo: correlativoLimpio, motivo: motivo.trim() }],
        });
      }
      onSuccess();
    } catch (e) {
      setError(e.message);
      // Mostrar errores de validación detallados si los hay
      if (e.errors) {
        const errs = Array.isArray(e.errors)
          ? e.errors
          : Object.values(e.errors).flat();
        setValidationErrors(errs);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <span className="w-9 h-9 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Ban className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Anular documento</h2>
            <p className="text-xs text-slate-500 font-mono">{numero}</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {(error || validationErrors.length > 0) && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm space-y-1">
              <div className="font-semibold">{error}</div>
              {validationErrors.map((ve, i) => (
                <div key={i} className="text-xs">• {ve}</div>
              ))}
            </div>
          )}
          <div>
            <label className="label">Motivo de anulación <span className="text-red-500">*</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Describe el motivo de la anulación..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              autoFocus
            />
          </div>
          {tipo === 'boletas' && (
            <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              Las boletas se anulan mediante un Resumen Diario enviado a SUNAT.
            </p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancelar</button>
          <button type="button" onClick={confirmar} disabled={loading} className="btn-danger flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Confirmar anulación
          </button>
        </div>
      </div>
    </div>
  );
}

function NotaModal({ doc, tipoNota, onClose, onSuccess }) {
  const isCredito = tipoNota === 'credito';
  const today = new Date().toISOString().split('T')[0];
  const corrLimpio = doc.correlativo ? String(parseInt(doc.correlativo, 10) || doc.correlativo) : '';

  const clienteInit = doc.cliente
    ? { tipo_doc: doc.cliente.tipo_doc || '6', num_doc: doc.cliente.num_doc, razon_social: doc.cliente.razon_social, direccion: doc.cliente.direccion || '' }
    : null;

  const [form, setForm] = useState({
    serie: isCredito ? 'FC01' : 'FD01',
    fecha_emision: today,
    tipo_moneda: doc.tipo_moneda || 'PEN',
    doc_afectado_tipo: '01',
    doc_afectado_serie: doc.serie || 'F001',
    doc_afectado_correlativo: corrLimpio,
    cod_motivo: isCredito ? '06' : '01',
    des_motivo: '',
  });
  const [cliente, setCliente] = useState(clienteInit);
  const [items, setItems] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [pdfFormat, setPdfFormat] = useState('a4');

  const MOTIVOS = isCredito ? MOTIVOS_NC : MOTIVOS_ND;
  const Icon = isCredito ? TrendingDown : TrendingUp;
  const numero = doc.numero_completo || `${doc.serie}-${doc.correlativo}`;

  function addProduct(p) {
    setItems((prev) => [...prev, { codigo: p.codigo, descripcion: p.descripcion, unidad: p.unidad, cantidad: 1, precio_unitario: p.precio_unitario, tip_afe_igv: p.tip_afe_igv || '10' }]);
  }

  async function confirmar() {
    if (!cliente) { setError('Selecciona un cliente.'); return; }
    if (items.length === 0) { setError('Agrega al menos un ítem.'); return; }
    if (!form.des_motivo.trim()) { setError('Describe el motivo.'); return; }
    setSending(true);
    setError(null);
    setValidationErrors([]);
    const payload = {
      ...form,
      cliente: { tipo_doc: cliente.tipo_doc, num_doc: cliente.num_doc, razon_social: cliente.razon_social, direccion: cliente.direccion || '' },
      items: items.map((it) => ({ ...it, cantidad: parseFloat(it.cantidad), precio_unitario: parseFloat(it.precio_unitario) })),
    };
    try {
      const res = isCredito ? await api.crearNotaCredito(payload) : await api.crearNotaDebito(payload);
      setResponse(res);
    } catch (e) {
      setError(e.message);
      if (e.errors) {
        const errs = Array.isArray(e.errors) ? e.errors : Object.values(e.errors).flat();
        setValidationErrors(errs);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">

          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredito ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Emitir Nota de {isCredito ? 'Crédito' : 'Débito'}</h2>
              <p className="text-xs text-slate-500 font-mono">Ref: {numero}</p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {(error || validationErrors.length > 0) && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm space-y-1">
                {error && <div className="font-semibold">{error}</div>}
                {validationErrors.map((ve, i) => <div key={i} className="text-xs">• {ve}</div>)}
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Datos</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Serie</label>
                  <input className="input font-mono" value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value.toUpperCase() })} maxLength={4} />
                  <p className="text-xs text-slate-500 mt-1">{isCredito ? 'Ej: FC01' : 'Ej: FD01'}</p>
                </div>
                <div>
                  <label className="label">Fecha</label>
                  <input type="date" className="input" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} />
                </div>
                <div>
                  <label className="label">Moneda</label>
                  <select className="input" value={form.tipo_moneda} onChange={(e) => setForm({ ...form, tipo_moneda: e.target.value })}>
                    <option value="PEN">PEN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Documento afectado</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Tipo</label>
                  <select className="input" value={form.doc_afectado_tipo} onChange={(e) => setForm({ ...form, doc_afectado_tipo: e.target.value })}>
                    <option value="01">01 - Factura</option>
                    <option value="03">03 - Boleta</option>
                  </select>
                </div>
                <div>
                  <label className="label">Serie</label>
                  <input className="input font-mono" value={form.doc_afectado_serie} onChange={(e) => setForm({ ...form, doc_afectado_serie: e.target.value.toUpperCase() })} maxLength={4} />
                </div>
                <div>
                  <label className="label">Correlativo</label>
                  <input className="input" value={form.doc_afectado_correlativo} onChange={(e) => setForm({ ...form, doc_afectado_correlativo: e.target.value })} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Motivo</p>
              <div className="space-y-3">
                <select className="input" value={form.cod_motivo} onChange={(e) => setForm({ ...form, cod_motivo: e.target.value })}>
                  {MOTIVOS.map((m) => <option key={m.cod} value={m.cod}>{m.cod} – {m.desc}</option>)}
                </select>
                <textarea className="input resize-none" rows={2} placeholder="Descripción del motivo..." value={form.des_motivo} onChange={(e) => setForm({ ...form, des_motivo: e.target.value })} maxLength={250} />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Cliente</p>
              <ClientSelector cliente={cliente} onChange={setCliente} placeholder="RUC o DNI del cliente..." />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ítems afectados</p>
                <button type="button" onClick={() => setShowProductPicker(true)} className="btn-primary text-xs flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <ItemsTable items={items} onChange={setItems} moneda={form.tipo_moneda} />
              <p className="text-xs text-slate-500 mt-2">
                {isCredito ? 'Ítems que se revierten (NC disminuye el monto).' : 'Ítems del monto adicional a cobrar (ND aumenta el monto).'}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <PdfFormatPicker value={pdfFormat} onChange={setPdfFormat} />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={sending}>Cancelar</button>
              <button type="button" onClick={confirmar} disabled={sending} className="btn-primary flex items-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                Emitir N{isCredito ? 'C' : 'D'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showProductPicker && (
        <ProductPicker onSelect={(p) => { addProduct(p); setShowProductPicker(false); }} onClose={() => setShowProductPicker(false)} />
      )}

      {response && (
        <ResponseModal response={response} error={null} tipo={isCredito ? 'notas-credito' : 'notas-debito'} pdfFormat={pdfFormat} onClose={() => { setResponse(null); onSuccess(); }} />
      )}
    </div>
  );
}
