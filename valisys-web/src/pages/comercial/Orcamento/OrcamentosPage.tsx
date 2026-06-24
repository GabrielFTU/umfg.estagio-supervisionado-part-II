import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Loader2, MoreHorizontal,
  FileText, ChevronDown, SlidersHorizontal, ArrowRightCircle,
  Home, ChevronRight, ChevronLeft, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { DatePicker } from '@/components/ui/DatePicker';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusOrcamento = 0 | 1 | 2 | 3 | 4 | 5;

interface ProdutoItem { nome: string; quantidade: number }

interface OrcamentoItem {
  id: string;
  codigo: number;
  clienteNome: string;
  representanteNome: string | null;
  dataEmissao: string;
  dataValidade: string | null;
  total: number;
  status: StatusOrcamento;
  statusLabel: string;
  totalItens: number;
  produtos: ProdutoItem[];
}

const STATUS_CFG: Record<number, { label: string; dot: string; badge: string }> = {
  0: { label: 'RASCUNHO',   dot: 'bg-gray-500',    badge: 'text-gray-700 bg-gray-200'       },
  1: { label: 'ENVIADO',    dot: 'bg-blue-600',    badge: 'text-blue-800 bg-blue-100'       },
  2: { label: 'APROVADO',   dot: 'bg-emerald-600', badge: 'text-emerald-800 bg-emerald-100' },
  3: { label: 'EXPIRADO',   dot: 'bg-amber-600',   badge: 'text-amber-800 bg-amber-100'     },
  4: { label: 'CANCELADO',  dot: 'bg-red-600',     badge: 'text-red-800 bg-red-100'         },
  5: { label: 'CONVERTIDO', dot: 'bg-violet-600',  badge: 'text-violet-800 bg-violet-100'   },
};

const ICON_CFG: Record<number, string> = {
  0: 'bg-gray-200 text-gray-600',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-emerald-100 text-emerald-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-red-100 text-red-600',
  5: 'bg-violet-100 text-violet-700',
};

const PAGE_SIZE = 20;
const DEFAULT_STATUSES = [0, 1, 2];

// ─── Filters ──────────────────────────────────────────────────────────────────

interface Filters {
  statuses: number[];
  cliente: string;
  vendedor: string;
  produto: string;
  codigo: string;
  emissaoFrom: string;
  emissaoTo: string;
  validadeFrom: string;
  validadeTo: string;
}

const DEFAULT_FILTERS: Filters = {
  statuses: DEFAULT_STATUSES,
  cliente: '', vendedor: '', produto: '', codigo: '',
  emissaoFrom: '', emissaoTo: '', validadeFrom: '', validadeTo: '',
};

