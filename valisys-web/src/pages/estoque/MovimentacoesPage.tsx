import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Loader2, SlidersHorizontal, X, Trash2,
  ChevronUp, ChevronDown, ArrowLeftRight, LogIn, LogOut, Minus,
  Home, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { ModalMsg } from '@/components/ui/ModalMsg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MovimentacaoRow {
  id: string;
  dataMovimentacao: string;
  tipo: string;
  produtoNome: string;
  produtoCodigo: string;
  produtoUnidade: string;
  quantidade: number;
  almoxarifadoOrigemNome: string | null;
  depositoOrigemNome: string | null;
  almoxarifadoDestinoNome: string | null;
  depositoDestinoNome: string | null;
  usuarioNome: string;
  justificativa: string;
  pedidoVendaCodigo: string | null;
}

interface ProdutoOpt  { id: string; nome: string; codigo: string }
interface DepositoOpt { id: string; nome: string; almoxarifadoNome: string }

const TIPOS = ['Entrada', 'Saida', 'Transferencia', 'Baixa'] as const;
type TipoOpt = typeof TIPOS[number] | 'todos';

const TIPO_CFG: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  Entrada:       { label: 'Entrada',       badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <LogIn  size={10} /> },
  Saida:         { label: 'Saída',         badge: 'bg-orange-50  text-orange-700  border border-orange-200',  icon: <LogOut size={10} /> },
  Transferencia: { label: 'Transferência', badge: 'bg-blue-50    text-blue-700    border border-blue-200',    icon: <ArrowLeftRight size={10} /> },
  Baixa:         { label: 'Baixa',         badge: 'bg-red-50     text-red-700     border border-red-200',     icon: <Minus  size={10} /> },
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

type SortKey = 'dataMovimentacao' | 'tipo' | 'produtoNome' | 'quantidade' | 'usuarioNome';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function fmtQtd(q: number, un: string) {
  return `${q.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} ${un}`;
}

function formatOrigem(almox: string | null, dep: string | null) {
  if (!almox && !dep) return '—';
  if (almox && dep) return `${almox} / ${dep}`;
  return almox ?? dep ?? '—';
}

// ─── SortHeader ───────────────────────────────────────────────────────────────

