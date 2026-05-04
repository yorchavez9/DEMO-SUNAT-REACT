import { useEffect, useRef, useState } from 'react';
import { XCircle, X, Loader2 } from 'lucide-react';
import { api } from '../api/client.js';

export default function ResponseModal({ response, error, onClose, tipo, pdfFormat = 'ticket-80' }) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const lastBlobRef = useRef(null);

  const success = !error && response?.success;
  const data = response?.data;
  const docId = data?.id;
  const canShowPdf = success && docId && tipo;

  useEffect(() => {
    return () => {
      if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
    };
  }, []);

  useEffect(() => {
    if (canShowPdf) {
      setPdfBlobUrl(null);
      setLoadingPdf(true);
      api.descargarPdf(tipo, docId, pdfFormat)
        .then((blob) => {
          if (lastBlobRef.current) URL.revokeObjectURL(lastBlobRef.current);
          const url = URL.createObjectURL(blob);
          lastBlobRef.current = url;
          setPdfBlobUrl(url);
        })
        .catch((e) => console.error('Error cargando PDF:', e))
        .finally(() => setLoadingPdf(false));
    }
  }, [canShowPdf, docId, tipo]);

  if (!response && !error) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl h-[92vh]">

        <button
          onClick={onClose}
          className="absolute top-3 -right-12 z-20 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-white rounded-2xl w-full h-full flex flex-col shadow-2xl overflow-hidden">

        {canShowPdf ? (
          <div className="flex-1 relative min-h-0">
            {loadingPdf && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              </div>
            )}
            {pdfBlobUrl && (
              <iframe src={pdfBlobUrl} title="PDF" className="w-full h-full border-0" />
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
            <XCircle className="w-10 h-10 text-red-500" />
            <p className="text-slate-700 font-semibold">
              {error?.message || 'Error desconocido'}
            </p>
            {error?.errors && (
              <pre className="text-xs text-red-600 bg-red-50 rounded-lg p-3 text-left max-h-60 overflow-auto w-full font-mono">
                {JSON.stringify(error.errors, null, 2)}
              </pre>
            )}
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
