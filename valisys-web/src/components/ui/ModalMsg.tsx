import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variante = 'perigo' | 'aviso' | 'info';

interface ModalMsgProps {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  variante?: Variante;
  labelConfirmar?: string;
  labelCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const CONFIG: Record<Variante, {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  btnCls: string;
}> = {
  perigo: {
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    btnCls: 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-400',
  },
  aviso: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    btnCls: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#3B82F6]',
    btnCls: 'bg-[#3B82F6] hover:bg-[#2563eb] focus-visible:ring-blue-400',
  },
};

export function ModalMsg({
  aberto,
  titulo,
  descricao,
  variante = 'perigo',
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
}: ModalMsgProps) {
  const confirmarRef = useRef<HTMLButtonElement>(null);
  const { icon: Icon, iconBg, iconColor, btnCls } = CONFIG[variante];

  useEffect(() => {
    if (!aberto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [aberto, onCancelar]);

  useEffect(() => {
    if (aberto) confirmarRef.current?.focus();
  }, [aberto]);

  return (
    <AnimatePresence>
      {aberto && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
            onClick={onCancelar}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', iconBg)}>
                    <Icon size={17} className={iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{titulo}</p>
                    {descricao && (
                      <p className="mt-1 text-xs text-gray-500 leading-relaxed">{descricao}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCancelar}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 ml-2"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Ações */}
              <div className="flex gap-2 px-5 pb-5">
                <button
                  type="button"
                  onClick={onCancelar}
                  className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  {labelCancelar}
                </button>
                <button
                  ref={confirmarRef}
                  type="button"
                  onClick={onConfirmar}
                  className={cn(
                    'flex-1 h-9 rounded-lg text-sm text-white font-medium transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                    btnCls,
                  )}
                >
                  {labelConfirmar}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
