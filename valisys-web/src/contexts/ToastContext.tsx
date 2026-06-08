import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

type ToastItem = { id: number; message: string };

type ToastContextValue = { showToast: (message?: string) => void };

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message = 'Alteração realizada com sucesso') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            style={{ animation: 'toast-in 0.25s ease' }}
            className="pointer-events-auto flex items-start gap-3 w-80 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3"
          >
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm text-gray-700 leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
