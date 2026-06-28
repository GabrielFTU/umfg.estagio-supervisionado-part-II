import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, MoreHorizontal, Loader2, SlidersHorizontal, X,
  ChevronUp, ChevronDown, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

interface ParcelaRow {
  contaId: string;
  parcelaId: string;
  descricao: string;
  numeroDocumento: string | null;
  parcela: string;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  valorAberto: number;
  statusDisplay: string;
  contaAtivo: boolean;
  vencida: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTS = ['todos', 'ABERTA', 'PARCIAL', 'PAGA', 'VENCIDA', 'CANCELADA'] as const;
type StatusOpt = typeof STATUS_OPTS[number];

function statusInfo(s: string): { label: string; cls: string } {
  switch (s) {
    case 'ABERTA':    return { label: 'ABERTA',    cls: 'bg-orange-50 text-orange-600 border border-orange-200' };
    case 'PARCIAL':   return { label: 'PARCIAL',   cls: 'bg-amber-50 text-amber-600 border border-amber-200' };
    case 'PAGA':      return { label: 'PAGA',      cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200' };
    case 'VENCIDA':   return { label: 'VENCIDA',   cls: 'bg-red-50 text-red-600 border border-red-200' };
    case 'CANCELADA': return { label: 'CANCELADA', cls: 'bg-gray-100 text-gray-500' };
    default:          return { label: s,           cls: 'bg-gray-100 text-gray-500' };
  }
}

function parcelaStatusDisplay(parcelaStatus: string, contaStatus: string): string {
  if (contaStatus === 'Cancelado') return 'CANCELADA';
  if (parcelaStatus === 'Pago') return 'PAGA';
  if (contaStatus === 'ParcialmentePago') return 'PARCIAL';
  if (parcelaStatus === 'Vencido') return 'VENCIDA';
  return 'ABERTA';
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function RowMenu({ ativo, onEdit, onView, onToggle, onBaixar }: {
  ativo: boolean;
  onEdit: () => void;
  onView: () => void;
  onToggle: () => void;
  onBaixar: () => void;
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

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Visualizar</button>
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Editar</button>
          <button onClick={() => { setOpen(false); onBaixar(); }}
            className="w-full text-left px-3 py-1.5 text-emerald-600 hover:bg-gray-50">Baixar parcela</button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onToggle(); }}
            className={cn('w-full text-left px-3 py-1.5 hover:bg-gray-50', ativo ? 'text-red-500' : 'text-emerald-600')}>
            {ativo ? 'Cancelar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

type SortKey = 'descricao' | 'numeroDocumento' | 'parcela' | 'dataEmissao' | 'dataVencimento' | 'valor' | 'valorAberto' | 'statusDisplay';

function SortHeader({ col, label, sort, setSort, align = 'left' }: {
  col: SortKey;
  label: string;
  sort: { key: SortKey; dir: 'asc' | 'desc' };
  setSort: (k: SortKey) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const active = sort.key === col;
  return (
    <th
      className={cn(
        'py-3 px-3 text-xs font-semibold text-gray-600 cursor-pointer select-none whitespace-nowrap',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
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

export function ContasPagarPage() {
  const navigate = useNavigate();
  const [rows, setRows]         = useState<ParcelaRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusOpt>('todos');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort_]        = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'dataVencimento', dir: 'asc' });
  const filterRef = useRef<HTMLDivElement>(null);
  const [cancelarId, setCancelarId] = useState<string | null>(null);

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
      const res = await fetch('/api/contas-pagar', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data: any[] = await res.json();
      const flat: ParcelaRow[] = [];
      for (const c of data) {
        const total = c.parcelas?.length ?? 1;
        if (c.parcelas && c.parcelas.length > 0) {
          for (const p of c.parcelas) {
            flat.push({
              contaId: c.id,
              parcelaId: p.id,
              descricao: c.descricao,
              numeroDocumento: c.numeroDocumento,
              parcela: `${p.numeroParcela}/${total}`,
              dataEmissao: c.dataEmissao,
              dataVencimento: p.dataVencimento,
              valor: p.valor,
              valorAberto: p.status === 'Pago' ? 0 : p.valor - (p.valorPago ?? 0),
              statusDisplay: parcelaStatusDisplay(p.status, c.status),
              contaAtivo: c.ativo,
              vencida: p.status === 'Vencido',
            });
          }
        } else {
          flat.push({
            contaId: c.id,
            parcelaId: c.id,
            descricao: c.descricao,
            numeroDocumento: c.numeroDocumento,
            parcela: '1/1',
            dataEmissao: c.dataEmissao,
            dataVencimento: c.dataVencimento,
            valor: c.valorTotal,
            valorAberto: c.valorAberto,
            statusDisplay: parcelaStatusDisplay('Pendente', c.status),
            contaAtivo: c.ativo,
            vencida: c.status === 'Vencido',
          });
        }
      }
      setRows(flat);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancelar = (contaId: string) => {
    setCancelarId(contaId);
  };

  const execCancelar = async () => {
    if (!cancelarId) return;
    const contaId = cancelarId;
    setCancelarId(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/contas-pagar/${contaId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleSort = (key: SortKey) => {
    setSort_(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const filtered = rows.filter(r => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.descricao.toLowerCase().includes(q) && !(r.numeroDocumento ?? '').toLowerCase().includes(q)) return false;
    }
    if (statusFiltro !== 'todos' && r.statusDisplay !== statusFiltro) return false;
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

  const allSelected  = paginated.length > 0 && paginated.every(r => selected.has(r.parcelaId));
  const someSelected = paginated.some(r => selected.has(r.parcelaId));

  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const s = new Set(prev); paginated.forEach(r => s.delete(r.parcelaId)); return s; });
    else setSelected(prev => { const s = new Set(prev); paginated.forEach(r => s.add(r.parcelaId)); return s; });
  };

  const statusLabel = statusFiltro !== 'todos' ? statusFiltro : null;

  const totalValorAberto = filtered.reduce((s, r) => s + r.valorAberto, 0);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#3B82F6] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Informe a descrição ou razão social"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button
          onClick={() => navigate('/financeiro/contas-pagar/novo')}
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
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status da parcela</p>
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

      {/* Chips */}
      {(statusLabel || selected.size > 0) && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {statusLabel && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#3B82F6] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Status da parcela: {statusLabel}
              <button onClick={() => setStatusFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {selected.size > 0 && (
            <span className="text-xs text-gray-500">{selected.size} selecionado{selected.size !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {/* Totalizador */}
      {filtered.length > 0 && (
        <div className="shrink-0 px-6 py-2 border-b border-gray-100 flex items-center gap-6 text-xs text-gray-500">
          <span>Total em aberto: <strong className="text-gray-700">{fmtBRL(totalValorAberto)}</strong></span>
          <span>{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
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
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={toggleAll} className="rounded border-gray-300" />
                  </th>
                  <th className="w-6 px-1 py-3" />
                  <SortHeader col="descricao"       label="Descrição"    sort={sort} setSort={handleSort} />
                  <SortHeader col="numeroDocumento" label="Documento"    sort={sort} setSort={handleSort} />
                  <SortHeader col="parcela"         label="Parcela"      sort={sort} setSort={handleSort} />
                  <SortHeader col="dataEmissao"     label="Emissão"      sort={sort} setSort={handleSort} align="center" />
                  <SortHeader col="dataVencimento"  label="Vencimento"   sort={sort} setSort={handleSort} align="center" />
                  <SortHeader col="valor"           label="Valor"        sort={sort} setSort={handleSort} align="right" />
                  <SortHeader col="valorAberto"     label="Valor aberto" sort={sort} setSort={handleSort} align="right" />
                  <SortHeader col="statusDisplay"   label="Status"       sort={sort} setSort={handleSort} />
                  <th className="w-10 pr-4" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center text-sm text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : paginated.map(row => {
                  const info = statusInfo(row.statusDisplay);
                  const isSelected = selected.has(row.parcelaId);
                  return (
                    <tr key={row.parcelaId}
                      onClick={() => navigate(`/financeiro/contas-pagar/${row.contaId}`)}
                      className={cn(
                        'border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                        isSelected && 'bg-blue-50/40',
                      )}
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => setSelected(prev => {
                            const s = new Set(prev);
                            isSelected ? s.delete(row.parcelaId) : s.add(row.parcelaId);
                            return s;
                          })}
                          className="rounded border-gray-300" />
                      </td>
                      <td className="px-1 py-3">
                        {row.vencida && <AlertCircle size={13} className="text-red-400" />}
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn('text-sm', row.contaAtivo ? 'text-gray-700' : 'text-gray-400 line-through')}>
                          {row.descricao}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-500">{row.numeroDocumento ?? '—'}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{row.parcela}</td>
                      <td className="px-3 py-3 text-sm text-gray-500 text-center">{fmtDate(row.dataEmissao)}</td>
                      <td className={cn('px-3 py-3 text-sm font-medium text-center', row.vencida ? 'text-red-500' : 'text-gray-700')}>
                        {fmtDate(row.dataVencimento)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-right">{fmtBRL(row.valor)}</td>
                      <td className="px-3 py-3 text-sm text-gray-700 text-right font-medium">{fmtBRL(row.valorAberto)}</td>
                      <td className="px-3 py-3">
                        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium', info.cls)}>
                          {info.label}
                        </span>
                      </td>
                      <td className="pr-4 text-right" onClick={e => e.stopPropagation()}>
                        <RowMenu
                          ativo={row.contaAtivo}
                          onView={() => navigate(`/financeiro/contas-pagar/${row.contaId}`)}
                          onEdit={() => navigate(`/financeiro/contas-pagar/${row.contaId}/editar`)}
                          onBaixar={() => navigate(`/financeiro/contas-pagar/${row.contaId}/baixar`)}
                          onToggle={() => handleCancelar(row.contaId)}
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

      <ModalMsg
        aberto={cancelarId !== null}
        titulo="Cancelar conta a pagar"
        descricao="Cancelar esta conta a pagar?"
        variante="perigo"
        labelConfirmar="Cancelar conta"
        onConfirmar={execCancelar}
        onCancelar={() => setCancelarId(null)}
      />
    </div>
  );
}
