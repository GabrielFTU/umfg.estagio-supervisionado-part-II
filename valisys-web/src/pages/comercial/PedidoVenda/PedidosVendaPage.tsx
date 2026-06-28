import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Loader2, MoreHorizontal,
  ShoppingBag, ChevronDown, SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusPedido = 0 | 1 | 2 | 3;

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
}

const STATUS_CFG: Record<number, { label: string; color: string }> = {
  0: { label: 'RASCUNHO',    color: 'text-gray-400'   },
  1: { label: 'CONFIRMADO',  color: 'text-blue-500'   },
  2: { label: 'CONCLUÍDO',   color: 'text-emerald-500' },
  3: { label: 'CANCELADO',   color: 'text-red-400'    },
};

const ICON_CFG: Record<number, string> = {
  0: 'bg-gray-100 text-gray-400',
  1: 'bg-blue-50 text-blue-400',
  2: 'bg-emerald-50 text-emerald-500',
  3: 'bg-red-50 text-red-400',
};

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ─── RowMenu ──────────────────────────────────────────────────────────────────

function RowMenu({ pedido, onView, onEdit, onConfirmar, onCancelar }: {
  pedido: PedidoItem;
  onView: () => void; onEdit: () => void;
  onConfirmar: () => void; onCancelar: () => void;
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
      <button ref={btnRef} onClick={toggle}
        className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Visualizar</button>
          {canEdit && (
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Editar</button>
          )}
          {(canConfirmar || canCancelar) && <div className="my-0.5 mx-2 border-t border-gray-100" />}
          {canConfirmar && (
            <button onClick={() => { setOpen(false); onConfirmar(); }}
              className="w-full text-left px-3 py-1.5 text-blue-600 hover:bg-blue-50">Confirmar</button>
          )}
          {canCancelar && (
            <button onClick={() => { setOpen(false); onCancelar(); }}
              className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50">Cancelar pedido</button>
          )}
        </div>
      )}
    </>
  );
}

