import { useState } from 'react';
import { api } from '../api/client.js';
import ProductPicker from '../components/ProductPicker.jsx';
import ClientPicker from '../components/ClientPicker.jsx';
import ItemsTable from '../components/ItemsTable.jsx';
import ResponseModal from '../components/ResponseModal.jsx';
import PdfFormatPicker from '../components/PdfFormatPicker.jsx';
import { Receipt, Plus, Loader2, UserX, Save, Send, X } from 'lucide-react';
import ClientSelector from '../components/ClientSelector.jsx';

export default function NewBoleta() {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    serie: 'B001',
    fecha_emision: today,
    tipo_moneda: 'PEN',
    forma_pago: 'Contado',
    observacion: '',
  });

  const [cliente, setCliente] = useState({
    tipo_doc: '0',
    num_doc: '-',
    razon_social: 'CLIENTES VARIOS',
  });
  const [items, setItems] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [pdfFormat, setPdfFormat] = useState('ticket-80');
  const [cuotas, setCuotas] = useState([]);

  function addCuota() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setCuotas([...cuotas, { fecha_pago: d.toISOString().split('T')[0], monto: '' }]);
  }
  function updateCuota(i, field, value) {
    const next = [...cuotas];
    next[i] = { ...next[i], [field]: value };
    setCuotas(next);
  }
  function removeCuota(i) {
    setCuotas(cuotas.filter((_, idx) => idx !== i));
  }

  function addProduct(p) {
    setItems([...items, {
      codigo: p.codigo,
      cod_producto_sunat: p.cod_producto_sunat,
      descripcion: p.descripcion,
      unidad: p.unidad,
      cantidad: 1,
      precio_unitario: p.precio_unitario,
      tip_afe_igv: p.tip_afe_igv || '10',
      ...(p.icbper ? { icbper: p.icbper, factor_icbper: p.factor_icbper } : {}),
    }]);
  }

  async function submit(soloRegistro = false) {
    if (items.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }
    if (form.forma_pago === 'Credito' && cuotas.length === 0) {
      alert('Agrega al menos una cuota para el pago a crédito');
      return;
    }

    const payload = {
      ...form,
      ...(form.forma_pago === 'Credito' ? { cuotas: cuotas.map((c) => ({ monto: parseFloat(c.monto), fecha_pago: c.fecha_pago })) } : {}),
      solo_registro: soloRegistro,
      cliente: {
        tipo_doc: cliente.tipo_doc,
        num_doc: cliente.num_doc,
        razon_social: cliente.razon_social,
        direccion: cliente.direccion || '',
      },
      items: items.map((it) => ({
        ...it,
        cantidad: parseFloat(it.cantidad),
        precio_unitario: parseFloat(it.precio_unitario),
      })),
    };

    setSending(true);
    setResponse(null);
    setError(null);

    try {
      const res = await api.crearBoleta(payload);
      setResponse(res);
      setItems([]);
      setForm({ ...form, observacion: '' });
    } catch (e) {
      setError(e);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">
        <Receipt className="w-7 h-7" />
        Nueva Boleta
      </h1>

      <form onSubmit={(e) => { e.preventDefault(); submit(true); }} className="space-y-6">
        <div className="card">
          <h2 className="section-title">Datos del documento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Serie</label>
              <input className="input font-mono" value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value.toUpperCase() })} maxLength={4} required />
            </div>
            <div>
              <label className="label">Fecha</label>
              <input type="date" className="input" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} required />
            </div>
            <div>
              <label className="label">Moneda</label>
              <select className="input" value={form.tipo_moneda} onChange={(e) => setForm({ ...form, tipo_moneda: e.target.value })}>
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="label">Forma de pago</label>
              <select className="input" value={form.forma_pago} onChange={(e) => setForm({ ...form, forma_pago: e.target.value })}>
                <option value="Contado">Contado</option>
                <option value="Credito">Crédito</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cuotas de pago */}
        {form.forma_pago === 'Credito' && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0">Cuotas de pago</h2>
              <button type="button" onClick={addCuota} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Agregar cuota
              </button>
            </div>
            {cuotas.length === 0 ? (
              <p className="text-sm text-slate-500">Agrega al menos una cuota.</p>
            ) : (
              <div className="space-y-2">
                {cuotas.map((c, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="label">Fecha pago</label>
                      <input type="date" className="input" value={c.fecha_pago}
                        onChange={(e) => updateCuota(i, 'fecha_pago', e.target.value)} required />
                    </div>
                    <div className="flex-1">
                      <label className="label">Monto</label>
                      <input type="number" className="input" value={c.monto}
                        onChange={(e) => updateCuota(i, 'monto', e.target.value)}
                        placeholder="0.00" min="0.01" step="0.01" required />
                    </div>
                    <button type="button" onClick={() => removeCuota(i)}
                      className="mb-0.5 p-2 text-red-500 hover:text-red-700 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h2 className="section-title">Cliente</h2>
          <ClientSelector
            cliente={cliente}
            onOpenPicker={() => setShowClientPicker(true)}
            onClear={() => setCliente({ tipo_doc: '0', num_doc: '-', razon_social: 'CLIENTES VARIOS' })}
            placeholder="Seleccionar cliente..."
          />
          <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
            <p className="text-xs text-slate-500">
              Opcional identificar al cliente si el monto es menor a S/ 700.
            </p>
            <button
              type="button"
              onClick={() => setCliente({ tipo_doc: '0', num_doc: '-', razon_social: 'CLIENTES VARIOS' })}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
            >
              <UserX className="w-3.5 h-3.5" /> Usar cliente anónimo
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Productos</h2>
            <button type="button" onClick={() => setShowProductPicker(true)} className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Agregar producto
            </button>
          </div>
          <ItemsTable items={items} onChange={setItems} moneda={form.tipo_moneda} />
        </div>

        <div className="card">
          <label className="label">Observaciones</label>
          <textarea className="input" rows={2} value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} />
        </div>

        <div className="card bg-blue-50">
          <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">¿Cómo emitir esta boleta?</div>
          <p className="text-xs text-slate-600 mb-3">
            Lo más común es <strong>solo guardarla</strong> y al final del día enviar todas en lote vía Resumen Diario.
            Si necesitas enviarla a SUNAT inmediatamente, usa "Enviar a SUNAT".
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <PdfFormatPicker value={pdfFormat} onChange={setPdfFormat} />
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={sending}
                className="btn-secondary"
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Solo guardar (pendiente)</>}
              </button>
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={sending}
                className="btn-primary"
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar a SUNAT ahora</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {showProductPicker && <ProductPicker onSelect={addProduct} onClose={() => setShowProductPicker(false)} />}
      {showClientPicker && <ClientPicker onSelect={setCliente} onClose={() => setShowClientPicker(false)} />}
      {(response || error) && (
        <ResponseModal response={response} error={error} tipo="boletas" pdfFormat={pdfFormat} onClose={() => { setResponse(null); setError(null); }} />
      )}
    </div>
  );
}
