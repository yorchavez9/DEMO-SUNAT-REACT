import { X } from 'lucide-react';

export const SUNAT_UNITS = [
  { cod: 'NIU', sym: 'UND', desc: 'Unidad' },
  { cod: 'ZZ',  sym: 'SERV', desc: 'Servicio' },
  { cod: 'HUR', sym: 'HR',   desc: 'Hora' },
  { cod: 'BX',  sym: 'CAJ',  desc: 'Caja' },
  { cod: 'GLL', sym: 'GL',   desc: 'Galón' },
  { cod: 'GRM', sym: 'GR',   desc: 'Gramos' },
  { cod: 'KGM', sym: 'KG',   desc: 'Kilos' },
  { cod: 'LTR', sym: 'LT',   desc: 'Litro' },
  { cod: 'MTR', sym: 'M',    desc: 'Metro' },
  { cod: 'FOT', sym: 'PIE',  desc: 'Pies' },
  { cod: 'INH', sym: 'INCH', desc: 'Pulgadas' },
  { cod: 'YRD', sym: 'YD',   desc: 'Yarda' },
  { cod: 'TNE', sym: 'TNL',  desc: 'Toneladas' },
  { cod: 'DZN', sym: 'DOC',  desc: 'Docena' },
  { cod: 'QD',  sym: '1/4 DOC', desc: 'Cuarto de docena' },
  { cod: 'PK',  sym: 'PQT',  desc: 'Paquete' },
  { cod: 'MTQ', sym: 'M3',   desc: 'Metro cúbico' },
  { cod: 'HD',  sym: '1/2 DOC', desc: 'Media docena' },
  { cod: 'PR',  sym: 'PAR',  desc: 'Par' },
  { cod: 'JG',  sym: 'JARR', desc: 'Jarra' },
  { cod: 'JR',  sym: 'FCO',  desc: 'Frasco' },
  { cod: 'KT',  sym: 'KIT',  desc: 'Kit' },
  { cod: 'CH',  sym: 'ENV',  desc: 'Envase' },
  { cod: 'AV',  sym: 'CAPS', desc: 'Cápsula' },
  { cod: 'CT',  sym: 'CTON', desc: 'Cartón' },
  { cod: 'CY',  sym: 'CIL',  desc: 'Cilindro' },
  { cod: 'BE',  sym: 'FARD', desc: 'Fardo' },
  { cod: 'BG',  sym: 'BOLS', desc: 'Bolsa' },
  { cod: 'BJ',  sym: 'BALD', desc: 'Balde' },
  { cod: 'SET', sym: 'JGO',  desc: 'Juego' },
  { cod: 'BLL', sym: 'BRL',  desc: 'Barril' },
  { cod: 'RM',  sym: 'RESM', desc: 'Resma' },
  { cod: 'BO',  sym: 'BOT',  desc: 'Botellas' },
  { cod: 'SA',  sym: 'SCO',  desc: 'Saco' },
  { cod: 'BT',  sym: 'TORN', desc: 'Tornillo' },
  { cod: 'C62', sym: 'PZ',   desc: 'Piezas' },
  { cod: 'U2',  sym: 'BLIST', desc: 'Tableta o blister' },
  { cod: 'CA',  sym: 'LT',   desc: 'Latas' },
  { cod: 'CEN', sym: 'CTO',  desc: 'Centenar o ciento' },
  { cod: 'CMT', sym: 'CM',   desc: 'Centímetro' },
  { cod: 'CMK', sym: 'CM2',  desc: 'Centímetro cuadrado' },
  { cod: 'CMQ', sym: 'CM3',  desc: 'Centímetro cúbico' },
  { cod: 'DZP', sym: 'DOC2', desc: 'Docena de paquetes' },
  { cod: 'FTK', sym: 'PIE2', desc: 'Pies cuadrados' },
  { cod: 'FTQ', sym: 'PIE3', desc: 'Pies cúbicos' },
  { cod: 'GLI', sym: 'GL',   desc: 'Galón inglés' },
  { cod: 'HT',  sym: '1/2 H', desc: 'Media hora' },
  { cod: 'KTM', sym: 'KM',   desc: 'Kilómetro' },
  { cod: 'KWH', sym: 'KWxH', desc: 'Kilovatio hora' },
  { cod: 'MWH', sym: 'MWxH', desc: 'Megavatio hora' },
  { cod: 'LBR', sym: 'LB',   desc: 'Libras' },
  { cod: 'LEF', sym: 'HOJA', desc: 'Hoja' },
  { cod: 'MGM', sym: 'MG',   desc: 'Miligramos' },
  { cod: 'MIL', sym: 'MIL',  desc: 'Millar' },
  { cod: 'MLT', sym: 'ML',   desc: 'Mililitro' },
  { cod: 'MMT', sym: 'MM',   desc: 'Milímetro' },
  { cod: 'MMK', sym: 'MM2',  desc: 'Milímetro cuadrado' },
  { cod: 'MMQ', sym: 'MM3',  desc: 'Milímetro cúbico' },
  { cod: 'MTK', sym: 'M2',   desc: 'Metro cuadrado' },
  { cod: 'ONZ', sym: 'ONZ',  desc: 'Onzas' },
  { cod: 'PF',  sym: 'PAL',  desc: 'Paletas' },
  { cod: 'PG',  sym: 'PLAC', desc: 'Placas' },
  { cod: 'RD',  sym: 'VAR',  desc: 'Varilla' },
  { cod: 'RL',  sym: 'CRR',  desc: 'Carrete' },
  { cod: 'SEC', sym: 'SEG',  desc: 'Segundo' },
  { cod: 'ST',  sym: 'PLGO', desc: 'Pliego' },
  { cod: 'TU',  sym: 'TB',   desc: 'Tubos' },
  { cod: 'UM',  sym: 'MILL', desc: 'Millón' },
];

