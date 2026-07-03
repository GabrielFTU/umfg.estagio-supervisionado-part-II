import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Loader2, SlidersHorizontal, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

interface RoteiroItem {
  id: string;
  codigo: string;
  produtoNome: string;
  tempoTotal: number;
  etapas: { id: string }[];
  ativo: boolean;
}

const STATUS_OPTIONS = ['todos', 'ativo', 'inativo'] as const;
type StatusFiltro = typeof STATUS_OPTIONS[number];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) close();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={toggle} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]"
        >
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50"
          >
            Editar
          </button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-500"
          >
            Excluir
          </button>
        </div>
      )}
    </>
  );
}

export function RoteiroProducaoPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RoteiroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('ativo');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmTarget, setConfirmTarget] = useState<RoteiroItem | null>(null);

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
    const res = await fetch('/api/roteiros-producao', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (item: RoteiroItem) => { setConfirmTarget(item); };

  const execDelete = async () => {
    if (!confirmTarget) return;
    const item = confirmTarget;
    setConfirmTarget(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/roteiros-producao/${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const filtered = items.filter(i => {
    if (search) {
      const q = search.toLowerCase();
      if (!i.codigo.toLowerCase().includes(q) && !i.produtoNome.toLowerCase().includes(q)) return false;
    }
    if (statusFiltro === 'ativo' && !i.ativo) return false;
    if (statusFiltro === 'inativo' && i.ativo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const statusChipLabel =
    statusFiltro === 'ativo' ? 'Apenas Ativos' :
    statusFiltro === 'inativo' ? 'Apenas Inativos' : null;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Buscar por código ou produto..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button
          onClick={() => navigate('/producao/roteiros/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors shrink-0"
        >
          <Plus size={14} /> Novo
        </button>

        <div ref={filterRef} className="relative shrink-0">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
              statusFiltro !== 'todos'
                ? 'border-[#1D4E89] bg-blue-50 text-[#1D4E89]'
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
              {STATUS_OPTIONS.map(v => (
                <button
                  key={v}
                  onClick={() => { setStatusFiltro(v); setPage(1); setFilterOpen(false); }}
                  className={cn(
                    'w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                    statusFiltro === v ? 'bg-[#1D4E89] text-white' : 'text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {v === 'todos' ? 'Todos' : v === 'ativo' ? 'Apenas Ativos' : 'Apenas Inativos'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chip de filtro ativo */}
      {statusChipLabel && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            Status: {statusChipLabel}
            <button onClick={() => setStatusFiltro('todos')} className="hover:text-blue-800">
              <X size={11} />
            </button>
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
                <th className="text-left font-semibold text-gray-700 px-6 py-3">Código</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Produto</th>
                <th className="text-center font-semibold text-gray-700 px-4 py-3 w-36">Tempo Total</th>
                <th className="text-center font-semibold text-gray-700 px-4 py-3 w-24">Etapas</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 w-28">Status</th>
                <th className="w-10 pr-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    {search || statusFiltro !== 'todos'
                      ? 'Nenhum roteiro encontrado com os filtros aplicados.'
                      : 'Nenhum roteiro de produção cadastrado.'}
                  </td>
                </tr>
              ) : paginated.map(item => (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/producao/roteiros/${item.id}/editar`)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-700">{item.codigo}</td>
                  <td className="px-4 py-3 text-gray-600">{item.produtoNome}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
                      <Clock size={13} className="text-gray-400" />
                      {item.tempoTotal} dias
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {item.etapas ? item.etapas.length : 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full font-medium border',
                      item.ativo
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200',
                    )}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="pr-4 text-right" onClick={e => e.stopPropagation()}>
                    <RowMenu
                      onEdit={() => navigate(`/producao/roteiros/${item.id}/editar`)}
                      onDelete={() => handleDelete(item)}
                    />
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
          <span className="mr-4">
            Exibindo {filtered.length} registro{filtered.length !== 1 ? 's' : ''}.
          </span>
          <button onClick={() => goPage(1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
          <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => goPage(p)}
              className={cn(
                'w-7 h-7 rounded-full text-sm transition-colors',
                p === page ? 'bg-blue-100 text-[#1D4E89] font-semibold' : 'hover:bg-gray-100',
              )}
            >
              {p}
            </button>
          ))}
          <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>'}</button>
          <button onClick={() => goPage(totalPages)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>>'}</button>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="ml-2 border border-gray-300 rounded text-xs px-1 py-0.5 outline-none focus:border-[#1D4E89]"
          >
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <ModalMsg
        aberto={confirmTarget !== null}
        titulo="Excluir roteiro"
        descricao={confirmTarget ? `Excluir roteiro "${confirmTarget.codigo}"?` : ''}
        variante="perigo"
        onConfirmar={execDelete}
        onCancelar={() => setConfirmTarget(null)}
      />
    </div>
  );
}
