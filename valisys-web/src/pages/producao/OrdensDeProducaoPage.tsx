import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, Factory, Home, ChevronRight,
  Loader2, MoreHorizontal, Play, Printer, Eye, Pencil, XCircle,
  AlertTriangle, ShoppingBag, ArrowUpDown, X, RefreshCw, ChevronUp,
  ChevronDown, LayoutGrid, List as ListIcon, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { fetchWithAuth } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrdemItem = {
  id: string;
  codigoOrdem: string;
  quantidade: number;
  status: string | number;
  dataInicio: string;
  dataFim: string | null;
  observacoes: string | null;
  produtoId: string;
  produtoNome: string;
  almoxarifadoId: string;
  almoxarifadoNome: string;
  faseAtualId: string;
  faseAtualNome: string;
  loteId: string | null;
  loteNumero: string | null;
  roteiroProducaoId: string | null;
  roteiroCodigo: string | null;
  pedidoId?: string;
  pedidoCodigo?: string;
  pedidoClienteNome?: string;
};

type SortField = 'codigoOrdem' | 'produtoNome' | 'dataInicio' | 'status' | 'faseAtualNome';
type SortDir = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  Ativa: 'Em Produção',
  Aguardando: 'Aguardando',
  Finalizada: 'Finalizada',
  Cancelada: 'Cancelada',
  '1': 'Em Produção',
  '2': 'Aguardando',
  '3': 'Finalizada',
  '4': 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  Ativa: 'bg-blue-50 text-blue-700 border border-blue-200',
  Aguardando: 'bg-amber-50 text-amber-700 border border-amber-200',
  Finalizada: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelada: 'bg-gray-100 text-gray-500 border border-gray-200',
  '1': 'bg-blue-50 text-blue-700 border border-blue-200',
  '2': 'bg-amber-50 text-amber-700 border border-amber-200',
  '3': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '4': 'bg-gray-100 text-gray-500 border border-gray-200',
};

const STATUS_KEYS = ['Ativa', 'Aguardando', 'Finalizada', 'Cancelada'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function statusStr(s: string | number): string {
  return String(s);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | number }) {
  const s = statusStr(status);
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[s] ?? 'bg-gray-100 text-gray-500')}>
      {STATUS_LABEL[s] ?? s}
    </span>
  );
}