function SortHeader({ col, label, sort, onSort, align = 'left' }: {
  col: SortKey; label: string;
  sort: { key: SortKey; dir: 'asc' | 'desc' };
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const active = sort.key === col;
  return (
    <th
      className={cn(
        'py-3 px-3 text-xs font-semibold text-gray-600 cursor-pointer select-none whitespace-nowrap',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
      )}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="flex flex-col leading-none">
          <ChevronUp  size={9} className={cn(active && sort.dir === 'asc'  ? 'text-[#1D4E89]' : 'text-gray-300')} />
          <ChevronDown size={9} className={cn(active && sort.dir === 'desc' ? 'text-[#1D4E89]' : 'text-gray-300')} />
        </span>
      </span>
    </th>
  );
}

// ─── FiltersPanel ─────────────────────────────────────────────────────────────

interface Filters {
  tipo: TipoOpt;
  produto: string;
  deposito: string;
  de: string;
  ate: string;
  usuario: string;
}

const DEFAULT_FILTERS: Filters = {
  tipo: 'todos', produto: '', deposito: '', de: '', ate: '', usuario: '',
};

function filtersCount(f: Filters): number {
  return [f.tipo !== 'todos', f.produto, f.deposito, f.de || f.ate, f.usuario].filter(Boolean).length;
}

function FiltersPanel({ filters, onChange, onClose, produtos, depositos }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  produtos: ProdutoOpt[];
  depositos: DepositoOpt[];
}) {
  const [local, setLocal] = useState<Filters>({ ...filters });
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setLocal(f => ({ ...f, [k]: v }));

  const apply = () => { onChange(local); onClose(); };
  const reset = () => { onChange({ ...DEFAULT_FILTERS }); onClose(); };

  return (
    <div className="absolute z-40 right-0 top-full mt-1.5 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-visible">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <span className="text-sm font-semibold text-gray-800">Filtros</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors"><X size={15} /></button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Tipo de movimentação</p>
          <div className="grid grid-cols-2 gap-1.5">
            {(['todos', ...TIPOS] as const).map(t => {
              const cfg = t !== 'todos' ? TIPO_CFG[t] : null;
              const active = local.tipo === t;
              return (
                <button key={t} onClick={() => set('tipo', t)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                    active
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
                  )}>
                  {cfg?.icon}
                  {t === 'todos' ? 'Todos' : cfg?.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Produto</label>
          <select value={local.produto} onChange={e => set('produto', e.target.value)}
            className="w-full h-8 px-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-800">
            <option value="">Todos</option>
            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Depósito</label>
          <select value={local.deposito} onChange={e => set('deposito', e.target.value)}
            className="w-full h-8 px-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-800">
            <option value="">Todos</option>
            {depositos.map(d => <option key={d.id} value={d.id}>{d.nome} ({d.almoxarifadoNome})</option>)}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Período</p>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 block">De</span>
              <DatePicker value={local.de} onChange={v => set('de', v)} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 block">Até</span>
              <DatePicker value={local.ate} onChange={v => set('ate', v)} />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Usuário</label>
          <input value={local.usuario} onChange={e => set('usuario', e.target.value)}
            placeholder="Nome do usuário"
            className="w-full h-8 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-400 bg-white" />
        </div>

      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button onClick={reset} className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors">
          Redefinir
        </button>
        <button onClick={apply}
          className="h-7 px-4 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
          Aplicar
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MovimentacoesPage() {
  const navigate = useNavigate();

  const [rows, setRows]       = useState<MovimentacaoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort_]      = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'dataMovimentacao', dir: 'desc' });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MovimentacaoRow | null>(null);

  const [produtos, setProdutos]   = useState<ProdutoOpt[]>([]);
  const [depositos, setDepositos] = useState<DepositoOpt[]>([]);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };

    try {
      const params = new URLSearchParams();
      if (filters.produto)  params.set('produtoId',  filters.produto);
      if (filters.deposito) params.set('depositoId', filters.deposito);
      if (filters.tipo !== 'todos') params.set('tipo', filters.tipo);
      if (filters.de)  params.set('de',  filters.de);
      if (filters.ate) params.set('ate', filters.ate);
      if (filters.usuario) params.set('usuarioNome', filters.usuario);

      const res = await fetch(`/api/movimentacoes?${params}`, { headers: h });
      if (!res.ok) return;
      const data: any[] = await res.json();
      setRows(data.map(d => ({
        id: d.id,
        dataMovimentacao: d.dataMovimentacao,
        tipo: d.tipo,
        produtoNome: d.produtoNome ?? '—',
        produtoCodigo: d.produtoCodigo ?? '',
        produtoUnidade: d.produtoUnidade ?? '',
        quantidade: d.quantidade ?? 0,
        almoxarifadoOrigemNome: d.almoxarifadoOrigemNome ?? null,
        depositoOrigemNome: d.depositoOrigemNome ?? null,
        almoxarifadoDestinoNome: d.almoxarifadoDestinoNome ?? null,
        depositoDestinoNome: d.depositoDestinoNome ?? null,
        usuarioNome: d.usuarioNome ?? '—',
        justificativa: d.justificativa ?? '',
        pedidoVendaCodigo: d.pedidoVendaCodigo ?? null,
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };
    fetch('/api/Produtos', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setProdutos(d.map(p => ({ id: p.id, nome: p.nome, codigo: p.codigo ?? '' }))));
    fetch('/api/Deposito', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setDepositos(d.map(dep => ({ id: dep.id, nome: dep.nome, almoxarifadoNome: dep.almoxarifadoNome ?? '' }))));
  }, []);

  useEffect(() => { load(); }, [filters]);

  const handleDelete = (row: MovimentacaoRow) => { setDeleteTarget(row); };

  const execDelete = async () => {
    if (!deleteTarget) return;
    const row = deleteTarget;
    setDeleteTarget(null);
    setDeleting(row.id);
    const token = localStorage.getItem('token');
    await fetch(`/api/movimentacoes/${row.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleting(null);
    load();
  };

  const handleSort = (key: SortKey) => {
    setSort_(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const filtered = rows.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.produtoNome.toLowerCase().includes(q)
        || r.produtoCodigo.toLowerCase().includes(q)
        || r.usuarioNome.toLowerCase().includes(q)
        || r.justificativa.toLowerCase().includes(q)
        || (r.almoxarifadoOrigemNome ?? '').toLowerCase().includes(q)
        || (r.almoxarifadoDestinoNome ?? '').toLowerCase().includes(q);
  }).sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const av = a[sort.key] ?? '';
    const bv = b[sort.key] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const active     = filtersCount(filters);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Estoque</span><ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Movimentações</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-400 focus:border-blue-600 focus:outline-none transition-colors placeholder:text-gray-400 text-gray-800"
            placeholder="Produto, usuário ou justificativa"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button
          onClick={() => navigate('/estoque/movimentacoes/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus size={14} /> Nova Movimentação
        </button>

        <div className="ml-auto">
          <div ref={filterRef} className="relative">
            <button onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-semibold transition-colors',
                active > 0
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50',
              )}>
              <SlidersHorizontal size={13} />
              Filtros
              {active > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">
                  {active}
                </span>
              )}
            </button>
            {filterOpen && (
              <FiltersPanel
                filters={filters}
                onChange={f => { setFilters(f); setPage(1); }}
                onClose={() => setFilterOpen(false)}
                produtos={produtos}
                depositos={depositos}
              />
            )}
          </div>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        ) : (
          <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <SortHeader col="dataMovimentacao" label="Data"      sort={sort} onSort={handleSort} align="center" />
                  <SortHeader col="tipo"             label="Tipo"      sort={sort} onSort={handleSort} />
                  <SortHeader col="produtoNome"      label="Produto"   sort={sort} onSort={handleSort} />
                  <SortHeader col="quantidade"       label="Qtd"       sort={sort} onSort={handleSort} align="right" />
                  <th className="py-3 px-3 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">Origem</th>
                  <th className="py-3 px-3 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">Destino</th>
                  <SortHeader col="usuarioNome"      label="Usuário"   sort={sort} onSort={handleSort} />
                  <th className="py-3 px-3 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">Justificativa</th>
                  <th className="w-10 pr-4" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">
                      {search || active > 0
                        ? 'Nenhuma movimentação encontrada para os filtros selecionados.'
                        : 'Nenhuma movimentação registrada.'}
                    </td>
                  </tr>
                ) : paginated.map(row => {
                  const cfg = TIPO_CFG[row.tipo] ?? { label: row.tipo, badge: 'bg-gray-100 text-gray-600', icon: null };
                  return (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-sm text-gray-600 tabular-nums whitespace-nowrap text-center">
                        {fmtDate(row.dataMovimentacao)}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full', cfg.badge)}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800">
                        <div className="font-medium truncate max-w-[160px]">{row.produtoNome}</div>
                        {row.produtoCodigo && (
                          <div className="text-[11px] text-gray-400">{row.produtoCodigo}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums font-medium">
                        {fmtQtd(row.quantidade, row.produtoUnidade)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[140px]">
                        <div className="truncate">{formatOrigem(row.almoxarifadoOrigemNome, row.depositoOrigemNome)}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-[140px]">
                        <div className="truncate">{formatOrigem(row.almoxarifadoDestinoNome, row.depositoDestinoNome)}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{row.usuarioNome}</td>
                      <td className="px-3 py-3 text-sm text-gray-500 max-w-[200px]">
                        <div className="truncate" title={row.justificativa}>{row.justificativa}</div>
                        {row.pedidoVendaCodigo && (
                          <div className="text-[11px] text-blue-600">PV #{row.pedidoVendaCodigo}</div>
                        )}
                      </td>
                      <td className="pr-4 text-right">
                        <button
                          onClick={() => handleDelete(row)}
                          disabled={deleting === row.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors rounded"
                          title="Excluir"
                        >
                          {deleting === row.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 text-sm text-gray-500">
          <span className="text-xs font-semibold text-gray-700">
            {filtered.length} movimentaç{filtered.length === 1 ? 'ão' : 'ões'}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => goPage(1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
            <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return start + i;
            }).filter(p => p <= totalPages).map(p => (
              <button key={p} onClick={() => goPage(p)}
                className={cn('w-7 h-7 rounded-full text-sm transition-colors',
                  p === page ? 'bg-blue-100 text-[#1D4E89] font-semibold' : 'hover:bg-gray-100')}>
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
        </div>
      )}

      <ModalMsg
        aberto={deleteTarget !== null}
        titulo="Excluir movimentação"
        descricao={deleteTarget ? `Excluir movimentação de "${deleteTarget.produtoNome}" (${fmtDate(deleteTarget.dataMovimentacao)})?` : ''}
        variante="perigo"
        onConfirmar={execDelete}
        onCancelar={() => setDeleteTarget(null)}
      />
    </div>
  );
}
