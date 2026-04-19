export function fmtMoney(value, moneda = 'PEN') {
  const n = parseFloat(value) || 0;
  const simbolo = moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : 'S/';
  return `${simbolo} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtNumber(value, decimals = 2) {
  const n = parseFloat(value) || 0;
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
