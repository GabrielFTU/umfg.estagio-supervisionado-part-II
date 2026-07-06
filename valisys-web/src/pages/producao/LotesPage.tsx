import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

interface LoteItem {
  id: string;
  codigoLote: string;
  dataAbertura: string;
  dataConclusao?: string;
  status: string;
  produtoNome: string;
  almoxarifadoNome: string;
  emUso: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS = ['todos', 'Pendente', 'EmProducao', 'Concluido', 'Cancelado'] as const;
type StatusFiltro = typeof STATUS_OPTIONS[number];

const STATUS_LABEL: Record<string, string> = {
  Pendente:   'Pendente',
  EmProducao: 'Em Produção',
  Concluido:  'Concluído',
  Cancelado:  'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  Pendente:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  EmProducao: 'bg-blue-50 text-blue-700 border-blue-200',
  Concluido:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelado:  'bg-gray-100 text-gray-500 border-gray-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border', STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500 border-gray-200')}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function RowMenu({ status, onEdit, onView, onCancel }: {
  status: string; onEdit: () => void; onView: () => void; onCancel: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
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
          btnRef.current && !btnRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('scroll', close, true); };
  }, [open]);

  const cancelavel = status !== 'Cancelado' && status !== 'Concluido';

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Visualizar</button>
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Editar</button>
          {cancelavel && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onCancel(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-500">
                Cancelar
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export function LotesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<LoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'edit' | 'cancel'; item: LoteItem } | null>(null);

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
    const res = await fetch('/api/lotes', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (item: LoteItem) => { setConfirmAction({ type: 'edit', item }); };
  const handleCancel = (item: LoteItem) => { setConfirmAction({ type: 'cancel', item }); };

  const execConfirm = async () => {
    if (!confirmAction) return;
    const { type, item } = confirmAction;
    setConfirmAction(null);
    if (type === 'edit') {
      navigate(`/lotes/${item.id}/editar`);
      return;
    }
    const token = localStorage.getItem('token');
    await fetch(`/api/lotes/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const filtered = items.filter(i => {
    if (search) {
      const q = search.toLowerCase();
      if (!i.codigoLote.toLowerCase().includes(q) && !i.produtoNome.toLowerCase().includes(q)) return false;
    }
    if (statusFiltro !== 'todos' && i.status !== statusFiltro) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const statusChipLabel = statusFiltro !== 'todos' ? STATUS_LABEL[statusFiltro] ?? statusFiltro : null;
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Informe o código do lote ou produto"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button onClick={() => navigate('/lotes/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors shrink-0">
          <Plus size={14} /> Novo
        </button>

        <div ref={filterRef} className="relative shrink-0">
          <button onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
              statusFiltro !== 'todos'
                ? 'border-[#1D4E89] bg-blue-50 text-[#1D4E89]'
                : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
            )}>
            <SlidersHorizontal size={15} />
          </button>

          {filterOpen && (
            <div onMouseDown={e => e.stopPropagation()}
              className="absolute z-30 right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
              {STATUS_OPTIONS.map(v => (
                <button key={v} onClick={() => { setStatusFiltro(v); setPage(1); setFilterOpen(false); }}
                  className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                    statusFiltro === v ? 'bg-[#1D4E89] text-white' : 'text-gray-600 hover:bg-gray-50')}>
                  {v === 'todos' ? 'Todos' : STATUS_LABEL[v]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chip filtro ativo */}
      {statusChipLabel && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            Status : {statusChipLabel}
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-semibold text-gray-700 px-6 py-3">Código do Lote</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Produto</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Almoxarifado</th>
                <th className="text-center font-semibold text-gray-700 px-4 py-3 w-36">Status</th>
                <th className="text-center font-semibold text-gray-700 px-4 py-3 w-32">Abertura</th>
                <th className="text-center font-semibold text-gray-700 px-4 py-3 w-32">Conclusão</th>
                <th className="w-10 pr-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : paginated.map(item => (
                <tr key={item.id}
                  onClick={() => navigate(`/lotes/${item.id}`)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-700">{item.codigoLote.toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-600">{item.produtoNome}</td>
                  <td className="px-4 py-3 text-gray-500">{item.almoxarifadoNome}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-center">{formatDate(item.dataAbertura)}</td>
                  <td className="px-4 py-3 text-gray-500 text-center">{formatDate(item.dataConclusao)}</td>
                  <td className="pr-4 text-right" onClick={e => e.stopPropagation()}>
                    <RowMenu status={item.status}
                      onView={() => navigate(`/lotes/${item.id}`)}
                      onEdit={() => handleEdit(item)}
                      onCancel={() => handleCancel(item)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {!loading && filtered.length > 0 && (
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3 text-sm text-gray-500">
          <span className="mr-4">Exibindo {filtered.length} registro{filtered.length !== 1 ? 's' : ''}.</span>
          <button onClick={() => goPage(1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
          <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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

      <ModalMsg
        aberto={confirmAction !== null}
        titulo={confirmAction?.type === 'edit' ? 'Editar lote' : 'Cancelar lote'}
        descricao={confirmAction ? (confirmAction.type === 'edit'
          ? `Editar lote "${confirmAction.item.codigoLote}"?`
          : `Cancelar lote "${confirmAction.item.codigoLote}"?`
        ) : ''}
        variante={confirmAction?.type === 'edit' ? 'info' : 'perigo'}
        labelConfirmar={confirmAction?.type === 'edit' ? 'Confirmar' : 'Cancelar lote'}
        onConfirmar={execConfirm}
        onCancelar={() => setConfirmAction(null)}
      />
    </div>
  );
}
