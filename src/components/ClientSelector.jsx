import { useState } from 'react';
import { api } from '../api/client.js';
import { Search, X, Loader2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';

const TIPOS_DOC = [
  { cod: '6', label: 'RUC' },
  { cod: '1', label: 'DNI' },
  { cod: '4', label: 'Carnet de extranjería' },
  { cod: '7', label: 'Pasaporte' },
  { cod: '0', label: 'Otros' },
];

const MANUAL_EMPTY = { tipo_doc: '6', num_doc: '', razon_social: '', direccion: '' };

export default function ClientSelector({ cliente, onChange, placeholder = 'Ingrese RUC o DNI...' }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ ...MANUAL_EMPTY });

  async function buscar() {
    const numero = query.trim();
    if (!/^\d{8,11}$/.test(numero)) {
      setError('Ingresa un DNI (8 dígitos) o RUC (11 dígitos).');
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const res = await api.buscarDocumento(numero.length === 11 ? '6' : '1', numero);
      onChange(res.data);
      setQuery('');
    } catch (e) {
      setError(e.message || 'No se encontró el documento.');
    } finally {
      setSearching(false);
    }
  }

  function confirmarManual(e) {
    e.preventDefault();
    onChange({ ...manual });
    setShowManual(false);
    setManual({ ...MANUAL_EMPTY });
  }

  function abrirManual() {
    setManual({ ...MANUAL_EMPTY });
    setShowManual(true);
  }

  if (cliente) {
    const tipoLabel = cliente.tipo_doc === '6' ? 'RUC' : cliente.tipo_doc === '1' ? 'DNI' : 'S/D';
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wide">
            {tipoLabel} {cliente.num_doc}
          </div>
          <div className="text-sm font-semibold text-slate-900 truncate">{cliente.razon_social}</div>
          {cliente.direccion && (
            <div className="text-xs text-slate-400 truncate">{cliente.direccion}</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="Cambiar cliente"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            value={query}
            onChange={(e) => { setQuery(e.target.value.replace(/\D/g, '')); setError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscar(); } }}
            placeholder={placeholder}
            maxLength={11}
          />
          <button
            type="button"
            onClick={buscar}
            disabled={searching}
            className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
          >
            {searching
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
              : <><Search className="w-4 h-4" /> Buscar</>}
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-sm text-red-600 px-0.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
        <button
          type="button"
          onClick={abrirManual}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mt-0.5"
        >
          <UserPlus className="w-3.5 h-3.5" /> Ingresar datos manualmente
        </button>
      </div>

      {showManual && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowManual(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" /> Ingresar cliente manualmente
              </h2>
              <button
                type="button"
                onClick={() => setShowManual(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={confirmarManual} className="p-4 space-y-3">
              <div className="flex gap-3">
                <div style={{ flex: '0 0 auto', width: '11rem' }}>
                  <label className="label">Tipo de doc.</label>
                  <select
                    className="input"
                    value={manual.tipo_doc}
                    onChange={(e) => setManual({ ...manual, tipo_doc: e.target.value })}
                  >
                    {TIPOS_DOC.map((t) => (
                      <option key={t.cod} value={t.cod}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="label">N° de documento</label>
                  <input
                    className="input font-mono"
                    value={manual.num_doc}
                    onChange={(e) => setManual({ ...manual, num_doc: e.target.value.replace(/\D/g, '') })}
                    placeholder="20xxxxxxxxx"
                    maxLength={11}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Razón social / Nombre</label>
                <input
                  className="input"
                  value={manual.razon_social}
                  onChange={(e) => setManual({ ...manual, razon_social: e.target.value.toUpperCase() })}
                  placeholder="EMPRESA S.A.C."
                  required
                />
              </div>

              <div>
                <label className="label">Dirección <span className="text-slate-400 font-normal">(opcional)</span></label>
                <input
                  className="input"
                  value={manual.direccion}
                  onChange={(e) => setManual({ ...manual, direccion: e.target.value })}
                  placeholder="Av. Example 123, Lima"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setShowManual(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
