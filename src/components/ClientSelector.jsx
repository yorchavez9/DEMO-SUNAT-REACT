import { useState } from 'react';
import { api } from '../api/client.js';
import { Search, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ClientSelector({ cliente, onChange, placeholder = 'Ingrese RUC o DNI...' }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

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
    </div>
  );
}