// ─── Ações dropdown ───────────────────────────────────────────────────────────

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
        <div className="absolute z-30 left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-sm">
          <button className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Exportar CSV</button>
          <button className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Imprimir listagem</button>
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
  const [statusFiltro, setStatusFiltro] = useState<'' | '0' | '1' | '2' | '3'>('');
  const [filterOpen, setFilterOpen]     = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmarTarget, setConfirmarTarget] = useState<PedidoItem | null>(null);
  const [cancelarTarget, setCancelarTarget]   = useState<PedidoItem | null>(null);

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
      const res = await fetch('/api/pedidos-venda', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setPedidos(await res.json());
    } catch { setError('Não foi possível carregar os pedidos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleConfirmar = (p: PedidoItem) => { setConfirmarTarget(p); };

  const execConfirmar = async () => {
    if (!confirmarTarget) return;
    const p = confirmarTarget;
    setConfirmarTarget(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/pedidos-venda/${p.id}/confirmar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleCancelar = (p: PedidoItem) => { setCancelarTarget(p); };

  const execCancelar = async () => {
    if (!cancelarTarget) return;
    const p = cancelarTarget;
    setCancelarTarget(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/pedidos-venda/${p.id}/cancelar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const filtered = pedidos.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.clienteNome.toLowerCase().includes(q) && !String(p.codigo).includes(search)) return false;
    if (statusFiltro !== '' && p.status !== Number(statusFiltro)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Cabeçalho ── */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1">Comercial</p>
        <h1 className="text-lg font-semibold text-gray-800">Pedidos de Venda</h1>
      </div>

      {/* ── Barra de ferramentas ── */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-100 flex items-center gap-3">
        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#3B82F6] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Informe o cliente ou número do pedido"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Novo */}
        <button onClick={() => navigate('/comercial/pedidos/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors shrink-0">
          <Plus size={14} /> Novo
        </button>

        {/* Ações */}
        <AcoesMenu />

        <div className="ml-auto flex items-center gap-2">
          {/* Filtro de status */}
          <div ref={filterRef} className="relative">
            <button onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
                statusFiltro !== ''
                  ? 'border-[#3B82F6] bg-blue-50 text-[#3B82F6]'
                  : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
              )}>
              <SlidersHorizontal size={15} />
            </button>
            {filterOpen && (
              <div onMouseDown={e => e.stopPropagation()}
                className="absolute z-30 right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-600">Status</span>
                  {statusFiltro !== '' && (
                    <button onClick={() => setStatusFiltro('')} className="text-[11px] text-red-400 hover:text-red-600">Limpar</button>
                  )}
                </div>
                <div className="space-y-1">
                  {(['', '0', '1', '2', '3'] as const).map(v => (
                    <button key={v} onClick={() => setStatusFiltro(v)}
                      className={cn(
                        'w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors',
                        statusFiltro === v ? 'bg-[#3B82F6] text-white' : 'text-gray-600 hover:bg-gray-50',
                      )}>
                      {v === '' ? 'Todos' : STATUS_CFG[Number(v)].label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto">

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#3B82F6] hover:underline">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16 text-center">
            <ShoppingBag size={36} className="text-gray-200" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                {search || statusFiltro ? 'Nenhum resultado encontrado' : 'Nenhum pedido cadastrado'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || statusFiltro ? 'Ajuste a busca ou os filtros.' : 'Clique em "Novo" para emitir o primeiro pedido.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <table className="w-full text-sm min-w-[780px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-10 py-3 pl-6" />
                  <th className="text-left text-xs font-semibold text-gray-400 py-3 pr-6 w-32">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-400 py-3 pr-6 w-28">Pedido</th>
                  <th className="text-left text-xs font-semibold text-gray-400 py-3 pr-6">Cliente</th>
                  <th className="text-center text-xs font-semibold text-gray-400 py-3 pr-6 w-28">Emissão</th>
                  <th className="text-center text-xs font-semibold text-gray-400 py-3 pr-6 w-32">Prev. Entrega</th>
                  <th className="text-right text-xs font-semibold text-gray-400 py-3 pr-6 w-28">Itens</th>
                  <th className="text-right text-xs font-semibold text-gray-400 py-3 pr-6 w-32">Total</th>
                  <th className="w-10 pr-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const sc = STATUS_CFG[p.status];
                  const ic = ICON_CFG[p.status];
                  return (
                    <tr key={p.id}
                      onClick={() => navigate(`/comercial/pedidos/${p.id}`)}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                      <td className="py-3 pl-6">
                        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', ic)}>
                          <ShoppingBag size={13} />
                        </div>
                      </td>
                      <td className="py-3 pr-6">
                        <span className={cn('text-[11px] font-semibold tracking-wide', sc.color)}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3 pr-6">
                        <span className="text-sm font-medium text-gray-700">
                          #{String(p.codigo).padStart(3, '0')}
                        </span>
                      </td>
                      <td className="py-3 pr-6 text-sm text-gray-700">{p.clienteNome}</td>
                      <td className="py-3 pr-6 text-sm text-gray-500 tabular-nums text-center">{formatDate(p.dataEmissao)}</td>
                      <td className="py-3 pr-6 text-sm text-gray-500 tabular-nums text-center">{formatDate(p.dataPrevisaoEntrega)}</td>
                      <td className="py-3 pr-6 text-right text-sm text-gray-500">{p.totalItens}</td>
                      <td className="py-3 pr-6 text-right text-sm font-medium text-gray-700 tabular-nums">
                        {formatCurrency(p.total)}
                      </td>
                      <td className="py-3 pr-4 text-right" onClick={e => e.stopPropagation()}>
                        <RowMenu pedido={p}
                          onView={() => navigate(`/comercial/pedidos/${p.id}`)}
                          onEdit={() => navigate(`/comercial/pedidos/${p.id}/editar`)}
                          onConfirmar={() => handleConfirmar(p)}
                          onCancelar={() => handleCancelar(p)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Rodapé */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {filtered.length} {filtered.length === 1 ? 'pedido' : 'pedidos'}
                {filtered.length !== pedidos.length && ` de ${pedidos.length}`}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Total: {formatCurrency(filtered.filter(p => p.status !== 3).reduce((s, p) => s + p.total, 0))}
              </span>
            </div>
          </>
        )}
      </div>

      <ModalMsg
        aberto={confirmarTarget !== null}
        titulo="Confirmar pedido"
        descricao={confirmarTarget ? `Confirmar Pedido #${confirmarTarget.codigo}?` : ''}
        variante="aviso"
        labelConfirmar="Confirmar"
        onConfirmar={execConfirmar}
        onCancelar={() => setConfirmarTarget(null)}
      />
      <ModalMsg
        aberto={cancelarTarget !== null}
        titulo="Cancelar pedido"
        descricao={cancelarTarget ? `Cancelar Pedido #${cancelarTarget.codigo}? Esta ação não pode ser desfeita.` : ''}
        variante="perigo"
        labelConfirmar="Cancelar pedido"
        onConfirmar={execCancelar}
        onCancelar={() => setCancelarTarget(null)}
      />
    </div>
  );
}
