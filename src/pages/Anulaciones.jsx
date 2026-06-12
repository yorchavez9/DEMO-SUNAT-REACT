import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import {
  Ban, Plus, Loader2, RefreshCcw, Send, CheckCircle2, XCircle, X, Trash2, Info,
} from 'lucide-react';

const TODAY = new Date().toISOString().split('T')[0];

function normalizeAnulacion(a) {
  if (!a) return a;
  return {
    ...a,
    estado_sunat: a.sunat_status ?? a.estado_sunat ?? a.sunat?.estado ?? a.estado ?? null,
    sunat_description: a.sunat_description ?? a.sunat?.descripcion ?? null,
    ticket: a.ticket ?? a.sunat?.ticket ?? null,
  };
}

const TIPOS_DOC = [
  { cod: '01', label: 'Factura' },
  { cod: '07', label: 'Nota de Crédito' },
  { cod: '08', label: 'Nota de Débito' },
];

export default function Anulaciones() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(null);
  const [sending, setSending] = useState(null);

  async function loadAnulaciones() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listarAnulaciones();
      const raw = Array.isArray(res.data) ? res.data : (res.data?.datos || res.data?.data || []);
      setItems(raw.map(normalizeAnulacion));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAnulaciones(); }, []);

  async function refrescar(id) {
    setRefreshing(id);
    try {
      const res = await api.estadoAnulacion(id);
      const updated = normalizeAnulacion(res.data || res);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        )
      );
    } catch (e) {
      alert('Error al refrescar: ' + e.message);
    } finally {
      setRefreshing(null);
    }
  }

  async function enviarPendiente(id) {
    setSending(id);
    try {
      await api.enviarAnulacion(id);
      await loadAnulaciones();
    } catch (e) {
      alert('Error al enviar: ' + e.message);
    } finally {
      setSending(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="page-title mb-0">
          <Ban className="w-7 h-7" /> Anulaciones
        </h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva Anulación
        </button>
      </div>

      <div className="mb-5 p-4 bg-blue-50 rounded-xl flex gap-3 text-sm text-blue-800">
        <Info className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
        <div>
          <strong>Comunicación de Baja</strong> — Anula facturas, notas de crédito y notas de débito ya enviadas a SUNAT.
          Plazo máximo: 7 días desde la emisión.
          Para anular <strong>boletas</strong> usa el módulo{' '}
          <a href="#/resumenes" className="underline font-semibold">Resúmenes Diarios</a>.
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">Historial</h2>
          <button onClick={loadAnulaciones} disabled={loading} className="btn-ghost text-sm">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="text-center py-10 text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Cargando...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
              <XCircle className="w-5 h-5" /> {error}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              Sin anulaciones registradas. Crea la primera con "Nueva Anulación".
            </div>
          ) : (
            <table className="table-std min-w-[800px]">
              <thead>
                <tr>
                  <th>Identificador</th>
                  <th>Fecha</th>
                  <th className="text-right">Docs</th>
                  <th>Estado SUNAT</th>
                  <th>Ticket</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td className="font-mono font-bold text-slate-900">{a.identifier}</td>
                    <td className="text-slate-600">{(a.fecha_generacion || a.fecha_referencia || '').slice(0, 10) || '—'}</td>
                    <td className="text-right font-bold">{a.total_documentos ?? a.detalles?.length ?? '—'}</td>
                    <td>
                      <EstadoBadge estado={a.estado_sunat} />
                      {a.sunat_description && (
                        <div className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate" title={a.sunat_description}>
                          {a.sunat_description}
                        </div>
                      )}
                    </td>
                    <td className="text-xs font-mono text-slate-500">{a.ticket || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {a.estado_sunat === 'pendiente' && (
                          <button
                            type="button"
                            onClick={() => enviarPendiente(a.id)}
                            disabled={sending === a.id}
                            className="text-green-700 hover:bg-green-50 px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1"
                          >
                            {sending === a.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Send className="w-3.5 h-3.5" />}
                            Enviar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => refrescar(a.id)}
                          disabled={refreshing === a.id}
                          className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1"
                        >
                          {refreshing === a.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <RefreshCcw className="w-3.5 h-3.5" />}
                          Refrescar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <NuevaAnulacionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadAnulaciones(); }}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Modal: Nueva Anulación
// ──────────────────────────────────────────────────────────────────────────────
function detalleVacio() {
  return { tipo_documento: '01', serie: '', correlativo: '', motivo: '' };
}

function NuevaAnulacionModal({ onClose, onSuccess }) {
  const [fechaGen, setFechaGen] = useState(TODAY);
  const [fechaCom, setFechaCom] = useState(TODAY);
  const [detalles, setDetalles] = useState([detalleVacio()]);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  function addDetalle() {
    setDetalles([...detalles, detalleVacio()]);
  }

  function removeDetalle(idx) {
    setDetalles(detalles.filter((_, i) => i !== idx));
  }

  function updateDetalle(idx, field, value) {
    const updated = [...detalles];
    updated[idx] = { ...updated[idx], [field]: value };
    setDetalles(updated);
  }

  async function submit() {
    setError(null);
    if (detalles.length === 0) { setError('Agrega al menos un documento.'); return; }
    const invalid = detalles.find((d) => !d.serie.trim() || !d.correlativo.trim() || !d.motivo.trim());
    if (invalid) { setError('Completa todos los campos de cada documento (serie, correlativo y motivo).'); return; }

    const payload = {
      fecha_generacion: fechaGen,
      fecha_comunicacion: fechaCom,
      detalles: detalles.map((d) => ({
        tipo_documento: d.tipo_documento,
        serie: d.serie.trim().toUpperCase(),
        correlativo: String(parseInt(d.correlativo.trim(), 10) || d.correlativo.trim()),
        motivo: d.motivo.trim(),
      })),
    };

    setSending(true);
    try {
      const res = await api.crearAnulacion(payload);
      setResponse(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (response) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
          <div className="flex items-center gap-2 text-green-700 font-extrabold uppercase text-xs tracking-wider mb-2">
            <CheckCircle2 className="w-5 h-5" /> Anulación creada
          </div>
          <h2 className="text-lg font-bold mb-3">{response.message}</h2>
          <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Identificador:</span>
              <span className="font-mono font-bold">{response.data?.identifier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Documentos:</span>
              <span className="font-bold">{response.data?.total_documentos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estado:</span>
              <EstadoBadge estado={response.data?.estado_sunat} />
            </div>
            {response.data?.ticket && (
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket SUNAT:</span>
                <span className="font-mono text-xs">{response.data.ticket}</span>
              </div>
            )}
          </div>
          <button onClick={onSuccess} className="btn-primary w-full mt-4">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" /> Nueva Anulación
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-auto flex-1 space-y-4">
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de generación</label>
              <input
                type="date"
                className="input"
                value={fechaGen}
                max={TODAY}
                onChange={(e) => { setFechaGen(e.target.value); setFechaCom(e.target.value); }}
              />
            </div>
            <div>
              <label className="label">Fecha de comunicación</label>
              <input
                type="date"
                className="input"
                value={fechaCom}
                max={TODAY}
                onChange={(e) => setFechaCom(e.target.value)}
              />
            </div>
          </div>

          {/* Detalles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Documentos a anular</label>
              <button type="button" onClick={addDetalle} className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Agregar documento
              </button>
            </div>

            <div className="space-y-2">
              {detalles.map((d, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex gap-2 flex-wrap items-end">
                    <div style={{ flex: '0 0 9rem' }}>
                      <label className="label text-xs">Tipo doc.</label>
                      <select
                        className="input text-sm"
                        value={d.tipo_documento}
                        onChange={(e) => updateDetalle(idx, 'tipo_documento', e.target.value)}
                      >
                        {TIPOS_DOC.map((t) => (
                          <option key={t.cod} value={t.cod}>{t.cod} – {t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: '0 0 6rem' }}>
                      <label className="label text-xs">Serie</label>
                      <input
                        className="input font-mono text-sm"
                        placeholder="F001"
                        maxLength={4}
                        value={d.serie}
                        onChange={(e) => updateDetalle(idx, 'serie', e.target.value.toUpperCase())}
                      />
                    </div>
                    <div style={{ flex: '0 0 6rem' }}>
                      <label className="label text-xs">Correlativo</label>
                      <input
                        className="input text-sm"
                        placeholder="123"
                        value={d.correlativo}
                        onChange={(e) => updateDetalle(idx, 'correlativo', e.target.value)}
                      />
                    </div>
                    <div className="flex-1" style={{ minWidth: '8rem' }}>
                      <label className="label text-xs">Motivo</label>
                      <input
                        className="input text-sm"
                        placeholder="Error en datos del cliente"
                        maxLength={255}
                        value={d.motivo}
                        onChange={(e) => updateDetalle(idx, 'motivo', e.target.value)}
                      />
                    </div>
                    {detalles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDetalle(idx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Plazo máximo: 7 días desde la fecha de emisión del documento original.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        <div className="p-4 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
          <button type="button" onClick={submit} disabled={sending} className="btn-danger text-sm">
            {sending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
              : <><Ban className="w-4 h-4" /> Enviar Anulación</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    enviado: 'bg-blue-100 text-blue-800',
    procesando: 'bg-blue-100 text-blue-800',
    aceptado: 'bg-green-100 text-green-800',
    rechazado: 'bg-red-100 text-red-800',
    anulado: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`badge ${colors[estado] || 'bg-slate-100 text-slate-600'}`}>
      {estado || '—'}
    </span>
  );
}
