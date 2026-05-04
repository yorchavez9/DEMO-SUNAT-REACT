const FORMATS = [
  { value: 'ticket-80', label: 'Ticket 80mm' },
  { value: 'ticket-58', label: 'Ticket 58mm' },
  { value: 'a5', label: 'A5' },
  { value: 'a4', label: 'A4' },
];

export default function PdfFormatPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formato PDF:</span>
      {FORMATS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            value === f.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
