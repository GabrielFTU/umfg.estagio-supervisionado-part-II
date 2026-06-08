import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, MoreHorizontal, Loader2, SlidersHorizontal, X,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventarioRow {
  id: string;
  numero: string;
  depositoNome: string;
  tipoContagem: string;
  qtdProdutos: number;
  dataAbertura: string;
  dataFinalizacao: string | null;
  usuarioNome: string | null;
  status: 'ABERTO' | 'FINALIZADO' | 'CANCELADO';
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const STATUS_OPTS = ['todos', 'ABERTO', 'FINALIZADO', 'CANCELADO'] as const;
type StatusOpt = typeof STATUS_OPTS[number];

function statusInfo(s: string): { label: string; cls: string } {
  switch (s) {
    case 'ABERTO':     return { label: 'ABERTO',     cls: 'bg-orange-50 text-orange-600 border border-orange-200' };
    case 'FINALIZADO': return { label: 'FINALIZADO', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200' };
    case 'CANCELADO':  return { label: 'CANCELADO',  cls: 'bg-gray-100 text-gray-500' };
    default:           return { label: s,            cls: 'bg-gray-100 text-gray-500' };
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

type SortKey = 'numero' | 'depositoNome' | 'tipoContagem' | 'qtdProdutos' | 'dataAbertura' | 'status';

function SortHeader({ col, label, sort, setSort, align = 'left' }: {
  col: SortKey;
  label: string;
  sort: { key: SortKey; dir: 'asc' | 'desc' };
  setSort: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sort.key === col;
  return (
    <th
      className={cn(
        'py-3 px-3 text-xs font-semibold text-gray-600 cursor-pointer select-none whitespace-nowrap',
        align === 'right' ? 'text-right' : 'text-left',
      )}
      onClick={() => setSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="flex flex-col leading-none">
          <ChevronUp size={9} className={cn(active && sort.dir === 'asc' ? 'text-[#3B82F6]' : 'text-gray-300')} />
          <ChevronDown size={9} className={cn(active && sort.dir === 'desc' ? 'text-[#3B82F6]' : 'text-gray-300')} />
        </span>
      </span>
    </th>
  );
}

function RowMenu({ status, onView, onEdit, onFinalizar, onCancelar }: {
  status: string;
  onView: () => void;
  onEdit: () => void;
  onFinalizar: () => void;
  onCancelar: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(v => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current  && !btnRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('scroll', close, true); };
  }, [open]);

  const isAberto = status === 'ABERTO';

  return (
    <>
      <button ref={btnRef} onMouseDown={e => e.stopPropagation()} onClick={toggle}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Visualizar</button>
          {isAberto && (
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Editar</button>
          )}
          {isAberto && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onFinalizar(); }}
                className="w-full text-left px-3 py-1.5 text-emerald-600 hover:bg-gray-50">Finalizar</button>
              <button onClick={() => { setOpen(false); onCancelar(); }}
                className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-gray-50">Cancelar</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export function InventariosPage() {
  const navigate = useNavigate();
  const [rows, setRows]       = useState<InventarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusOpt>('todos');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [page, setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort_]      = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'dataAbertura', dir: 'desc' });
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
    try {
      const res = await fetch('/api/inventarios', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data: any[] = await res.json();
      setRows(data.map(d => ({
        id: d.id,
        numero: d.numero ?? d.id?.slice(0, 8).toUpperCase(),
        depositoNome: d.depositoNome ?? '—',
        tipoContagem: d.tipoContagem ?? '—',
        qtdProdutos: d.itens?.length ?? d.qtdProdutos ?? 0,
        dataAbertura: d.dataAbertura ?? d.criadoEm,
        dataFinalizacao: d.dataFinalizacao ?? null,
        usuarioNome: d.usuarioNome ?? null,
        status: d.status ?? 'ABERTO',
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFinalizar = async (id: string) => {
    if (!confirm('Finalizar este inventário? Esta ação não pode ser desfeita.')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/inventarios/${id}/finalizar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('Cancelar este inventário?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/inventarios/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleSort = (key: SortKey) => {
    setSort_(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const filtered = rows.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.depositoNome.toLowerCase().includes(q) && !r.numero.toLowerCase().includes(q)) return false;
    }
    if (statusFiltro !== 'todos' && r.status !== statusFiltro) return false;
    return true;
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
  const statusLabel = statusFiltro !== 'todos' ? statusFiltro : null;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#3B82F6] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Buscar por depósito ou número"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button
          onClick={() => navigate('/estoque/inventario/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors shrink-0"
        >
          <Plus size={14} /> Novo
        </button>

        <div ref={filterRef} className="relative shrink-0">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
              statusFiltro !== 'todos'
                ? 'border-[#3B82F6] bg-blue-50 text-[#3B82F6]'
                : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
            )}
          >
            <SlidersHorizontal size={15} />
          </button>

          {filterOpen && (
            <div
              onMouseDown={e => e.stopPropagation()}
              className="absolute z-30 right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-3"
            >
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
              {STATUS_OPTS.map(v => (
                <button key={v} onClick={() => { setStatusFiltro(v); setPage(1); setFilterOpen(false); }}
                  className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                    statusFiltro === v ? 'bg-[#3B82F6] text-white' : 'text-gray-600 hover:bg-gray-50')}>
                  {v === 'todos' ? 'Todos' : v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chip de filtro ativo */}
      {statusLabel && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#3B82F6] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            Status: {statusLabel}
            <button onClick={() => setStatusFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
          </span>
        </div>
      )}

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <SortHeader col="numero"       label="Número"      sort={sort} setSort={handleSort} />
                  <SortHeader col="depositoNome" label="Depósito"    sort={sort} setSort={handleSort} />
                  <SortHeader col="tipoContagem" label="Tipo"        sort={sort} setSort={handleSort} />
                  <SortHeader col="qtdProdutos"  label="Produtos"    sort={sort} setSort={handleSort} align="right" />
                  <SortHeader col="dataAbertura" label="Abertura"    sort={sort} setSort={handleSort} />
                  <th className="py-3 px-3 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">Finalização</th>
                  <th className="py-3 px-3 text-xs font-semibold text-gray-600 text-left whitespace-nowrap">Usuário</th>
                  <SortHeader col="status"       label="Status"      sort={sort} setSort={handleSort} />
                  <th className="w-10 pr-4" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : paginated.map(row => {
                  const info = statusInfo(row.status);
                  return (
                    <tr key={row.id}
                      onClick={() => navigate(`/estoque/inventario/${row.id}`)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-3 text-sm font-medium text-gray-700">{row.numero}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{row.depositoNome}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{row.tipoContagem}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-right font-medium">{row.qtdProdutos}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{fmtDate(row.dataAbertura)}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{fmtDate(row.dataFinalizacao)}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{row.usuarioNome ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', info.cls)}>
                          {info.label}
                        </span>
                      </td>
                      <td className="pr-4 text-right" onClick={e => e.stopPropagation()}>
                        <RowMenu
                          status={row.status}
                          onView={() => navigate(`/estoque/inventario/${row.id}`)}
                          onEdit={() => navigate(`/estoque/inventario/${row.id}/editar`)}
                          onFinalizar={() => handleFinalizar(row.id)}
                          onCancelar={() => handleCancelar(row.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3 text-sm text-gray-500">
                <span className="mr-4">Exibindo {filtered.length} registro{filtered.length !== 1 ? 's' : ''}.</span>
                <button onClick={() => goPage(1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
                <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => goPage(p)}
                    className={cn('w-7 h-7 rounded-full text-sm transition-colors',
                      p === page ? 'bg-blue-100 text-[#3B82F6] font-semibold' : 'hover:bg-gray-100')}>
                    {p}
                  </button>
                ))}
                <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>'}</button>
                <button onClick={() => goPage(totalPages)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>>'}</button>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="ml-2 border border-gray-300 rounded text-xs px-1 py-0.5 outline-none focus:border-[#3B82F6]">
                  {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
