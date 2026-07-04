import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

type CategoriaItem = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
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

export function CategoriasPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativo' | 'inativo'>('ativo');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmTarget, setConfirmTarget] = useState<CategoriaItem | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/CategoriasProduto', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403) { setCategorias([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      const lista: CategoriaItem[] = data.map(c => ({
        id: c.id,
        codigo: c.codigo ?? '—',
        nome: c.nome,
        descricao: c.descricao ?? null,
        ativo: c.ativo,
      }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setCategorias(lista);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleAtivo = (c: CategoriaItem) => {
    setConfirmTarget(c);
  };

  const execToggleAtivo = async () => {
    if (!confirmTarget) return;
    const c = confirmTarget;
    setConfirmTarget(null);
    const token = localStorage.getItem('token');
    if (c.ativo) {
      const res = await fetch(`/api/CategoriasProduto/${c.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        alert(body.message ?? 'Esta categoria possui produtos ativos e não pode ser desativada.');
        return;
      }
    } else {
      const res = await fetch(`/api/CategoriasProduto/${c.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        await fetch(`/api/CategoriasProduto/${c.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...data, ativo: true }),
        });
      }
    }
    load();
  };

  const filtered = categorias.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.nome.toLowerCase().includes(q) && !c.codigo.includes(q)) return false;
    }
    if (statusFiltro === 'ativo'   && !c.ativo) return false;
    if (statusFiltro === 'inativo' &&  c.ativo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const statusLabel = statusFiltro === 'ativo' ? 'ATIVO' : statusFiltro === 'inativo' ? 'INATIVO' : null;

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

        <button onClick={() => navigate('/cadastros/categorias/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors shrink-0">
          <Plus size={14} /> Nova Categoria
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
              {(['todos', 'ativo', 'inativo'] as const).map(v => (
                <button key={v} onClick={() => { setStatusFiltro(v); setPage(1); setFilterOpen(false); }}
                  className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                    statusFiltro === v ? 'bg-[#1D4E89] text-white' : 'text-gray-600 hover:bg-gray-50')}>
                  {v === 'todos' ? 'Todos' : v === 'ativo' ? 'Ativo' : 'Inativo'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Chip filtro ativo ── */}
      {statusLabel && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            Status : {statusLabel}
            <button onClick={() => setStatusFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
          </span>
        </div>
      )}

      {/* ── Tabela ── */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-semibold text-gray-700 px-6 py-3 w-24">Código</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Nome</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Descrição</th>
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
              ) : paginated.map(c => (
                <tr key={c.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {c.codigo !== '—' ? String(c.codigo).padStart(3, '0') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm', c.ativo ? 'text-gray-700' : 'text-gray-400 line-through')}>
                      {c.nome.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{c.descricao ?? '—'}</td>
                  <td className="pr-4 text-right">
                    <RowMenu ativo={c.ativo}
                      onView={() => navigate(`/cadastros/categorias/${c.id}`)}
                      onEdit={() => navigate(`/cadastros/categorias/${c.id}/editar`)}
                      onToggleAtivo={() => handleToggleAtivo(c)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Paginação ── */}
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
        aberto={confirmTarget !== null}
        titulo={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} categoria` : ''}
        descricao={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} a categoria "${confirmTarget.nome}"?` : ''}
        variante={confirmTarget?.ativo ? 'perigo' : 'aviso'}
        onConfirmar={execToggleAtivo}
        onCancelar={() => setConfirmTarget(null)}
      />
    </div>
  );
}
