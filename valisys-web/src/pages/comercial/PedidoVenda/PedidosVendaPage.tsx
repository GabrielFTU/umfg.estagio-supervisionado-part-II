import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Loader2, MoreHorizontal,
  ShoppingBag, ChevronDown, SlidersHorizontal,
  Home, ChevronRight, ChevronLeft, X, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';
import { DatePicker } from '@/components/ui/DatePicker';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusPedido = 0 | 1 | 2 | 3;

interface ProdutoItem { nome: string; sku?: string; quantidade: number }

interface PedidoItem {
  id: string;
  codigo: number;
  clienteNome: string;
  representanteNome: string | null;
  dataEmissao: string;
  dataPrevisaoEntrega: string | null;
  total: number;
  status: StatusPedido;
  statusLabel: string;
  totalItens: number;
  produtos?: ProdutoItem[];
  loteProducao?: string | null;
  finalidade?: string | null;
}

const STATUS_CFG: Record<number, { label: string; dot: string; badge: string }> = {
  0: { label: 'RASCUNHO',   dot: 'bg-gray-400',    badge: 'text-gray-600 bg-gray-100'       },
  1: { label: 'CONFIRMADO', dot: 'bg-blue-500',    badge: 'text-blue-700 bg-blue-100'       },
  2: { label: 'CONCLUÍDO',  dot: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-100' },
  3: { label: 'CANCELADO',  dot: 'bg-red-400',     badge: 'text-red-600 bg-red-100'         },
};

const ICON_CFG: Record<number, string> = {
  0: 'bg-gray-100 text-gray-400',
  1: 'bg-blue-50  text-blue-500',
  2: 'bg-emerald-50 text-emerald-500',
  3: 'bg-red-50   text-red-400',
};

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function isOverdue(date: string | null, status: number) {
  if (!date || status === 2 || status === 3) return false;
  return date.slice(0, 10) < todayIso();
}
function isDueSoon(date: string | null, status: number) {
  if (!date || status === 2 || status === 3) return false;
  const diff = (new Date(date).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= 3;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

interface Filters {
  statuses: number[];
  cliente: string;
  codigo: string;
  produto: string;
  sku: string;
  emissaoFrom: string;
  emissaoTo: string;
  previsaoFrom: string;
  previsaoTo: string;
  loteProducao: string;
  representante: string;
  finalidade: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const DEFAULT_STATUSES = [0, 1, 2];

const DEFAULT_FILTERS: Filters = {
  statuses: DEFAULT_STATUSES,
  cliente: '', codigo: '', produto: '', sku: '',
  emissaoFrom: '', emissaoTo: '',
  previsaoFrom: '', previsaoTo: '',
  loteProducao: '', representante: '', finalidade: '',
};

function activeChips(f: Filters, search: string): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  if (search) chips.push({ key: '__search', label: `"${search}"` });
  if (JSON.stringify([...f.statuses].sort()) !== JSON.stringify([...DEFAULT_STATUSES].sort()))
    chips.push({ key: 'statuses', label: `Status (${f.statuses.length})` });
  if (f.codigo)       chips.push({ key: 'codigo',       label: `Pedido #${f.codigo}` });
  if (f.cliente)      chips.push({ key: 'cliente',      label: `Cliente: ${f.cliente}` });
  if (f.representante) chips.push({ key: 'representante', label: `Rep.: ${f.representante}` });
  if (f.produto)      chips.push({ key: 'produto',      label: `Produto: ${f.produto}` });
  if (f.sku)          chips.push({ key: 'sku',          label: `SKU: ${f.sku}` });
  if (f.loteProducao) chips.push({ key: 'loteProducao', label: `Lote: ${f.loteProducao}` });
  if (f.finalidade)   chips.push({ key: 'finalidade',   label: `Finalidade: ${f.finalidade}` });
  if (f.emissaoFrom || f.emissaoTo)  chips.push({ key: 'emissao',  label: `Emissão: ${f.emissaoFrom || '…'} → ${f.emissaoTo || '…'}` });
  if (f.previsaoFrom || f.previsaoTo) chips.push({ key: 'previsao', label: `Previsão: ${f.previsaoFrom || '…'} → ${f.previsaoTo || '…'}` });
  return chips;
}

function filtersCount(f: Filters): number {
  let n = 0;
  if (JSON.stringify([...f.statuses].sort()) !== JSON.stringify([...DEFAULT_STATUSES].sort())) n++;
  if (f.cliente) n++;  if (f.codigo) n++;  if (f.produto) n++;  if (f.sku) n++;
  if (f.emissaoFrom || f.emissaoTo) n++;
  if (f.previsaoFrom || f.previsaoTo) n++;
  if (f.loteProducao) n++;  if (f.representante) n++;  if (f.finalidade) n++;
  return n;
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
      {label}
      <button onClick={onRemove}
        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors shrink-0">
        <X size={10} />
      </button>
    </span>
  );
}

// ─── FilterSelectField ────────────────────────────────────────────────────────

function FilterSelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const select = (v: string) => { onChange(v); setOpen(false); setSearch(''); };
  const clear  = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); };

  return (
    <div>
      {label && <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>}
      <button type="button"
        onClick={() => { setOpen(v => !v); if (!open) setTimeout(() => inputRef.current?.focus(), 40); }}
        className={cn(
          'w-full flex items-center justify-between h-8 px-3 text-sm rounded-lg border transition-colors bg-white',
          open ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400',
          value ? 'text-gray-800' : 'text-gray-400',
        )}>
        <span className="truncate text-sm">{value || 'Todos'}</span>
        <span className="flex items-center gap-0.5 shrink-0">
          {value && (
            <span onClick={clear} className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors">
              <X size={11} />
            </span>
          )}
          <ChevronDown size={13} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
        </span>
      </button>
      {open && (
        <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-gray-100 bg-gray-50">
            <Search size={12} className="text-gray-400 shrink-0" />
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar…" className="flex-1 text-xs outline-none bg-transparent placeholder:text-gray-400 text-gray-800" />
          </div>
          <div className="overflow-y-auto max-h-36">
            <button type="button" onClick={() => select('')}
              className={cn('w-full text-left px-3 py-1.5 text-xs transition-colors',
                !value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50')}>
              Todos
            </button>
            {visible.length === 0
              ? <p className="px-3 py-3 text-xs text-gray-400 text-center">Nenhum resultado</p>
              : visible.map(opt => (
                <button key={opt} type="button" onClick={() => select(opt)}
                  className={cn('w-full text-left px-3 py-1.5 text-xs transition-colors border-t border-gray-50',
                    opt === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50')}>
                  {opt}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DateRangeField ───────────────────────────────────────────────────────────

function DateRangeField({ label, from, to, onFromChange, onToChange }: {
  label: string; from: string; to: string;
  onFromChange: (v: string) => void; onToChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-2 block">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 block">De</span>
          <DatePicker value={from} onChange={onFromChange} />
        </div>
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 block">Até</span>
          <DatePicker value={to} onChange={onToChange} />
        </div>
      </div>
    </div>
  );
}

// ─── FiltersPanel ─────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>;
}

function FiltersPanel({ filters, onChange, onClose, clientes, representantes, produtos, lotes, finalidades }: {
  filters: Filters; onChange: (f: Filters) => void; onClose: () => void;
  clientes: string[]; representantes: string[]; produtos: string[]; lotes: string[]; finalidades: string[];
}) {
  const [local, setLocal] = useState<Filters>({ ...filters, statuses: [...filters.statuses] });
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setLocal(f => ({ ...f, [k]: v }));
  const toggleStatus = (s: number) => setLocal(f => ({
    ...f, statuses: f.statuses.includes(s) ? f.statuses.filter(x => x !== s) : [...f.statuses, s],
  }));
  const apply = () => { onChange(local); onClose(); };
  const reset = () => { const d = { ...DEFAULT_FILTERS, statuses: [...DEFAULT_FILTERS.statuses] }; setLocal(d); onChange(d); onClose(); };

  return (
    <div className="absolute z-40 right-0 top-full mt-1.5 w-[420px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-800">Filtros avançados</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[74vh]">

        {/* Status */}
        <div className="px-5 pt-4 pb-4 border-b border-gray-100">
          <SectionDivider label="Status" />
          <div className="grid grid-cols-4 gap-1.5">
            {([0, 1, 2, 3] as number[]).map(s => {
              const cfg = STATUS_CFG[s];
              const active = local.statuses.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggleStatus(s)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-bold transition-all border',
                    active ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50',
                  )}>
                  <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Identificação */}
        <div className="px-5 pt-4 pb-4 border-b border-gray-100 space-y-3">
          <SectionDivider label="Identificação" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nº do Pedido</label>
              <input type="number" min={1} value={local.codigo} onChange={e => set('codigo', e.target.value)}
                placeholder="Ex: 42"
                className="w-full h-8 px-3 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-300 bg-white" />
            </div>
            <div>
              <FilterSelectField label="Representante" value={local.representante} onChange={v => set('representante', v)} options={representantes} />
            </div>
          </div>
          <FilterSelectField label="Cliente" value={local.cliente} onChange={v => set('cliente', v)} options={clientes} />
        </div>

        {/* Produtos */}
        <div className="px-5 pt-4 pb-4 border-b border-gray-100 space-y-3">
          <SectionDivider label="Produtos" />
          <div className="grid grid-cols-2 gap-3">
            <FilterSelectField label="Produto" value={local.produto} onChange={v => set('produto', v)} options={produtos} />
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">SKU</label>
              <input value={local.sku} onChange={e => set('sku', e.target.value)} placeholder="Ex: PROD-001"
                className="w-full h-8 px-3 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-300 bg-white" />
            </div>
          </div>
        </div>

        {/* Produção */}
        <div className="px-5 pt-4 pb-4 border-b border-gray-100 space-y-3">
          <SectionDivider label="Produção" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Lote de Produção</label>
              {lotes.length > 0
                ? <FilterSelectField label="" value={local.loteProducao} onChange={v => set('loteProducao', v)} options={lotes} />
                : <input value={local.loteProducao} onChange={e => set('loteProducao', e.target.value)} placeholder="Ex: LOTE-001"
                    className="w-full h-8 px-3 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-300 bg-white" />
              }
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Finalidade</label>
              {finalidades.length > 0
                ? <FilterSelectField label="" value={local.finalidade} onChange={v => set('finalidade', v)} options={finalidades} />
                : <input value={local.finalidade} onChange={e => set('finalidade', e.target.value)} placeholder="Ex: Revenda"
                    className="w-full h-8 px-3 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-300 bg-white" />
              }
            </div>
          </div>
        </div>

        {/* Datas */}
        <div className="px-5 pt-4 pb-5 space-y-4">
          <SectionDivider label="Datas" />
          <DateRangeField label="Emissão" from={local.emissaoFrom} to={local.emissaoTo}
            onFromChange={v => set('emissaoFrom', v)} onToChange={v => set('emissaoTo', v)} />
          <DateRangeField label="Previsão de Entrega" from={local.previsaoFrom} to={local.previsaoTo}
            onFromChange={v => set('previsaoFrom', v)} onToChange={v => set('previsaoTo', v)} />
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
        <button onClick={reset} className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors">
          Redefinir
        </button>
        <button onClick={apply}
          className="h-8 px-5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}

// ─── ProdutosCell ─────────────────────────────────────────────────────────────

function ProdutosCell({ produtos }: { produtos: ProdutoItem[] }) {
  const [hover, setHover] = useState(false);
  const [pos, setPos]     = useState({ top: 0, left: 0 });
  const cellRef           = useRef<HTMLDivElement>(null);

  if (produtos.length === 0) return <span className="text-gray-300 text-sm">—</span>;

  if (produtos.length === 1)
    return <span className="text-sm text-gray-700 truncate max-w-[200px] block">{produtos[0].nome}</span>;

  const handleMouseEnter = () => {
    if (cellRef.current) {
      const r = cellRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setHover(true);
  };

  const extras = produtos.length - 1;

  return (
    <>
      <div ref={cellRef} onMouseEnter={handleMouseEnter} onMouseLeave={() => setHover(false)}
        className="flex items-center gap-1.5 cursor-default max-w-[220px]">
        <span className="text-sm text-gray-700 truncate">{produtos[0].nome}</span>
        <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
          +{extras}
        </span>
      </div>
      {hover && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="min-w-[200px] max-w-xs bg-white border border-gray-200 rounded-xl shadow-xl py-2 text-[13px]"
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          {produtos.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50">
              <span className="text-gray-800 truncate">{p.nome}</span>
              <span className="text-gray-400 ml-3 shrink-0 tabular-nums">×{p.quantidade}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── RowMenu ──────────────────────────────────────────────────────────────────

function RowMenu({ pedido, onEdit, onConfirmar, onCancelar }: {
  pedido: PedidoItem;
  onEdit: () => void; onConfirmar: () => void; onCancelar: () => void;
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

  const canEdit      = pedido.status === 0 || pedido.status === 1;
  const canConfirmar = pedido.status === 0;
  const canCancelar  = pedido.status !== 2 && pedido.status !== 3;

  return (
    <>
      <button ref={btnRef} onClick={e => { e.stopPropagation(); toggle(); }}
        className="p-1.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-[13px]">
          {canEdit && (
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              Editar
            </button>
          )}
          {(canConfirmar || canCancelar) && canEdit && <div className="my-1 mx-3 border-t border-gray-100" />}
          {canConfirmar && (
            <button onClick={() => { setOpen(false); onConfirmar(); }}
              className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50 font-medium">
              Confirmar pedido
            </button>
          )}
          {canCancelar && (
            <button onClick={() => { setOpen(false); onCancelar(); }}
              className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50">
              Cancelar pedido
            </button>
          )}
        </div>
      )}
    </>
  );
}

// ─── AcoesMenu ────────────────────────────────────────────────────────────────

function AcoesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
        Ações <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute z-30 left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm">
          <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50">Exportar CSV</button>
          <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50">Imprimir listagem</button>
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function PedidosVendaPage() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [pedidos, setPedidos] = useState<PedidoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, statuses: [...DEFAULT_STATUSES] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const filterRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [confirmarTarget, setConfirmarTarget] = useState<PedidoItem | null>(null);
  const [cancelarTarget, setCancelarTarget]   = useState<PedidoItem | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  // ESC fecha filtros
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setFilterOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/pedidos-venda', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setPedidos(await res.json());
    } catch { setError('Não foi possível carregar os pedidos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search, filters]);

  const clienteOptions       = useMemo(() => [...new Set(pedidos.map(p => p.clienteNome))].sort(), [pedidos]);
  const representanteOptions = useMemo(() => [...new Set(pedidos.map(p => p.representanteNome).filter(Boolean) as string[])].sort(), [pedidos]);
  const produtoOptions       = useMemo(() => [...new Set(pedidos.flatMap(p => (p.produtos ?? []).map(x => x.nome)))].sort(), [pedidos]);
  const loteOptions          = useMemo(() => [...new Set(pedidos.map(p => p.loteProducao).filter(Boolean) as string[])].sort(), [pedidos]);
  const finalidadeOptions    = useMemo(() => [...new Set(pedidos.map(p => p.finalidade).filter(Boolean) as string[])].sort(), [pedidos]);

  const execConfirmar = async () => {
    if (!confirmarTarget) return;
    const p = confirmarTarget; setConfirmarTarget(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/pedidos-venda/${p.id}/confirmar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const execCancelar = async () => {
    if (!cancelarTarget) return;
    const p = cancelarTarget; setCancelarTarget(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/pedidos-venda/${p.id}/cancelar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const filtered = useMemo(() => pedidos.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.clienteNome.toLowerCase().includes(q) && !String(p.codigo).includes(search)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(p.status)) return false;
    if (filters.codigo && String(p.codigo) !== filters.codigo) return false;
    if (filters.cliente && !p.clienteNome.toLowerCase().includes(filters.cliente.toLowerCase())) return false;
    if (filters.representante && !(p.representanteNome ?? '').toLowerCase().includes(filters.representante.toLowerCase())) return false;
    if (filters.produto && !(p.produtos ?? []).some(x => x.nome.toLowerCase().includes(filters.produto.toLowerCase()))) return false;
    if (filters.sku && !(p.produtos ?? []).some(x => (x.sku ?? '').toLowerCase().includes(filters.sku.toLowerCase()))) return false;
    if (filters.loteProducao && !(p.loteProducao ?? '').toLowerCase().includes(filters.loteProducao.toLowerCase())) return false;
    if (filters.finalidade && !(p.finalidade ?? '').toLowerCase().includes(filters.finalidade.toLowerCase())) return false;
    if (filters.emissaoFrom && p.dataEmissao < filters.emissaoFrom) return false;
    if (filters.emissaoTo && p.dataEmissao > filters.emissaoTo + 'T23:59:59') return false;
    if (filters.previsaoFrom && p.dataPrevisaoEntrega && p.dataPrevisaoEntrega < filters.previsaoFrom) return false;
    if (filters.previsaoTo && p.dataPrevisaoEntrega && p.dataPrevisaoEntrega > filters.previsaoTo + 'T23:59:59') return false;
    return true;
  }), [pedidos, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const pageButtons = () => {
    const buttons: number[] = [];
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    for (let i = start; i <= Math.min(start + 4, totalPages); i++) buttons.push(i);
    return buttons;
  };

  const chips = useMemo(() => activeChips(filters, search), [filters, search]);
  const activeFilters = filtersCount(filters);

  const clearChip = (key: string) => {
    if (key === '__search') { setSearch(''); return; }
    const upd: Partial<Filters> = {};
    if (key === 'statuses')      upd.statuses = [...DEFAULT_STATUSES];
    else if (key === 'emissao')  { upd.emissaoFrom = ''; upd.emissaoTo = ''; }
    else if (key === 'previsao') { upd.previsaoFrom = ''; upd.previsaoTo = ''; }
    else (upd as Record<string, string>)[key] = '';
    setFilters(f => ({ ...f, ...upd }));
  };

  const clearAll = () => {
    setSearch('');
    setFilters({ ...DEFAULT_FILTERS, statuses: [...DEFAULT_STATUSES] });
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <Home size={10} /><ChevronRight size={10} />
          <span>Comercial</span><ChevronRight size={10} />
          <span className="text-gray-500">Pedidos de Venda</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight">Pedidos de Venda</h1>
      </div>

      {/* ── Toolbar ── */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-100 flex items-center gap-3">
        {/* Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            className="w-full h-9 pl-6 pr-7 text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Cliente ou nº do pedido…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        <button onClick={() => navigate('/comercial/pedidos/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0 shadow-sm">
          <Plus size={14} /> Novo pedido
        </button>

        <AcoesMenu />

        <div className="ml-auto">
          <div ref={filterRef} className="relative">
            <button onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-semibold transition-all',
                activeFilters > 0
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
              )}>
              <SlidersHorizontal size={13} />
              Filtros
              {activeFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">
                  {activeFilters}
                </span>
              )}
            </button>
            {filterOpen && (
              <FiltersPanel
                filters={filters}
                onChange={f => setFilters(f)}
                onClose={() => setFilterOpen(false)}
                clientes={clienteOptions}
                representantes={representanteOptions}
                produtos={produtoOptions}
                lotes={loteOptions}
                finalidades={finalidadeOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Chips de filtros ativos ── */}
      {chips.length > 0 && (
        <div className="shrink-0 px-6 py-2 border-b border-gray-100 bg-blue-50/40 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium shrink-0">Filtrando por:</span>
          {chips.map(c => (
            <FilterChip key={c.key} label={c.label} onRemove={() => clearChip(c.key)} />
          ))}
          <button onClick={clearAll}
            className="ml-auto text-xs text-gray-400 hover:text-red-500 font-medium transition-colors shrink-0">
            Limpar tudo
          </button>
        </div>
      )}

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto">

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando pedidos…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <AlertCircle size={28} className="text-red-300" />
            <div>
              <p className="text-sm font-medium text-red-500">{error}</p>
              <button onClick={load} className="text-xs text-blue-500 hover:underline mt-1">Tentar novamente</button>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ShoppingBag size={24} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                {chips.length > 0 ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {chips.length > 0 ? 'Os filtros ativos não retornaram resultados.' : 'Clique em "Novo pedido" para emitir o primeiro.'}
              </p>
            </div>
            {chips.length > 0 && (
              <button onClick={clearAll}
                className="h-8 px-4 rounded-full border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="w-10 py-3 pl-6" />
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4 w-[130px]">Status</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4 w-[90px]">Pedido</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4">Cliente</th>
                <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4">Produtos</th>
                <th className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4 w-[100px]">Emissão</th>
                <th className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4 w-[110px]">Prev. Entrega</th>
                <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4 w-[120px]">Total</th>
                <th className="w-10 pr-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => {
                const sc  = STATUS_CFG[p.status];
                const ic  = ICON_CFG[p.status];
                const od  = isOverdue(p.dataPrevisaoEntrega, p.status);
                const ds  = isDueSoon(p.dataPrevisaoEntrega, p.status);
                return (
                  <tr key={p.id}
                    onClick={() => navigate(`/comercial/pedidos/${p.id}`)}
                    className="border-b border-gray-50 hover:bg-blue-50/25 transition-colors cursor-pointer group">

                    {/* Ícone */}
                    <td className="py-3.5 pl-6 pr-2">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', ic)}>
                        <ShoppingBag size={13} />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 pr-4">
                      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', sc.badge)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sc.dot)} />
                        {sc.label}
                      </span>
                    </td>

                    {/* Nº */}
                    <td className="py-3.5 pr-4">
                      <span className="text-sm font-semibold text-gray-700">
                        #{String(p.codigo).padStart(3, '0')}
                      </span>
                    </td>

                    {/* Cliente + Representante */}
                    <td className="py-3.5 pr-4 max-w-[180px]">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.clienteNome}</p>
                      {p.representanteNome && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{p.representanteNome}</p>
                      )}
                    </td>

                    {/* Produtos */}
                    <td className="py-3.5 pr-4 relative" onClick={e => e.stopPropagation()}>
                      <ProdutosCell produtos={p.produtos ?? []} />
                    </td>

                    {/* Emissão */}
                    <td className="py-3.5 pr-4 text-sm text-gray-500 tabular-nums text-center">
                      {formatDate(p.dataEmissao)}
                    </td>

                    {/* Previsão */}
                    <td className="py-3.5 pr-4 tabular-nums text-center">
                      {p.dataPrevisaoEntrega ? (
                        <span className={cn(
                          'inline-flex items-center gap-1 text-sm',
                          od ? 'text-red-500 font-semibold'
                            : ds ? 'text-amber-500 font-medium'
                            : 'text-gray-500',
                        )}>
                          {od && <AlertCircle size={12} className="shrink-0" />}
                          {formatDate(p.dataPrevisaoEntrega)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3.5 pr-4 text-right">
                      <span className={cn(
                        'text-sm font-semibold tabular-nums',
                        p.status === 3 ? 'text-gray-300 line-through' : 'text-gray-800',
                      )}>
                        {formatCurrency(p.total)}
                      </span>
                    </td>

                    {/* Menu */}
                    <td className="py-3.5 pr-3 text-right">
                      <RowMenu pedido={p}
                        onEdit={() => navigate(`/comercial/pedidos/${p.id}/editar`)}
                        onConfirmar={() => setConfirmarTarget(p)}
                        onCancelar={() => setCancelarTarget(p)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer ── */}
      {!loading && !error && (
        <div className="shrink-0 px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400">
            {filtered.filter(p => p.status !== 3).length} {filtered.filter(p => p.status !== 3).length === 1 ? 'pedido ativo' : 'pedidos ativos'}
            {filtered.length !== pedidos.length && (
              <span className="text-gray-300"> · {pedidos.filter(p => p.status !== 3).length} no total</span>
            )}
          </span>

          <div className="flex items-center gap-3">
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={13} />
                </button>
                {pageButtons().map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors',
                      p === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200',
                    )}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded text-xs px-1 py-1 outline-none focus:border-blue-600 text-gray-700">
              {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} / página</option>)}
            </select>
          </div>
        </div>
      )}

      <ModalMsg
        aberto={confirmarTarget !== null}
        titulo="Confirmar pedido"
        descricao={confirmarTarget ? `Confirmar Pedido #${String(confirmarTarget.codigo).padStart(3, '0')}?` : ''}
        variante="aviso"
        labelConfirmar="Confirmar"
        onConfirmar={execConfirmar}
        onCancelar={() => setConfirmarTarget(null)}
      />
      <ModalMsg
        aberto={cancelarTarget !== null}
        titulo="Cancelar pedido"
        descricao={cancelarTarget ? `Cancelar Pedido #${String(cancelarTarget.codigo).padStart(3, '0')}? Esta ação não pode ser desfeita.` : ''}
        variante="perigo"
        labelConfirmar="Cancelar pedido"
        onConfirmar={execCancelar}
        onCancelar={() => setCancelarTarget(null)}
      />
    </div>
  );
}