export default function ItemsTable({ items, onChange, moneda = 'PEN', showDescuentos = false }) {
  const simbolo = moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : 'S/';

  function updateItem(idx, field, value) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  }

  function removeItem(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }

  const totales = items.reduce((acc, it) => {
    const cantidad = parseFloat(it.cantidad) || 0;
    const precio = parseFloat(it.precio_unitario) || 0;
    const descuento = showDescuentos ? (parseFloat(it.descuento_monto) || 0) : 0;
    const subtotal = cantidad * precio - descuento;
    const afe = it.tip_afe_igv || '10';
    if (afe === '10') {
      const bg = subtotal / 1.18;
      acc.baseGravada += bg;
      acc.igv += subtotal - bg;
    } else if (afe === '20' || afe === '30') {
      acc.baseNoGravada += subtotal;
    }
    acc.subtotal += subtotal;
    return acc;
  }, { subtotal: 0, baseGravada: 0, baseNoGravada: 0, igv: 0 });

  return (
    <div>
      {items.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl font-medium">
          Sin productos. Haz clic en "Agregar producto" arriba.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table-std min-w-[700px]">
            <thead>
              <tr>
                <th>Descripción</th>
                <th className="w-32">Und</th>
                <th className="w-24 text-right">Cantidad</th>
                <th className="w-28 text-right">Precio Unit.</th>
                <th className="w-28">IGV</th>
                {showDescuentos && <th className="w-24 text-right text-orange-600">Desc.</th>}
                <th className="w-28 text-right">Total</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const subtotal = (parseFloat(it.cantidad) || 0) * (parseFloat(it.precio_unitario) || 0);
                const descuento = showDescuentos ? (parseFloat(it.descuento_monto) || 0) : 0;
                const total = subtotal - descuento;
                return (
                  <tr key={idx}>
                    <td>
                      <input
                        className="input-inline"
                        value={it.descripcion || ''}
                        onChange={(e) => updateItem(idx, 'descripcion', e.target.value)}
                      />
                      {it.codigo && <div className="text-xs text-slate-400 px-2 font-semibold mt-0.5">{it.codigo}</div>}
                    </td>
                    <td>
                      <select
                        className="input-inline text-xs"
                        value={it.unidad || 'NIU'}
                        onChange={(e) => updateItem(idx, 'unidad', e.target.value)}
                      >
                        {SUNAT_UNITS.map((u) => (
                          <option key={u.cod} value={u.cod}>{u.cod} - {u.sym}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="any"
                        className="input-inline text-right"
                        value={it.cantidad || ''}
                        onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="any"
                        className="input-inline text-right"
                        value={it.precio_unitario || ''}
                        onChange={(e) => updateItem(idx, 'precio_unitario', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="input-inline text-xs"
                        value={it.tip_afe_igv || '10'}
                        onChange={(e) => updateItem(idx, 'tip_afe_igv', e.target.value)}
                      >
                        <option value="10">Gravado</option>
                        <option value="20">Exonerado</option>
                        <option value="30">Inafecto</option>
                        <option value="40">Exportación</option>
                      </select>
                    </td>
                    {showDescuentos && (
                      <td>
                        <input
                          type="number" min="0" step="0.01"
                          className="input-inline text-right text-orange-600"
                          placeholder="0.00"
                          value={it.descuento_monto || ''}
                          onChange={(e) => updateItem(idx, 'descuento_monto', e.target.value)}
                        />
                      </td>
                    )}
                    <td className="text-right font-bold text-slate-900">{simbolo} {total.toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-5 flex justify-end">
          <div className="w-full sm:w-80 bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            {totales.baseGravada > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Op. Gravadas:</span>
                <span className="font-semibold">{simbolo} {totales.baseGravada.toFixed(2)}</span>
              </div>
            )}
            {totales.baseNoGravada > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Op. Exoneradas/Inafectas:</span>
                <span className="font-semibold">{simbolo} {totales.baseNoGravada.toFixed(2)}</span>
              </div>
            )}
            {totales.igv > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">IGV (18%):</span>
                <span className="font-semibold">{simbolo} {totales.igv.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 mt-2 text-lg border-t border-slate-200">
              <span className="font-extrabold text-slate-900">TOTAL ítems:</span>
              <span className="font-extrabold text-blue-600">{simbolo} {totales.subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
