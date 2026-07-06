import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreHorizontal, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

type UsuarioItem = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfilId: string;
  perfilNome: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function getCurrentUserId(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return user.id ?? null;
  } catch {
    return null;
  }
}

function iniciais(nome: string): string {
  return nome.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function RowMenu({ souEu, ativo, onEdit, onView, onToggleAtivo }: {
  souEu: boolean;
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
          className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Visualizar</button>
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Editar</button>
          {!souEu && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onToggleAtivo(); }}
                className={cn('w-full text-left px-3 py-1.5 hover:bg-gray-50', ativo ? 'text-red-500' : 'text-emerald-600')}>
                {ativo ? 'Desativar' : 'Reativar'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-4 sm:px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse shrink-0" />
              <div className="h-3.5 w-28 rounded bg-gray-100 animate-pulse" />
            </div>
          </td>
          <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3 w-32 rounded bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5 hidden sm:table-cell"><div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" /></td>
          <td className="px-4 py-3.5"><div className="h-5 w-14 rounded-full bg-gray-100 animate-pulse" /></td>
          <td className="pr-4" />
        </tr>
      ))}
    </>
  );
}

export function UsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativo' | 'inativo'>('ativo');
  const [perfilFiltro, setPerfilFiltro] = useState<string>('todos');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'edit' | 'toggle'; item: UsuarioItem } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const currentUserId = getCurrentUserId();

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
      const res = await fetch('/api/Usuarios', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403) { setUsuarios([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      const lista: UsuarioItem[] = data.map(u => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        ativo: u.ativo,
        perfilId: u.perfilId,
        perfilNome: u.perfilNome ?? 'Sem Perfil',
      }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setUsuarios(lista);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const perfisDisponiveis = useMemo(
    () => Array.from(new Set(usuarios.map(u => u.perfilNome))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [usuarios],
  );

  const handleEdit = (u: UsuarioItem) => setConfirmAction({ type: 'edit', item: u });

  const handleToggleAtivo = (u: UsuarioItem) => setConfirmAction({ type: 'toggle', item: u });

  const execConfirm = async () => {
    if (!confirmAction) return;
    const { type, item: u } = confirmAction;
    setConfirmAction(null);
    if (type === 'edit') {
      navigate(`/configuracoes/usuarios/${u.id}/editar`);
      return;
    }
    setErrorMsg('');
    const token = localStorage.getItem('token');
    if (u.ativo) {
      const res = await fetch(`/api/Usuarios/${u.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.message ?? 'Este usuário não pode ser desativado.');
        return;
      }
    } else {
      const res = await fetch(`/api/Usuarios/${u.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        await fetch(`/api/Usuarios/${u.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: u.id, nome: data.nome, email: data.email, perfilId: data.perfilId, ativo: true }),
        });
      }
    }
    load();
  };

  const filtered = usuarios.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      if (!u.nome.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    if (statusFiltro === 'ativo'   && !u.ativo) return false;
    if (statusFiltro === 'inativo' &&  u.ativo) return false;
    if (perfilFiltro !== 'todos' && u.perfilNome !== perfilFiltro) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  const statusLabel = statusFiltro === 'ativo' ? 'ATIVO' : statusFiltro === 'inativo' ? 'INATIVO' : null;
  const filtrosAtivos = statusFiltro !== 'todos' || perfilFiltro !== 'todos';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col h-full bg-white"
    >

      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Informe o nome ou e-mail"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => navigate('/configuracoes/usuarios/novo')}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] active:scale-95 transition-all">
            <Plus size={14} /> Novo Usuário
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

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  onMouseDown={e => e.stopPropagation()}
                  className="absolute z-30 right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-3 space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
                    <div className="flex flex-col gap-0.5">
                      {(['todos', 'ativo', 'inativo'] as const).map(v => (
                        <button key={v} onClick={() => { setStatusFiltro(v); setPage(1); }}
                          className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                            statusFiltro === v ? 'bg-[#1D4E89] text-white' : 'text-gray-600 hover:bg-gray-50')}>
                          {v === 'todos' ? 'Todos' : v === 'ativo' ? 'Ativo' : 'Inativo'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Perfil</p>
                    <select
                      value={perfilFiltro}
                      onChange={e => { setPerfilFiltro(e.target.value); setPage(1); }}
                      className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#1D4E89]"
                    >
                      <option value="todos">Todos</option>
                      {perfisDisponiveis.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {(statusLabel || perfilFiltro !== 'todos') && (
        <div className="px-4 sm:px-6 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {statusLabel && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Status : {statusLabel}
              <button onClick={() => setStatusFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {perfilFiltro !== 'todos' && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Perfil : {perfilFiltro}
              <button onClick={() => setPerfilFiltro('todos')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mx-4 sm:mx-6 mt-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left font-semibold text-gray-700 px-4 sm:px-6 py-3">Usuário</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden md:table-cell">E-mail</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden sm:table-cell">Perfil</th>
              <th className="text-left font-semibold text-gray-700 px-4 py-3 w-28">Status</th>
              <th className="w-10 pr-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {paginated.map((u, i) => (
                  <motion.tr key={u.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.3) }}
                    onClick={() => navigate(`/configuracoes/usuarios/${u.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className={cn('px-4 sm:px-6 py-3', !u.ativo && 'opacity-50')}>
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white',
                          u.ativo ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gray-300',
                        )}>
                          {iniciais(u.nome)}
                        </div>
                        <div className="min-w-0">
                          <span className={cn('text-sm block truncate', u.ativo ? 'text-gray-700' : 'text-gray-400')}>
                            {u.nome}
                          </span>
                          <span className="text-xs text-gray-400 md:hidden truncate block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {u.perfilNome}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                        u.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="pr-4 text-right" onClick={e => e.stopPropagation()}>
                      <RowMenu
                        souEu={u.id === currentUserId}
                        ativo={u.ativo}
                        onView={() => navigate(`/configuracoes/usuarios/${u.id}`)}
                        onEdit={() => handleEdit(u)}
                        onToggleAtivo={() => handleToggleAtivo(u)} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
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
          ? 'Editar usuário'
          : confirmAction ? `${confirmAction.item.ativo ? 'Desativar' : 'Reativar'} usuário` : ''}
        descricao={confirmAction ? (confirmAction.type === 'edit'
          ? `Editar o usuário "${confirmAction.item.nome}"?`
          : `${confirmAction.item.ativo ? 'Desativar' : 'Reativar'} o usuário "${confirmAction.item.nome}"? ${confirmAction.item.ativo ? 'Ele perderá acesso ao sistema imediatamente.' : ''}`
        ) : ''}
        variante={confirmAction?.type === 'edit' ? 'info' : confirmAction?.item.ativo ? 'perigo' : 'aviso'}
        onConfirmar={execConfirm}
        onCancelar={() => setConfirmAction(null)}
      />
    </motion.div>
  );
}
