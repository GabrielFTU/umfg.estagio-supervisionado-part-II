import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal, MoreHorizontal, Loader2, X, Users, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type FormaItem = {
  id: string;
  codigo: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  restritaAVendedores: boolean;
  totalVendedores: number;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ─── Menu de ações ────────────────────────────────────────────────────────────

function RowMenu({ item, onView, onEdit, onToggle }: {
  item: FormaItem;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
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
          <button onClick={() => { setOpen(false); onToggle(); }}
            className={cn('w-full text-left px-3 py-1.5 hover:bg-gray-50', item.ativo ? 'text-red-500' : 'text-emerald-600')}>
            {item.ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function FormasPagamentoPage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [formas, setFormas]     = useState<FormaItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [statusFiltro, setStatusFiltro]   = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [acessoFiltro, setAcessoFiltro]   = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'edit' | 'toggle'; item: FormaItem } | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/formas-pagamento', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      setFormas(data.map(f => ({
        id:                  f.id,
        codigo:              f.codigo,
        nome:                f.nome,
        descricao:           f.descricao ?? null,
        ativo:               f.ativo,
        restritaAVendedores: f.restritaAVendedores,
        totalVendedores:     (f.vendedores ?? []).length,
      })));
    } catch {
      setError('Não foi possível carregar as formas de pagamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (f: FormaItem) => {
    setConfirmAction({ type: 'edit', item: f });
  };

  const handleToggle = (f: FormaItem) => {
    setConfirmAction({ type: 'toggle', item: f });
  };

  const execConfirm = async () => {
    if (!confirmAction) return;
    const { type, item: f } = confirmAction;
    setConfirmAction(null);
    if (type === 'edit') {
      navigate(`/cadastros/formas-pagamento/${f.id}/editar`);
      return;
    }
    const token = localStorage.getItem('token');
    await fetch(`/api/formas-pagamento/${f.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const filtrosAtivos = statusFiltro !== 'todos' || acessoFiltro !== '';

  const filtered = formas.filter(f => {
    if (search) {
      const q = search.toLowerCase();
      const codeMatch = String(f.codigo).padStart(3, '0').includes(search);
      if (!f.nome.toLowerCase().includes(q) && !codeMatch) return false;
    }
    if (statusFiltro === 'ativo'   && !f.ativo) return false;
    if (statusFiltro === 'inativo' &&  f.ativo) return false;
    if (acessoFiltro === 'restrita' && !f.restritaAVendedores) return false;
    if (acessoFiltro === 'livre'    &&  f.restritaAVendedores) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const statusLabel = statusFiltro === 'ativo' ? 'ATIVO' : statusFiltro === 'inativo' ? 'INATIVO' : null;
  const acessoLabel = acessoFiltro === 'restrita' ? 'RESTRITA' : acessoFiltro === 'livre' ? 'LIVRE' : null;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Toolbar ── */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Informe o código ou nome"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button onClick={() => navigate('/cadastros/formas-pagamento/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors shrink-0">
          <Plus size={14} /> Nova Forma
        </button>

        <div ref={filterRef} className="relative shrink-0">
          <button onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
              filtrosAtivos
                ? 'border-[#1D4E89] bg-blue-50 text-[#1D4E89]'
                : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
            )}>
            <SlidersHorizontal size={15} />
          </button>

          {filterOpen && (
            <div onMouseDown={e => e.stopPropagation()}
              className="absolute z-30 right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-3 space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
                {(['todos', 'ativo', 'inativo'] as const).map(v => (
                  <button key={v} onClick={() => { setStatusFiltro(v); setPage(1); setFilterOpen(false); }}
                    className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                      statusFiltro === v ? 'bg-[#1D4E89] text-white' : 'text-gray-600 hover:bg-gray-50')}>
                    {v === 'todos' ? 'Todos' : v === 'ativo' ? 'Ativo' : 'Inativo'}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Acesso de vendedor</p>
                {(['', 'livre', 'restrita'] as const).map(v => (
                  <button key={v} onClick={() => { setAcessoFiltro(v); setPage(1); setFilterOpen(false); }}
                    className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                      acessoFiltro === v ? 'bg-[#1D4E89] text-white' : 'text-gray-600 hover:bg-gray-50')}>
                    {v === '' ? 'Todos' : v === 'livre' ? 'Livre' : 'Restrita'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Chip filtro ativo ── */}
      {filtrosAtivos && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          {statusLabel && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Status : {statusLabel}
              <button onClick={() => setStatusFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {acessoLabel && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Acesso : {acessoLabel}
              <button onClick={() => setAcessoFiltro('')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* ── Tabela ── */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#1D4E89] hover:underline">Tentar novamente</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-700 px-6 py-3 w-20">Código</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Nome</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Acesso</th>
                  <th className="w-10 pr-4" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : paginated.map(f => (
                  <tr key={f.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500">{String(f.codigo).padStart(3, '0')}</td>
                    <td className={cn('px-4 py-3', !f.ativo && 'opacity-50')}>
                      <span className={cn('text-sm', f.ativo ? 'text-gray-700' : 'text-gray-400')}>
                        {f.nome}
                      </span>
                      {f.descricao && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">{f.descricao}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {f.restritaAVendedores ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                          <Lock size={10} />
                          Restrita · {f.totalVendedores} {f.totalVendedores === 1 ? 'vendedor' : 'vendedores'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                          <Users size={10} />
                          Todos os vendedores
                        </span>
                      )}
                    </td>
                    <td className="pr-4 text-right">
                      <RowMenu
                        item={f}
                        onView={() => navigate(`/cadastros/formas-pagamento/${f.id}`)}
                        onEdit={() => handleEdit(f)}
                        onToggle={() => handleToggle(f)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Paginação ── */}
      {!loading && !error && filtered.length > 0 && (
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
        titulo={confirmAction?.type === 'edit'
          ? 'Editar forma de pagamento'
          : confirmAction ? `${confirmAction.item.ativo ? 'Desativar' : 'Reativar'} forma de pagamento` : ''}
        descricao={confirmAction ? (confirmAction.type === 'edit'
          ? `Editar a forma de pagamento "${confirmAction.item.nome}"?`
          : `${confirmAction.item.ativo ? 'Desativar' : 'Reativar'} a forma de pagamento "${confirmAction.item.nome}"?`
        ) : ''}
        variante={confirmAction?.type === 'edit' ? 'info' : confirmAction?.item.ativo ? 'perigo' : 'aviso'}
        onConfirmar={execConfirm}
        onCancelar={() => setConfirmAction(null)}
      />
    </div>
  );
}
