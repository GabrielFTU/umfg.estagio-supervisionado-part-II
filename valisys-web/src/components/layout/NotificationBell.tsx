import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { fetchWithAuth } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';

type NotificacaoItem = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  ordemDeProducaoId: string | null;
  criadoEm: string;
};

const POLL_INTERVAL_MS = 20000;
const STORAGE_KEY = 'ultimaVisualizacaoNotificacoes';

// O backend serializa CriadoEm sem sufixo de timezone (ex.: "2026-07-06T18:35:00.123").
// Sem o "Z", o JS interpretaria a string como horário local em vez de UTC.
function parseUtc(dataIso: string): number {
  const comFuso = /Z$|[+-]\d\d:\d\d$/.test(dataIso) ? dataIso : `${dataIso}Z`;
  return new Date(comFuso).getTime();
}

function tempoRelativo(dataIso: string): string {
  const diffMs = Date.now() - parseUtc(dataIso);
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `há ${diffHoras}h`;
  const diffDias = Math.floor(diffHoras / 24);
  return `há ${diffDias}d`;
}

export function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ultimaVisualizacao, setUltimaVisualizacao] = useState(() => Number(localStorage.getItem(STORAGE_KEY) ?? 0));
  const conhecidosRef = useRef<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const poll = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/notificacoes');
      if (!res.ok) return;
      const data: NotificacaoItem[] = await res.json();

      if (conhecidosRef.current.size > 0) {
        for (const n of data) {
          if (!conhecidosRef.current.has(n.id)) {
            showToast(n.mensagem, 'info');
          }
        }
      }
      conhecidosRef.current = new Set(data.map(n => n.id));

      setNotificacoes(data);
    } catch {
      // Falha de rede no polling é silenciosa — próxima tentativa em breve.
    }
  }, [showToast]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggleOpen = () => {
    setOpen(v => !v);
    if (!open) {
      const agora = Date.now();
      localStorage.setItem(STORAGE_KEY, String(agora));
      setUltimaVisualizacao(agora);
    }
  };

  const naoLidas = notificacoes.filter(n => parseUtc(n.criadoEm) > ultimaVisualizacao).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Bell size={20} />
        {naoLidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-300 rounded-full border border-[#FFDE21]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white rounded-xl border border-gray-100 shadow-xl shadow-black/10 overflow-hidden z-50"
          >
            <div className="px-4 py-3 bg-gray-50/70 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Notificações</p>
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notificacoes.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">Nenhuma notificação ainda.</p>
              ) : (
                notificacoes.map(n => (
                  <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors">
                    <p className="text-sm font-medium text-gray-800">{n.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.mensagem}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{tempoRelativo(n.criadoEm)}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