function PedidoIndicator({ pedidoId, pedidoCodigo, clienteNome }: {
  pedidoId: string; pedidoCodigo?: string; clienteNome?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="relative group/pedido inline-flex items-center">
      <button
        onClick={e => { e.stopPropagation(); navigate(`/comercial/pedidos/${pedidoId}`); }}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-[#3B82F6] hover:bg-blue-100 transition-colors"
        aria-label={`Pedido ${pedidoCodigo ?? pedidoId}`}
      >
        <ShoppingBag size={9} />
      </button>
      <div className="
        pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2
        px-2.5 py-2 rounded-lg bg-gray-800 text-white text-xs whitespace-nowrap
        opacity-0 group-hover/pedido:opacity-100
        -translate-y-1 group-hover/pedido:translate-y-0
        transition-all duration-150 z-50 shadow-lg
        min-w-max
      ">
        <p className="font-semibold">Pedido {pedidoCodigo ?? pedidoId}</p>
        {clienteNome && <p className="text-gray-300 mt-0.5">{clienteNome}</p>}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

function SortHeader({ label, field, current, dir, onSort }: {
  label: string; field: SortField; current: SortField; dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors group"
    >
      {label}
      <span className={cn('transition-colors', active ? 'text-[#3B82F6]' : 'text-gray-300 group-hover:text-gray-400')}>
        {active
          ? (dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
          : <ArrowUpDown size={11} />}
      </span>
    </button>
  );
}

// ─── Row Menu ────────────────────────────────────────────────────────────────

interface RowMenuProps {
  ordem: OrdemItem;
  onView: () => void;
  onEdit: () => void;
  onIniciar: () => void;
  onCancelar: () => void;
  onImprimir: () => void;
}

function RowMenu({ ordem, onView, onEdit, onIniciar, onCancelar, onImprimir }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const s = statusStr(ordem.status);
  const podeIniciar = s === 'Aguardando' || s === '2';
  const podeEditar = s !== 'Finalizada' && s !== 'Cancelada' && s !== '3' && s !== '4';
  const podeCancelar = s !== 'Finalizada' && s !== 'Cancelada' && s !== '3' && s !== '4';

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(v => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          open ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
        )}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/[0.07] py-0.5 text-[13px]"
        >
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Eye size={13} /> Visualizar
          </button>
          {podeEditar && (
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Pencil size={13} /> Editar
            </button>
          )}

          {podeIniciar && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onIniciar(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
                <Play size={13} /> Iniciar Produção
              </button>
            </>
          )}

          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onImprimir(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Printer size={13} /> Imprimir
          </button>

          {podeCancelar && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onCancelar(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors">
                <XCircle size={13} /> Cancelar Ordem
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({ ordem, loading, onConfirm, onCancel }: {
  ordem: OrdemItem; loading: boolean;
  onConfirm: (justificativa: string) => void;
  onCancel: () => void;
}) {
  const [texto, setTexto] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCancel]);

  const handleConfirm = () => {
    setTouched(true);
    if (!texto.trim()) { inputRef.current?.focus(); return; }
    onConfirm(texto.trim());
  };

  const invalid = touched && !texto.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl shadow-black/10 w-full max-w-sm mx-4 overflow-hidden border border-gray-100">
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={17} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">Cancelar Ordem</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {ordem.codigoOrdem} — {ordem.produtoNome}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 pb-2">
          <p className="text-xs text-gray-500 mb-2">
            Esta ação não pode ser desfeita. Informe o motivo do cancelamento:
          </p>
          <textarea
            ref={inputRef}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleConfirm(); }}
            placeholder="Descreva o motivo do cancelamento…"
            rows={3}
            className={cn(
              'w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-red-400 resize-none placeholder:text-gray-300',
              invalid ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-200',
            )}
          />
          {invalid && (
            <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 inline-block" />
              Justificativa obrigatória
            </p>
          )}
          <p className="text-[11px] text-gray-400 mt-1">Ctrl+Enter para confirmar</p>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Voltar
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {loading ? <Loader2 size={13} className="animate-spin" /> : null}
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Print Modal ─────────────────────────────────────────────────────────────

function PrintModal({ ordem, onClose }: { ordem: OrdemItem; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-gray-500" />
            <span className="font-semibold text-sm text-gray-800">Imprimir Ordem de Produção</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 text-sm" id="print-content">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-800">{ordem.codigoOrdem}</span>
            <StatusBadge status={ordem.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">Produto</p>
              <p className="font-medium text-gray-700">{ordem.produtoNome}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Qtd. Planejada</p>
              <p className="font-medium text-gray-700">{ordem.quantidade.toLocaleString('pt-BR')}</p>
            </div>
            {ordem.loteNumero && (
              <div>
                <p className="text-gray-400 mb-0.5">Lote</p>
                <p className="font-medium text-gray-700">{ordem.loteNumero}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 mb-0.5">Fase Atual</p>
              <p className="font-medium text-gray-700">{ordem.faseAtualNome || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Almoxarifado</p>
              <p className="font-medium text-gray-700">{ordem.almoxarifadoNome}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Data de Início</p>
              <p className="font-medium text-gray-700">{fmtDate(ordem.dataInicio)}</p>
            </div>
            {ordem.roteiroCodigo && (
              <div>
                <p className="text-gray-400 mb-0.5">Roteiro</p>
                <p className="font-medium text-gray-700">{ordem.roteiroCodigo}</p>
              </div>
            )}
            {ordem.dataFim && (
              <div>
                <p className="text-gray-400 mb-0.5">Data de Conclusão</p>
                <p className="font-medium text-gray-700">{fmtDate(ordem.dataFim)}</p>
              </div>
            )}
          </div>

          {ordem.observacoes && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-400 text-xs mb-0.5">Observações</p>
              <p className="text-xs text-gray-600">{ordem.observacoes}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <span>Impresso em {new Date().toLocaleString('pt-BR')}</span>
            <span className="font-mono text-gray-500">{ordem.codigoOrdem}</span>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            Fechar
          </button>
          <button onClick={() => window.print()}
            className="flex-1 h-9 rounded-lg bg-[#3B82F6] hover:bg-[#2563eb] text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
            <Printer size={13} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterState {
  status: string[];
  fase: string;
  dateFrom: string;
  dateTo: string;
  atrasadas: boolean;
}

function FilterPanel({
  fases, filters, onApply, onClear, onClose,
}: {
  fases: string[];
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);

  return (
    <div className="absolute z-30 top-full right-0 mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Filtros</span>
        <button onClick={onClear} className="text-[11px] text-red-400 hover:text-red-600 transition-colors">
          Limpar tudo
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_KEYS.map(s => (
            <button
              key={s}
              onClick={() => setLocal(prev => ({
                ...prev,
                status: prev.status.includes(s)
                  ? prev.status.filter(x => x !== s)
                  : [...prev.status, s],
              }))}
              className={cn(
                'text-xs py-1 px-2.5 rounded-full border transition-colors',
                local.status.includes(s)
                  ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300',
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {fases.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Fase Atual</p>
          <select
            value={local.fase}
            onChange={e => setLocal(prev => ({ ...prev, fase: e.target.value }))}
            className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#3B82F6] bg-white text-gray-700"
          >
            <option value="">Todas as fases</option>
            {fases.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Período de Criação</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 mb-0.5 block">De</label>
            <input
              type="date"
              value={local.dateFrom}
              onChange={e => setLocal(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 mb-0.5 block">Até</label>
            <input
              type="date"
              value={local.dateTo}
              onChange={e => setLocal(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="atrasadas"
          checked={local.atrasadas}
          onChange={e => setLocal(prev => ({ ...prev, atrasadas: e.target.checked }))}
          className="w-3.5 h-3.5 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]"
        />
        <label htmlFor="atrasadas" className="text-xs text-gray-600 cursor-pointer">
          Apenas ordens atrasadas
        </label>
      </div>

      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button onClick={onClose}
          className="flex-1 h-8 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Fechar
        </button>
        <button onClick={() => { onApply(local); onClose(); }}
          className="flex-1 h-8 text-xs text-white bg-[#3B82F6] hover:bg-[#2563eb] rounded-lg transition-colors font-medium">
          Aplicar
        </button>
      </div>
    </div>
  );
}

// ─── Card (grid view) ────────────────────────────────────────────────────────

function OrdemCard({ ordem, onView, onEdit, onIniciar, onCancelar, onImprimir }: {
  ordem: OrdemItem;
  onView: () => void; onEdit: () => void;
  onIniciar: () => void; onCancelar: () => void; onImprimir: () => void;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-700 font-mono">{ordem.codigoOrdem}</p>
          {ordem.loteNumero && (
            <p className="text-[10px] text-gray-400 mt-0.5">Lote {ordem.loteNumero}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {ordem.pedidoId && (
            <PedidoIndicator pedidoId={ordem.pedidoId} pedidoCodigo={ordem.pedidoCodigo} clienteNome={ordem.pedidoClienteNome} />
          )}
          <RowMenu ordem={ordem} onView={onView} onEdit={onEdit} onIniciar={onIniciar} onCancelar={onCancelar} onImprimir={onImprimir} />
        </div>
      </div>

      <p className="text-sm font-medium text-gray-800 truncate mb-2">{ordem.produtoNome}</p>

      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
        <span>Qtd: <strong className="text-gray-700">{ordem.quantidade.toLocaleString('pt-BR')}</strong></span>
        <span>{ordem.faseAtualNome || '—'}</span>
      </div>

      <div className="flex items-center justify-between">
        <StatusBadge status={ordem.status} />
        <span className="text-[10px] text-gray-400">{fmtDate(ordem.dataInicio)}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OrdensDeProducaoPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [ordens, setOrdens]       = useState<OrdemItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('dataInicio');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [filters, setFilters] = useState<FilterState>({
    status: [], fase: '', dateFrom: '', dateTo: '', atrasadas: false,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [cancelTarget, setCancelTarget] = useState<OrdemItem | null>(null);
  const [printTarget, setPrintTarget] = useState<OrdemItem | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/api/ordens-producao');
      if (res.status === 403) { setOrdens([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      const lista: OrdemItem[] = data.map(o => ({
        id: o.id,
        codigoOrdem: o.codigoOrdem,
        quantidade: o.quantidade ?? 0,
        status: o.status,
        dataInicio: o.dataInicio,
        dataFim: o.dataFim ?? null,
        observacoes: o.observacoes ?? null,
        produtoId: o.produtoId,
        produtoNome: o.produtoNome ?? '—',
        almoxarifadoId: o.almoxarifadoId,
        almoxarifadoNome: o.almoxarifadoNome ?? '—',
        faseAtualId: o.faseAtualId,
        faseAtualNome: o.faseAtualNome ?? '—',
        loteId: o.loteId ?? null,
        loteNumero: o.loteNumero ?? null,
        roteiroProducaoId: o.roteiroProducaoId ?? null,
        roteiroCodigo: o.roteiroCodigo ?? null,
        pedidoId: o.pedidoId ?? undefined,
        pedidoCodigo: o.pedidoCodigo ?? undefined,
        pedidoClienteNome: o.pedidoClienteNome ?? undefined,
      }));
      setOrdens(lista);
    } catch {
      setError('Não foi possível carregar as ordens de produção.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleIniciarProducao = async (ordem: OrdemItem) => {
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordem.id}/avancar-fase`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Não foi possível iniciar a produção.');
      showToast(`Produção iniciada: ${ordem.codigoOrdem}`);
      load();
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao iniciar produção.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async (ordem: OrdemItem, justificativa: string) => {
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordem.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificativa }),
      });
      if (!res.ok) throw new Error('Não foi possível cancelar a ordem.');
      showToast(`Ordem ${ordem.codigoOrdem} cancelada.`);
      setCancelTarget(null);
      load();
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao cancelar ordem.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) =>
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleSelectAll = (visible: OrdemItem[]) =>
    setSelected(prev =>
      prev.size === visible.length ? new Set() : new Set(visible.map(o => o.id)),
    );

  const fases = Array.from(new Set(ordens.map(o => o.faseAtualNome).filter(Boolean)));

  const filtrosAtivos = filters.status.length + (filters.fase ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0) + (filters.atrasadas ? 1 : 0);

  const filtered = ordens.filter(o => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.codigoOrdem.toLowerCase().includes(q) &&
        !o.produtoNome.toLowerCase().includes(q) &&
        !(o.loteNumero ?? '').toLowerCase().includes(q) &&
        !(o.pedidoCodigo ?? '').toLowerCase().includes(q))
        return false;
    }
    if (filters.status.length && !filters.status.includes(statusStr(o.status))) return false;
    if (filters.fase && o.faseAtualNome !== filters.fase) return false;
    if (filters.dateFrom && new Date(o.dataInicio) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(o.dataInicio) > new Date(filters.dateTo + 'T23:59:59')) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: string | number = a[sortField] as string ?? '';
    let vb: string | number = b[sortField] as string ?? '';
    if (sortField === 'dataInicio') {
      va = new Date(a.dataInicio).getTime();
      vb = new Date(b.dataInicio).getTime();
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const removeStatusFilter = (s: string) =>
    setFilters(prev => ({ ...prev, status: prev.status.filter(x => x !== s) }));

  const clearFilters = () =>
    setFilters({ status: [], fase: '', dateFrom: '', dateTo: '', atrasadas: false });

  return (
    <div className="flex flex-col h-full">

      {/* Breadcrumb */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Ordens de Produção</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200/50 bg-white">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6] transition-all placeholder:text-gray-400"
              placeholder="Buscar por ordem, produto ou lote…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter button */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs font-medium transition-colors',
                filtrosAtivos
                  ? 'bg-blue-50 border-[#3B82F6] text-[#3B82F6]'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400',
              )}
            >
              <SlidersHorizontal size={13} />
              Filtros
              {filtrosAtivos > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center">
                  {filtrosAtivos}
                </span>
              )}
            </button>
            {filterOpen && (
              <div onMouseDown={e => e.stopPropagation()}>
                <FilterPanel
                  fases={fases}
                  filters={filters}
                  onApply={setFilters}
                  onClear={clearFilters}
                  onClose={() => setFilterOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:ml-auto">
            <button
              onClick={load}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              title="Atualizar"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* View toggle */}
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'h-9 w-9 flex items-center justify-center transition-colors',
                  viewMode === 'table' ? 'bg-[#3B82F6] text-white' : 'text-gray-500 hover:bg-gray-50',
                )}
                title="Visualização em lista"
              >
                <ListIcon size={13} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-9 w-9 flex items-center justify-center transition-colors',
                  viewMode === 'grid' ? 'bg-[#3B82F6] text-white' : 'text-gray-500 hover:bg-gray-50',
                )}
                title="Visualização em grade"
              >
                <LayoutGrid size={13} />
              </button>
            </div>

            <button
              onClick={() => navigate('/producao/ordens/novo')}
              className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] shadow-sm shadow-blue-200 transition-colors shrink-0"
            >
              <Plus size={15} /> Nova Ordem
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {filtrosAtivos > 0 && (
        <div className="shrink-0 px-4 sm:px-6 py-2 border-b border-gray-100 bg-white flex flex-wrap gap-2">
          {filters.status.map(s => (
            <span key={s} className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-blue-50 text-[#3B82F6] text-xs font-medium border border-blue-200">
              Status: {STATUS_LABEL[s]}
              <button onClick={() => removeStatusFilter(s)} className="hover:text-blue-800 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
          {filters.fase && (
            <span className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-blue-50 text-[#3B82F6] text-xs font-medium border border-blue-200">
              Fase: {filters.fase}
              <button onClick={() => setFilters(p => ({ ...p, fase: '' }))} className="hover:text-blue-800 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-blue-50 text-[#3B82F6] text-xs font-medium border border-blue-200">
              A partir de: {new Date(filters.dateFrom).toLocaleDateString('pt-BR')}
              <button onClick={() => setFilters(p => ({ ...p, dateFrom: '' }))} className="hover:text-blue-800 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-blue-50 text-[#3B82F6] text-xs font-medium border border-blue-200">
              Até: {new Date(filters.dateTo).toLocaleDateString('pt-BR')}
              <button onClick={() => setFilters(p => ({ ...p, dateTo: '' }))} className="hover:text-blue-800 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          )}
          {filters.atrasadas && (
            <span className="flex items-center gap-1 h-6 px-2.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
              <AlertTriangle size={9} /> Apenas atrasadas
              <button onClick={() => setFilters(p => ({ ...p, atrasadas: false }))} className="hover:text-amber-900 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          )}
          <button onClick={clearFilters} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors ml-1">
            Limpar tudo
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando ordens de produção…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#3B82F6] hover:underline">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Factory size={28} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || filtrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhuma ordem de produção cadastrada'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || filtrosAtivos ? 'Ajuste os filtros ou a busca.' : 'Clique em "Nova Ordem" para criar a primeira.'}
              </p>
            </div>
            {!search && !filtrosAtivos && (
              <button
                onClick={() => navigate('/producao/ordens/novo')}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#3B82F6] text-white text-sm hover:bg-[#2563eb] transition-colors"
              >
                <Plus size={14} /> Criar ordem de produção
              </button>
            )}
          </div>
        )}

        {!loading && !error && sorted.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sorted.map(o => (
              <OrdemCard
                key={o.id}
                ordem={o}
                onView={() => navigate(`/producao/ordens/${o.id}`)}
                onEdit={() => navigate(`/producao/ordens/${o.id}/editar`)}
                onIniciar={() => handleIniciarProducao(o)}
                onCancelar={() => setCancelTarget(o)}
                onImprimir={() => setPrintTarget(o)}
              />
            ))}
          </div>
        )}

        {!loading && !error && sorted.length > 0 && viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="w-10 py-2.5 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={selected.size === sorted.length && sorted.length > 0}
                        onChange={() => toggleSelectAll(sorted)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]"
                      />
                    </th>
                    <th className="text-left py-2.5 pr-4 min-w-[120px]">
                      <SortHeader label="Ordem" field="codigoOrdem" current={sortField} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-4">Lote</th>
                    <th className="text-left py-2.5 pr-4 min-w-[200px]">
                      <SortHeader label="Produto" field="produtoNome" current={sortField} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-left py-2.5 pr-4 min-w-[120px]">
                      <SortHeader label="Fase Atual" field="faseAtualNome" current={sortField} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-left py-2.5 pr-4">
                      <SortHeader label="Data Início" field="dataInicio" current={sortField} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-4">Qtd.</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-4">Almoxarifado</th>
                    <th className="text-left py-2.5 pr-4">
                      <SortHeader label="Status" field="status" current={sortField} dir={sortDir} onSort={handleSort} />
                    </th>
                    <th className="w-10 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(o => (
                    <tr
                      key={o.id}
                      className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={selected.has(o.id)}
                          onChange={() => toggleSelect(o.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => navigate(`/producao/ordens/${o.id}`)}
                          className="text-xs font-bold text-gray-700 font-mono hover:text-[#3B82F6] transition-colors"
                        >
                          {o.codigoOrdem}
                        </button>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500">
                        {o.loteNumero ? (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px]">{o.loteNumero}</span>
                        ) : '—'}
                      </td>
                      <td className="py-3 pr-4 max-w-[200px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => navigate(`/producao/ordens/${o.id}`)}
                            className="text-xs font-medium text-[#3B82F6] hover:text-[#2563eb] truncate transition-colors text-left"
                          >
                            {o.produtoNome}
                          </button>
                          {o.pedidoId && (
                            <PedidoIndicator
                              pedidoId={o.pedidoId}
                              pedidoCodigo={o.pedidoCodigo}
                              clienteNome={o.pedidoClienteNome}
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600">{o.faseAtualNome || '—'}</td>
                      <td className="py-3 pr-4 text-xs text-gray-500 tabular-nums">{fmtDate(o.dataInicio)}</td>
                      <td className="py-3 pr-4 text-xs text-right text-gray-700 font-medium tabular-nums">
                        {o.quantidade.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500 truncate max-w-[120px]">{o.almoxarifadoNome}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <RowMenu
                          ordem={o}
                          onView={() => navigate(`/producao/ordens/${o.id}`)}
                          onEdit={() => navigate(`/producao/ordens/${o.id}/editar`)}
                          onIniciar={() => handleIniciarProducao(o)}
                          onCancelar={() => setCancelTarget(o)}
                          onImprimir={() => setPrintTarget(o)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {sorted.length} ordem{sorted.length !== 1 ? 's' : ''}
                {filtrosAtivos || search ? ` (filtrado de ${ordens.length})` : ''}
              </span>
              {selected.size > 0 && (
                <span className="text-xs text-[#3B82F6] font-medium">
                  {selected.size} selecionada{selected.size !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {cancelTarget && (
        <CancelModal
          ordem={cancelTarget}
          loading={actionLoading}
          onConfirm={(just) => handleCancelar(cancelTarget, just)}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {printTarget && (
        <PrintModal
          ordem={printTarget}
          onClose={() => setPrintTarget(null)}
        />
      )}
    </div>
  );
}
