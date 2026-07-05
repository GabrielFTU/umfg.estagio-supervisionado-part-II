import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, Scale, SlidersHorizontal, X, ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { fetchWithAuth } from '@/services/api';

interface CarteiraOpt {
  id: string;
  nome: string;
  saldoAtual: number;
  ativo: boolean;
}

interface MovimentacaoItem {
  id: string;
  carteiraId: string;
  carteiraNome: string;
  tipo: string;
  origem: string;
  valor: number;
  dataMovimentacao: string;
  descricao: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

function StatCard({ label, value, icon: Icon, tone }: {
  label: string; value: string; icon: React.ElementType; tone: 'blue' | 'emerald' | 'red' | 'neutral';
}) {
  const toneCfg = {
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    text: 'text-gray-900' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-600' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-500',     text: 'text-red-500' },
    neutral: { bg: 'bg-gray-50',    icon: 'text-gray-500',    text: 'text-gray-900' },
  }[tone];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', toneCfg.bg)}>
        <Icon size={18} className={toneCfg.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5 truncate">{label}</p>
        <p className={cn('text-lg font-bold truncate', toneCfg.text)}>{value}</p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-4 sm:px-6 py-3.5"><div className="h-3.5 w-24 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5"><div className="h-3 w-28 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5 hidden sm:table-cell"><div className="h-3 w-40 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-5 w-20 rounded-full bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5 text-right"><div className="h-3 w-16 rounded bg-gray-100 animate-pulse ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export function FluxoCaixaPage() {
  const [carteiras, setCarteiras] = useState<CarteiraOpt[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [carteiraFiltro, setCarteiraFiltro] = useState('todas');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'Credito' | 'Debito'>('todos');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWithAuth('/api/carteiras')
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setCarteiras(d.map(c => ({
        id: c.id,
        nome: `${c.codigoBanco} - ${c.nomeBanco}`,
        saldoAtual: c.saldoAtual ?? 0,
        ativo: c.ativo,
      }))));
  }, []);

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
      if (carteiraFiltro !== 'todas') params.set('carteiraId', carteiraFiltro);
      if (tipoFiltro !== 'todos') params.set('tipo', tipoFiltro);
      if (de) params.set('de', de);
      if (ate) params.set('ate', ate);

      const res = await fetchWithAuth(`/api/carteiras/movimentacoes?${params}`);
      if (res.status === 403) { setMovimentacoes([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      setMovimentacoes(data.map(m => ({
        id: m.id,
        carteiraId: m.carteiraId,
        carteiraNome: m.carteiraNome ?? '—',
        tipo: m.tipo,
        origem: m.origem,
        valor: m.valor ?? 0,
        dataMovimentacao: m.dataMovimentacao,
        descricao: m.descricao ?? '',
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [carteiraFiltro, tipoFiltro, de, ate]);

  const saldoTotal = useMemo(
    () => carteiras.filter(c => c.ativo).reduce((sum, c) => sum + c.saldoAtual, 0),
    [carteiras],
  );

  const { entradas, saidas } = useMemo(() => {
    let entradas = 0, saidas = 0;
    for (const m of movimentacoes) {
      if (m.tipo === 'Credito') entradas += m.valor;
      else saidas += m.valor;
    }
    return { entradas, saidas };
  }, [movimentacoes]);

  const totalPages = Math.max(1, Math.ceil(movimentacoes.length / pageSize));
  const paginated = movimentacoes.slice((page - 1) * pageSize, page * pageSize);
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const filtrosAtivos = carteiraFiltro !== 'todas' || tipoFiltro !== 'todos' || !!de || !!ate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col h-full bg-[#f8f9fb]"
    >
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900 mb-4">Fluxo de Caixa</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Saldo total em caixa" value={fmtBRL(saldoTotal)} icon={Wallet} tone="blue" />
          <StatCard label="Entradas no período" value={fmtBRL(entradas)} icon={ArrowUpCircle} tone="emerald" />
          <StatCard label="Saídas no período" value={fmtBRL(saidas)} icon={ArrowDownCircle} tone="red" />
          <StatCard label="Resultado do período" value={fmtBRL(entradas - saidas)} icon={Scale} tone={entradas - saidas >= 0 ? 'emerald' : 'red'} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500">Extrato consolidado</span>

        <div ref={filterRef} className="relative shrink-0">
          <button onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-semibold transition-colors',
              filtrosAtivos
                ? 'border-[#1D4E89] bg-blue-50 text-[#1D4E89]'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
            )}>
            <SlidersHorizontal size={13} />
            Filtros
          </button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                onMouseDown={e => e.stopPropagation()}
                className="absolute z-30 right-0 top-full mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Carteira</p>
                  <select
                    value={carteiraFiltro}
                    onChange={e => { setCarteiraFiltro(e.target.value); setPage(1); }}
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#1D4E89]"
                  >
                    <option value="todas">Todas</option>
                    {carteiras.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Tipo</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['todos', 'Credito', 'Debito'] as const).map(t => (
                      <button key={t} onClick={() => { setTipoFiltro(t); setPage(1); }}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                          tipoFiltro === t
                            ? 'border-blue-400 bg-blue-50 text-blue-800'
                            : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
                        )}>
                        {t === 'todos' ? 'Todos' : t === 'Credito' ? 'Entrada' : 'Saída'}
                      </button>
                    ))}
                  </div>
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

      {filtrosAtivos && (
        <div className="px-6 py-2 border-b border-gray-100 bg-white flex items-center gap-2 flex-wrap">
          {carteiraFiltro !== 'todas' && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Carteira : {carteiras.find(c => c.id === carteiraFiltro)?.nome ?? '—'}
              <button onClick={() => setCarteiraFiltro('todas')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {tipoFiltro !== 'todos' && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Tipo : {tipoFiltro === 'Credito' ? 'Entrada' : 'Saída'}
              <button onClick={() => setTipoFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
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

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left font-semibold text-gray-700 px-4 sm:px-6 py-3 whitespace-nowrap">Data</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3">Carteira</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden sm:table-cell">Descrição</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden md:table-cell">Origem</th>
              <th className="text-right font-semibold text-gray-700 px-4 py-3">Valor</th>
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
                    Nenhuma movimentação encontrada para os filtros selecionados.
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {paginated.map((m, i) => (
                  <motion.tr key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.3) }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 tabular-nums whitespace-nowrap">
                      {fmtDateTime(m.dataMovimentacao)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{m.carteiraNome}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      <div className="truncate max-w-[280px]" title={m.descricao}>{m.descricao}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {m.origem === 'ContaPagar' ? 'Conta a pagar' : 'Conta a receber'}
                    </td>
                    <td className={cn('px-4 py-3 text-right font-medium whitespace-nowrap',
                      m.tipo === 'Credito' ? 'text-emerald-600' : 'text-red-500')}>
                      {m.tipo === 'Credito' ? '+' : '-'} {fmtBRL(m.valor)}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {!loading && movimentacoes.length > 0 && (
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span className="mr-4">Exibindo {movimentacoes.length} movimentaç{movimentacoes.length !== 1 ? 'ões' : 'ão'}.</span>
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