function filtersCount(f: Filters): number {
  let n = 0;
  if (JSON.stringify([...f.statuses].sort()) !== JSON.stringify([...DEFAULT_STATUSES].sort())) n++;
  if (f.cliente)      n++;
  if (f.vendedor)     n++;
  if (f.produto)      n++;
  if (f.codigo)       n++;
  if (f.emissaoFrom || f.emissaoTo) n++;
  if (f.validadeFrom || f.validadeTo) n++;
  return n;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ─── ProdutosCell ─────────────────────────────────────────────────────────────

function ProdutosCell({ produtos }: { produtos: ProdutoItem[] }) {
  const [hover, setHover] = useState(false);
  const [pos, setPos]     = useState({ top: 0, left: 0 });
  const cellRef           = useRef<HTMLDivElement>(null);

  if (produtos.length === 0) return <span className="text-gray-400">—</span>;

  if (produtos.length === 1)
    return <span className="text-sm text-gray-800 truncate max-w-[180px] block">{produtos[0].nome}</span>;

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
        <span className="text-sm text-gray-800 truncate">{produtos[0].nome}</span>
        <span className="shrink-0 text-[11px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
          +{extras} {extras === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {hover && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="min-w-[200px] max-w-xs bg-white border border-gray-300 rounded-xl shadow-xl py-2 text-[13px]"
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          {produtos.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50">
              <span className="text-gray-800 truncate">{p.nome}</span>
              <span className="text-gray-500 ml-3 shrink-0 font-medium">×{p.quantidade}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── RowMenu ──────────────────────────────────────────────────────────────────

function RowMenu({ orcamento, onView, onEdit, onEnviar, onCancelar, onConverter }: {
  orcamento: OrcamentoItem;
  onView: () => void;
  onEdit: () => void;
  onEnviar: () => void;
  onCancelar: () => void;
  onConverter: () => void;
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

  const s = orcamento.status;
  const canEdit      = s === 0 || s === 1 || s === 2;
  const canEnviar    = s === 0;
  const canCancelar  = s !== 4 && s !== 5;
  const canConverter = s !== 4 && s !== 5;

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100">Visualizar</button>
          {canEdit && (
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100">Editar</button>
          )}
          {(canEnviar || canCancelar || canConverter) && <div className="my-0.5 mx-2 border-t border-gray-200" />}
          {canEnviar && (
            <button onClick={() => { setOpen(false); onEnviar(); }}
              className="w-full text-left px-3 py-2 text-blue-700 hover:bg-blue-50">Enviar</button>
          )}
          {canConverter && (
            <button onClick={() => { setOpen(false); onConverter(); }}
              className="w-full text-left px-3 py-2 text-violet-700 hover:bg-violet-50 flex items-center gap-1.5">
              <ArrowRightCircle size={13} /> Transformar em Pedido
            </button>
          )}
          {canCancelar && (
            <button onClick={() => { setOpen(false); onCancelar(); }}
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50">Cancelar orçamento</button>
          )}
        </div>
      )}
    </>
  );
}

// ─── AcoesMenu ────────────────────────────────────────────────────────────────

function AcoesMenu({ selectedCount, onConverterLote, converting }: {
  selectedCount: number;
  onConverterLote: () => void;
  converting: boolean;
}) {
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
        className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors">
        Ações <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute z-30 left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-0.5 text-sm">
          <button
            onClick={() => { setOpen(false); onConverterLote(); }}
            disabled={selectedCount === 0 || converting}
            className={cn(
              'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors',
              selectedCount > 0 && !converting
                ? 'text-violet-700 hover:bg-violet-50 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed',
            )}>
            {converting ? <Loader2 size={13} className="animate-spin" /> : <ArrowRightCircle size={13} />}
            Transformar em Pedido
            {selectedCount > 0 && (
              <span className="ml-auto text-[11px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
          </button>
          {selectedCount === 0 && (
            <p className="px-3 pb-2 text-[11px] text-gray-400">Selecione orçamentos na lista</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FilterSelectField ────────────────────────────────────────────────────────

function FilterSelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const select = (v: string) => { onChange(v); setOpen(false); setSearch(''); };
  const clear  = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{label}</label>
      <button type="button"
        onClick={() => { setOpen(v => !v); if (!open) setTimeout(() => inputRef.current?.focus(), 40); }}
        className={cn(
          'w-full flex items-center justify-between h-8 px-3 text-sm rounded-lg border transition-colors bg-white',
          open ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400',
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
        <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-gray-200 bg-gray-50">
            <Search size={12} className="text-gray-400 shrink-0" />
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="flex-1 text-xs outline-none bg-transparent placeholder:text-gray-400 text-gray-800" />
          </div>
          <div className="overflow-y-auto max-h-36">
            <button type="button" onClick={() => select('')}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs transition-colors',
                !value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50',
              )}>
              Todos
            </button>
            {visible.length === 0 ? (
              <p className="px-3 py-3 text-xs text-gray-400 text-center">Nenhum resultado</p>
            ) : visible.map(opt => (
              <button key={opt} type="button" onClick={() => select(opt)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-xs transition-colors border-t border-gray-50',
                  opt === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50',
                )}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FiltersPanel ─────────────────────────────────────────────────────────────

function FiltersPanel({ filters, onChange, onClose, clientes, vendedores, produtos }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  clientes: string[];
  vendedores: string[];
  produtos: string[];
}) {
  const [local, setLocal] = useState<Filters>({ ...filters, statuses: [...filters.statuses] });
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setLocal(f => ({ ...f, [k]: v }));

  const toggleStatus = (s: number) => setLocal(f => ({
    ...f,
    statuses: f.statuses.includes(s) ? f.statuses.filter(x => x !== s) : [...f.statuses, s],
  }));

  const apply = () => { onChange(local); onClose(); };
  const reset = () => { const d = { ...DEFAULT_FILTERS, statuses: [...DEFAULT_FILTERS.statuses] }; setLocal(d); onChange(d); onClose(); };


  return (
    <div className="absolute z-40 right-0 top-full mt-1.5 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <span className="text-sm font-semibold text-gray-800">Filtros</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="p-4 space-y-5 max-h-[72vh] overflow-y-auto">

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Status</p>
          <div className="grid grid-cols-2 gap-1.5">
            {([0, 1, 2, 3, 4, 5] as number[]).map(s => {
              const cfg = STATUS_CFG[s];
              const active = local.statuses.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggleStatus(s)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
                    active
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
                  )}>
                  <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Nº do Orçamento</label>
          <input type="number" min={1} value={local.codigo} onChange={e => set('codigo', e.target.value)}
            placeholder="Ex: 42" className="w-full h-8 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-400 bg-white" />
        </div>

        <FilterSelectField
          label="Cliente"
          value={local.cliente}
          onChange={v => set('cliente', v)}
          options={clientes}
        />

        <FilterSelectField
          label="Vendedor / Representante"
          value={local.vendedor}
          onChange={v => set('vendedor', v)}
          options={vendedores}
        />

        <FilterSelectField
          label="Produto"
          value={local.produto}
          onChange={v => set('produto', v)}
          options={produtos}
        />

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Data de Emissão</p>
          <div className="flex items-center gap-2">
            <DatePicker value={local.emissaoFrom} onChange={v => set('emissaoFrom', v)} />
            <span className="text-xs text-gray-500 shrink-0">até</span>
            <DatePicker value={local.emissaoTo} onChange={v => set('emissaoTo', v)} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Validade</p>
          <div className="flex items-center gap-2">
            <DatePicker value={local.validadeFrom} onChange={v => set('validadeFrom', v)} />
            <span className="text-xs text-gray-500 shrink-0">até</span>
            <DatePicker value={local.validadeTo} onChange={v => set('validadeTo', v)} />
          </div>
        </div>

      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button onClick={reset} className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors">
          Redefinir padrão
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

export function OrcamentosPage() {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [search, setSearch]         = useState('');
  const [orcamentos, setOrcamentos] = useState<OrcamentoItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filters, setFilters]       = useState<Filters>({ ...DEFAULT_FILTERS, statuses: [...DEFAULT_STATUSES] });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [page, setPage]             = useState(1);
  const [converting, setConverting] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/orcamentos?pageSize=500', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrcamentos(Array.isArray(data) ? data : (data.items ?? []));
    } catch { setError('Não foi possível carregar os orçamentos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [search, filters]);

  const clienteOptions  = useMemo(() => [...new Set(orcamentos.map(o => o.clienteNome))].sort(), [orcamentos]);
  const vendedorOptions = useMemo(() => [...new Set(orcamentos.map(o => o.representanteNome).filter(Boolean) as string[])].sort(), [orcamentos]);
  const produtoOptions  = useMemo(() => [...new Set(orcamentos.flatMap(o => (o.produtos ?? []).map(p => p.nome)))].sort(), [orcamentos]);

  const filtered = useMemo(() => orcamentos.filter(o => {
    const q = search.toLowerCase();
    if (q && !o.clienteNome.toLowerCase().includes(q) && !String(o.codigo).includes(search)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(o.status)) return false;
    if (filters.cliente && !o.clienteNome.toLowerCase().includes(filters.cliente.toLowerCase())) return false;
    if (filters.vendedor && !(o.representanteNome ?? '').toLowerCase().includes(filters.vendedor.toLowerCase())) return false;
    if (filters.produto && !(o.produtos ?? []).some(p => p.nome.toLowerCase().includes(filters.produto.toLowerCase()))) return false;
    if (filters.codigo && String(o.codigo) !== filters.codigo) return false;
    if (filters.emissaoFrom && o.dataEmissao < filters.emissaoFrom) return false;
    if (filters.emissaoTo && o.dataEmissao > filters.emissaoTo + 'T23:59:59') return false;
    if (filters.validadeFrom && o.dataValidade && o.dataValidade < filters.validadeFrom) return false;
    if (filters.validadeTo && o.dataValidade && o.dataValidade > filters.validadeTo + 'T23:59:59') return false;
    return true;
  }), [orcamentos, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const pageIds     = paginated.map(o => o.id);
  const allChecked  = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const someChecked = pageIds.some(id => selected.has(id));

  const toggleAll = () => setSelected(prev => {
    const next = new Set(prev);
    if (allChecked) pageIds.forEach(id => next.delete(id));
    else pageIds.forEach(id => next.add(id));
    return next;
  });

  const toggleOne = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleEnviar = async (o: OrcamentoItem) => {
    if (!confirm(`Enviar Orçamento #${o.codigo}?`)) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/orcamentos/${o.id}/enviar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleCancelar = async (o: OrcamentoItem) => {
    if (!confirm(`Cancelar Orçamento #${o.codigo}? Esta ação não pode ser desfeita.`)) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/orcamentos/${o.id}/cancelar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleConverter = async (o: OrcamentoItem) => {
    if (!confirm(`Transformar Orçamento #${String(o.codigo).padStart(3, '0')} em Pedido de Venda?\nTodos os dados serão transferidos automaticamente.`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/orcamentos/${o.id}/converter-em-pedido`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const err = await res.json(); alert(err.detail ?? 'Erro ao converter.'); return; }
      const data = await res.json();
      showToast();
      navigate(`/comercial/pedidos/${data.pedidoVendaId}`);
    } catch { alert('Erro inesperado ao converter o orçamento.'); }
  };

  const handleConverterEmLote = async () => {
    const convertible = orcamentos.filter(o => selected.has(o.id) && o.status !== 4 && o.status !== 5);
    if (convertible.length === 0) { alert('Nenhum orçamento selecionado pode ser convertido.'); return; }
    if (!confirm(`Transformar ${convertible.length} orçamento(s) em Pedido de Venda?\nIsso criará ${convertible.length} pedido(s) automaticamente.`)) return;
    setConverting(true);
    const token = localStorage.getItem('token');
    let success = 0;
    for (const o of convertible) {
      try {
        const res = await fetch(`/api/orcamentos/${o.id}/converter-em-pedido`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) success++;
      } catch { /* skip */ }
    }
    setConverting(false);
    setSelected(new Set());
    showToast();
    if (success < convertible.length) alert(`${success} de ${convertible.length} orçamentos convertidos. Os demais podem já ter sido convertidos.`);
    load();
  };

  const activeFilters = filtersCount(filters);
  const selectedCount = selected.size;

  const pageButtons = () => {
    const buttons: number[] = [];
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    for (let i = start; i <= Math.min(start + 4, totalPages); i++) buttons.push(i);
    return buttons;
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Breadcrumb ── */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Comercial</span><ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Orçamentos</span>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selectedCount > 0 && (
        <div className="shrink-0 px-6 py-2.5 bg-blue-600 border-b border-blue-700 flex items-center gap-4">
          <span className="text-sm text-white font-semibold">{selectedCount} selecionado(s)</span>
          <button onClick={() => setSelected(new Set())}
            className="text-blue-200 hover:text-white text-xs font-medium transition-colors">Limpar seleção</button>
          <div className="ml-auto">
            <button onClick={handleConverterEmLote} disabled={converting}
              className="flex items-center gap-1.5 h-7 px-4 rounded-full bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-colors disabled:opacity-60">
              {converting ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightCircle size={12} />}
              Transformar em Pedido
            </button>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-400 focus:border-blue-600 focus:outline-none transition-colors placeholder:text-gray-400 text-gray-800"
            placeholder="Cliente ou número do orçamento"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button onClick={() => navigate('/comercial/orcamentos/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0">
          <Plus size={14} /> Novo
        </button>

        <AcoesMenu selectedCount={selectedCount} onConverterLote={handleConverterEmLote} converting={converting} />

        <div className="ml-auto">
          <div ref={filterRef} className="relative">
            <button onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-semibold transition-colors',
                activeFilters > 0
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50',
              )}>
              <SlidersHorizontal size={13} />
              Filtros
              {activeFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">
                  {activeFilters}
                </span>
              )}
            </button>
            {filterOpen && (
              <FiltersPanel
                filters={filters}
                onChange={f => { setFilters(f); setPage(1); }}
                onClose={() => setFilterOpen(false)}
                clientes={clienteOptions}
                vendedores={vendedorOptions}
                produtos={produtoOptions}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto">

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-600 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={load} className="text-xs text-blue-600 hover:underline font-medium">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16 text-center">
            <FileText size={36} className="text-gray-300" />
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || activeFilters ? 'Nenhum resultado encontrado' : 'Nenhum orçamento cadastrado'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {search || activeFilters ? 'Ajuste a busca ou os filtros.' : 'Clique em "Novo" para emitir o primeiro orçamento.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="w-full text-sm min-w-[940px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-10 py-3 pl-6">
                  <input type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                </th>
                <th className="w-9 py-3" />
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4 w-24">Orçamento</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4">Cliente</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4">Produtos</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4 w-32">Status</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4 w-24">Emissão</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4 w-24">Validade</th>
                <th className="text-right text-xs font-semibold text-gray-600 py-3 pr-4 w-28">Total</th>
                <th className="w-10 pr-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.map(o => {
                const sc = STATUS_CFG[o.status];
                const ic = ICON_CFG[o.status];
                const isSelected = selected.has(o.id);
                return (
                  <tr key={o.id}
                    onClick={() => navigate(`/comercial/orcamentos/${o.id}`)}
                    className={cn(
                      'border-b border-gray-100 transition-colors cursor-pointer',
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50',
                    )}>
                    <td className="py-3 pl-6" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(o.id)}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                    </td>
                    <td className="py-3 pr-2">
                      <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', ic)}>
                        <FileText size={13} />
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-semibold text-gray-800">
                        #{String(o.codigo).padStart(3, '0')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-800 max-w-[160px] truncate">{o.clienteNome}</td>
                    <td className="py-3 pr-4 relative" onClick={e => e.stopPropagation()}>
                      <ProdutosCell produtos={o.produtos ?? []} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full', sc.badge)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sc.dot)} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600 tabular-nums">{formatDate(o.dataEmissao)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-600 tabular-nums">{formatDate(o.dataValidade)}</td>
                    <td className="py-3 pr-4 text-right text-sm font-semibold text-gray-800 tabular-nums">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-3 pr-4 text-right" onClick={e => e.stopPropagation()}>
                      <RowMenu orcamento={o}
                        onView={() => navigate(`/comercial/orcamentos/${o.id}`)}
                        onEdit={() => navigate(`/comercial/orcamentos/${o.id}/editar`)}
                        onEnviar={() => handleEnviar(o)}
                        onCancelar={() => handleCancelar(o)}
                        onConverter={() => handleConverter(o)} />
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
        <div className="shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-gray-700">
            {filtered.length} {filtered.length === 1 ? 'orçamento' : 'orçamentos'}
            {filtered.length !== orcamentos.length && (
              <span className="font-normal text-gray-500"> de {orcamentos.length} total</span>
            )}
          </span>

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
        </div>
      )}
    </div>
  );
}
