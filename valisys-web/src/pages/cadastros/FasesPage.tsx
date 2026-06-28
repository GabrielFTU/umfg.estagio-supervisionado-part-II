import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

type FaseItem = {
  id: string;
  nome: string;
  ordem: number;
  tempoPadraoDias: number;
  descricao: string;
  ativo: boolean;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function RowMenu({ ativo, onEdit, onView, onToggleAtivo }: {
  ativo: boolean;
  onEdit: () => void;
  onView: () => void;
  onToggleAtivo: () => void;
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
          className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Visualizar</button>
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Editar</button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onToggleAtivo(); }}
            className={cn('w-full text-left px-3 py-1.5 hover:bg-gray-50', ativo ? 'text-red-500' : 'text-emerald-600')}>
            {ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

export function FasesPage() {
  const navigate = useNavigate();
  const [items, setItems]       = useState<FaseItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativo' | 'inativo'>('ativo');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmTarget, setConfirmTarget] = useState<FaseItem | null>(null);

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
      const res = await fetch('/api/fases-producao', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) { setItems([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      setItems(data.map(f => ({
        id: f.id,
        nome: f.nome,
        ordem: f.ordem,
        tempoPadraoDias: f.tempoPadraoDias ?? 0,
        descricao: f.descricao,
        ativo: f.ativo,
      })));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleAtivo = (f: FaseItem) => {
    setConfirmTarget(f);
  };

  const execToggleAtivo = async () => {
    if (!confirmTarget) return;
    const f = confirmTarget;
    setConfirmTarget(null);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/fases-producao/${f.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 409) {
      const body = await res.json().catch(() => ({}));
      alert(body.detail ?? body.message ?? 'Esta fase está em uso e não pode ser desativada.');
      return;
    }
    load();
  };

  const filtered = items.filter(f => {
    if (search && !f.nome.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFiltro === 'ativo'   && !f.ativo) return false;
    if (statusFiltro === 'inativo' &&  f.ativo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const statusLabel = statusFiltro === 'ativo' ? 'ATIVO' : statusFiltro === 'inativo' ? 'INATIVO' : null;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#3B82F6] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Informe o nome"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button onClick={() => navigate('/cadastros/fases/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors shrink-0">
          <Plus size={14} /> Novo
        </button>

        <div ref={filterRef} className="relative shrink-0">
          <button onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
              statusFiltro !== 'todos'
                ? 'border-[#3B82F6] bg-blue-50 text-[#3B82F6]'
                : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
            )}>
            <SlidersHorizontal size={15} />
          </button>

          {filterOpen && (
            <div onMouseDown={e => e.stopPropagation()}
              className="absolute z-30 right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
              {(['todos', 'ativo', 'inativo'] as const).map(v => (
                <button key={v} onClick={() => { setStatusFiltro(v); setPage(1); setFilterOpen(false); }}
                  className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                    statusFiltro === v ? 'bg-[#3B82F6] text-white' : 'text-gray-600 hover:bg-gray-50')}>
                  {v === 'todos' ? 'Todos' : v === 'ativo' ? 'Ativo' : 'Inativo'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chip filtro ativo */}
      {statusLabel && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#3B82F6] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            Status : {statusLabel}
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
                  <th className="text-left font-semibold text-gray-700 px-6 py-3 w-20">Ordem</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Nome</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Tempo Padrão</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Descricao</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Status</th>
                  <th className="w-10 pr-4" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : paginated.map(f => (
                  <tr key={f.id}
                    onClick={() => navigate(`/cadastros/fases/${f.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {f.ordem}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm', f.ativo ? 'text-gray-700' : 'text-gray-400 line-through max-w-xs truncate  ')}>
                        {f.nome.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {f.tempoPadraoDias > 0 ? `${f.tempoPadraoDias} dia${f.tempoPadraoDias !== 1 ? 's' : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {f.descricao}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                        f.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                        {f.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="pr-4 text-right" onClick={e => e.stopPropagation()}>
                      <RowMenu
                        ativo={f.ativo}
                        onView={() => navigate(`/cadastros/fases/${f.id}`)}
                        onEdit={() => navigate(`/cadastros/fases/${f.id}/editar`)}
                        onToggleAtivo={() => handleToggleAtivo(f)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginação */}
            {filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3 text-sm text-gray-500">
                <span className="mr-4">Exibindo {filtered.length} registro{filtered.length !== 1 ? 's' : ''}.</span>
                <button onClick={() => goPage(1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
                <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => goPage(p)}
                    className={cn('w-7 h-7 rounded-full text-sm transition-colors', p === page ? 'bg-blue-100 text-[#3B82F6] font-semibold' : 'hover:bg-gray-100')}>
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
        aberto={confirmTarget !== null}
        titulo={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} fase` : ''}
        descricao={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} a fase "${confirmTarget.nome}"?` : ''}
        variante={confirmTarget?.ativo ? 'perigo' : 'aviso'}
        onConfirmar={execToggleAtivo}
        onCancelar={() => setConfirmTarget(null)}
      />
    </div>
  );
}
