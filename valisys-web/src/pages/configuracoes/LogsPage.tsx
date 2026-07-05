import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { fetchWithAuth } from '@/services/api';

interface LogItem {
  id: string;
  usuarioNome: string;
  acao: string;
  modulo: string;
  detalhes: string;
  dataHora: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

function iniciais(nome: string): string {
  return nome.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function acaoBadge(acao: string) {
  const a = acao.toLowerCase();
  if (a.includes('cri') || a.includes('cadastr')) return 'bg-emerald-50 text-emerald-700';
  if (a.includes('edi') || a.includes('atualiz')) return 'bg-blue-50 text-blue-700';
  if (a.includes('exclu') || a.includes('desativ') || a.includes('cancel')) return 'bg-red-50 text-red-700';
  if (a.includes('reativ') || a.includes('ativ')) return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-4 sm:px-6 py-3.5"><div className="h-3.5 w-28 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5"><div className="h-3 w-24 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5 hidden sm:table-cell"><div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3 w-20 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5"><div className="h-3 w-48 rounded bg-gray-100 animate-pulse" /></td>
        </tr>
      ))}
    </>
  );
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState('todos');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moduloFiltro !== 'todos') params.set('modulo', moduloFiltro);
      if (de) params.set('de', de);
      if (ate) params.set('ate', ate);

      const res = await fetchWithAuth(`/api/LogsSistema?${params}`);
      if (res.status === 403) { setLogs([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      setLogs(data.map(l => ({
        id: l.id,
        usuarioNome: l.usuarioNome ?? 'Sistema',
        acao: l.acao ?? '',
        modulo: l.modulo ?? '',
        detalhes: l.detalhes ?? '',
        dataHora: l.dataHora,
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [moduloFiltro, de, ate]);

  const modulosDisponiveis = useMemo(
    () => Array.from(new Set(logs.map(l => l.modulo))).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [logs],
  );

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.acao.toLowerCase().includes(q)
        || l.detalhes.toLowerCase().includes(q)
        || l.usuarioNome.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const filtrosAtivos = moduloFiltro !== 'todos' || !!de || !!ate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col h-full bg-white"
    >
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Ação, usuário ou detalhes"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div ref={filterRef} className="relative shrink-0">
            <button onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
                filtrosAtivos
                  ? 'border-[#1D4E89] bg-blue-50 text-[#1D4E89]'
                  : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
              )}>
              <SlidersHorizontal size={15} />
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  onMouseDown={e => e.stopPropagation()}
                  className="absolute z-30 right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Módulo</p>
                    <select
                      value={moduloFiltro}
                      onChange={e => { setModuloFiltro(e.target.value); setPage(1); }}
                      className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#1D4E89]"
                    >
                      <option value="todos">Todos</option>
                      {modulosDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Período</p>
                    <div className="flex items-center gap-2">
                      <DatePicker value={de} onChange={v => { setDe(v); setPage(1); }} />
                      <span className="text-xs text-gray-400 shrink-0">até</span>
                      <DatePicker value={ate} onChange={v => { setAte(v); setPage(1); }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {filtrosAtivos && (
        <div className="px-4 sm:px-6 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {moduloFiltro !== 'todos' && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Módulo : {moduloFiltro}
              <button onClick={() => setModuloFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {(de || ate) && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Período : {de || '...'} até {ate || '...'}
              <button onClick={() => { setDe(''); setAte(''); }} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left font-semibold text-gray-700 px-4 sm:px-6 py-3 whitespace-nowrap">Data/Hora</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3">Usuário</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden sm:table-cell">Ação</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden md:table-cell">Módulo</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <ScrollText size={28} className="text-gray-200" />
                    Nenhum registro de log encontrado.
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {paginated.map((l, i) => (
                  <motion.tr key={l.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.3) }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 tabular-nums whitespace-nowrap">
                      {fmtDateTime(l.dataHora)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white bg-gradient-to-br from-blue-400 to-blue-600">
                          {iniciais(l.usuarioNome)}
                        </div>
                        <span className="text-sm text-gray-700 truncate max-w-[140px]">{l.usuarioNome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap', acaoBadge(l.acao))}>
                        {l.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">{l.modulo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="truncate max-w-[420px]" title={l.detalhes}>{l.detalhes}</div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span className="mr-4">Exibindo {filtered.length} registro{filtered.length !== 1 ? 's' : ''}.</span>
          <button onClick={() => goPage(1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
          <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 3, totalPages - 6));
            return start + i;
          }).filter(p => p <= totalPages).map(p => (
            <button key={p} onClick={() => goPage(p)}
              className={cn('w-7 h-7 rounded-full text-sm transition-colors', p === page ? 'bg-blue-100 text-[#1D4E89] font-semibold' : 'hover:bg-gray-100')}>
              {p}
            </button>
          ))}
          <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>'}</button>
          <button onClick={() => goPage(totalPages)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>>'}</button>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="ml-2 border border-gray-300 rounded text-xs px-1 py-0.5 outline-none focus:border-[#1D4E89]">
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
    </motion.div>
  );
}
