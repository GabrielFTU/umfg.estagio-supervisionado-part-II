import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PessoaItem = {
  id: string;
  tipo: 'fisica' | 'juridica';
  doc: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cidade: string;
  uf: string;
  papeis: string[];
  papelEnum: number;
  ativo: boolean;
  bloqueado: boolean;
};

type Filtros = {
  tipo: '' | 'fisica' | 'juridica';
  papel: '' | '1' | '2' | '4' | '8';
  status: '' | 'ativo' | 'bloqueado' | 'inativo';
};

const FILTROS_VAZIOS: Filtros = { tipo: '', papel: '', status: '' };
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const PAPEL_BITS: [number, string][] = [
  [1, 'Cliente'], [2, 'Colaborador'], [4, 'Fornecedor'], [8, 'Vendedor'],
];

function decodePapeis(flags: number): string[] {
  return PAPEL_BITS.filter(([bit]) => flags & bit).map(([, label]) => label);
}

const PAPEL_COLORS: Record<string, string> = {
  Cliente:     'bg-blue-50    text-blue-600',
  Colaborador: 'bg-violet-50  text-violet-600',
  Fornecedor:  'bg-emerald-50 text-emerald-600',
  Vendedor:    'bg-amber-50   text-amber-700',
};

// ─── Máscaras ─────────────────────────────────────────────────────────────────

function maskDoc(tipo: 'fisica' | 'juridica', raw: string) {
  const d = raw.replace(/\D/g, '');
  if (tipo === 'fisica')
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function maskPhone(raw: string | null) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return raw;
}

// ─── Menu de ações ────────────────────────────────────────────────────────────

function RowMenu({ p, onView, onEdit, onDesativar, onBloquear }: {
  p: PessoaItem;
  onView: () => void; onEdit: () => void;
  onDesativar: () => void; onBloquear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const MENU_H = 148;
      const top = window.innerHeight - r.bottom < MENU_H + 4
        ? r.top - MENU_H - 4
        : r.bottom + 4;
      setPos({ top, right: window.innerWidth - r.right });
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
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Visualizar</button>
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50">Editar</button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onBloquear(); }}
            className="w-full text-left px-3 py-1.5 text-amber-600 hover:bg-amber-50 transition-colors">
            {p.bloqueado ? 'Desbloquear' : 'Bloquear'}
          </button>
          <button onClick={() => { setOpen(false); onDesativar(); }}
            className={cn('w-full text-left px-3 py-1.5 hover:bg-gray-50', p.ativo ? 'text-red-500' : 'text-red-600')}>
            {p.ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function PessoasPage() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<PessoaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filterRef = useRef<HTMLDivElement>(null);
  const [desativarTarget, setDesativarTarget] = useState<PessoaItem | null>(null);
  const [bloquearTarget, setBloquearTarget] = useState<PessoaItem | null>(null);
  const [editarTarget, setEditarTarget] = useState<PessoaItem | null>(null);

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
    setError('');
    const token = localStorage.getItem('token');
    const headers: HeadersInit = { Authorization: `Bearer ${token}` };
    try {
      const [rF, rJ] = await Promise.all([
        fetch('/api/PessoasFisicas',   { headers }),
        fetch('/api/PessoasJuridicas', { headers }),
      ]);
      if (!rF.ok || !rJ.ok) throw new Error();
      const [fisicas, juridicas]: [any[], any[]] = await Promise.all([rF.json(), rJ.json()]);

      const lista: PessoaItem[] = [
        ...fisicas.map(p => ({
          id: p.id, tipo: 'fisica' as const,
          doc: p.cpf, nome: p.nome,
          email: p.email ?? null,
          telefone: p.celular ?? p.telefone ?? null,
          cidade: p.endereco?.cidade ?? '—', uf: p.endereco?.uf ?? '',
          papeis: decodePapeis(p.papelPessoa),
          papelEnum: p.papelPessoa, ativo: p.ativo, bloqueado: p.bloqueado ?? false,
        })),
        ...juridicas.map(p => ({
          id: p.id, tipo: 'juridica' as const,
          doc: p.cnpj, nome: p.razaoSocial,
          email: p.email ?? null,
          telefone: p.celular ?? p.telefone ?? null,
          cidade: p.endereco?.cidade ?? '—', uf: p.endereco?.uf ?? '',
          papeis: decodePapeis(p.papelPessoa),
          papelEnum: p.papelPessoa, ativo: p.ativo, bloqueado: p.bloqueado ?? false,
        })),
      ];
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setPessoas(lista);
    } catch {
      setError('Não foi possível carregar os cadastros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEditar = (p: PessoaItem) => setEditarTarget(p);

  const execEditar = () => {
    if (!editarTarget) return;
    const p = editarTarget;
    setEditarTarget(null);
    navigate(`/cadastros/pessoas/${p.tipo}/${p.id}/editar`);
  };

  const handleDesativar = (p: PessoaItem) => setDesativarTarget(p);

  const execDesativar = async () => {
    if (!desativarTarget) return;
    const p = desativarTarget;
    setDesativarTarget(null);
    const token = localStorage.getItem('token');
    const base = p.tipo === 'fisica' ? '/api/PessoasFisicas' : '/api/PessoasJuridicas';
    const method = p.ativo ? 'DELETE' : 'PATCH';
    const url    = p.ativo ? `${base}/${p.id}` : `${base}/${p.id}/reativar`;
    await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleBloquear = (p: PessoaItem) => setBloquearTarget(p);

  const execBloquear = async () => {
    if (!bloquearTarget) return;
    const p = bloquearTarget;
    setBloquearTarget(null);
    const token = localStorage.getItem('token');
    const acao = p.bloqueado ? 'desbloquear' : 'bloquear';
    const base = p.tipo === 'fisica' ? '/api/PessoasFisicas' : '/api/PessoasJuridicas';
    const res = await fetch(`${base}/${p.id}/${acao}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      setPessoas(prev => prev.map(item => item.id === p.id ? { ...item, bloqueado: !p.bloqueado } : item));
    }
  };

  const filtered = pessoas.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.nome.toLowerCase().includes(q) && !p.doc.includes(search)) return false;
    if (filtros.tipo  && p.tipo !== filtros.tipo)                        return false;
    if (filtros.papel && !(p.papelEnum & Number(filtros.papel)))         return false;
    if (filtros.status === 'ativo'     && (!p.ativo || p.bloqueado))     return false;
    if (filtros.status === 'bloqueado' && !p.bloqueado)                  return false;
    if (filtros.status === 'inativo'   &&  p.ativo)                      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const setF = <K extends keyof Filtros>(k: K, v: Filtros[K]) => {
    setFiltros(prev => ({ ...prev, [k]: v }));
    setPage(1);
  };

  const filtrosAtivos = filtros.tipo !== '' || filtros.papel !== '' || filtros.status !== '';
  const tipoLabel   = filtros.tipo === 'fisica' ? 'FÍSICA' : filtros.tipo === 'juridica' ? 'JURÍDICA' : null;
  const papelLabel  = filtros.papel ? decodePapeis(Number(filtros.papel))[0]?.toUpperCase() ?? null : null;
  const statusLabel = filtros.status === 'ativo' ? 'ATIVO' : filtros.status === 'inativo' ? 'INATIVO' : filtros.status === 'bloqueado' ? 'BLOQUEADO' : null;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Toolbar ── */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Informe o nome, CPF ou CNPJ"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button onClick={() => navigate('/cadastros/pessoas/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors shrink-0">
          <Plus size={14} /> Novo
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
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Tipo</p>
                {(['todos', 'fisica', 'juridica'] as const).map(v => (
                  <button key={v} onClick={() => { setF('tipo', v === 'todos' ? '' : v); setFilterOpen(false); }}
                    className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                      (v === 'todos' ? filtros.tipo === '' : filtros.tipo === v)
                        ? 'bg-[#1D4E89] text-white'
                        : 'text-gray-600 hover:bg-gray-50')}>
                    {v === 'todos' ? 'Todos' : v === 'fisica' ? 'Física' : 'Jurídica'}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Papel</p>
                {(['', '1', '4', '2', '8'] as const).map(v => (
                  <button key={v} onClick={() => { setF('papel', v); setFilterOpen(false); }}
                    className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                      filtros.papel === v
                        ? 'bg-[#1D4E89] text-white'
                        : 'text-gray-600 hover:bg-gray-50')}>
                    {v === '' ? 'Todos' : decodePapeis(Number(v))[0]}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
                {(['todos', 'ativo', 'bloqueado', 'inativo'] as const).map(v => (
                  <button key={v} onClick={() => { setF('status', v === 'todos' ? '' : v); setFilterOpen(false); }}
                    className={cn('w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors',
                      (v === 'todos' ? filtros.status === '' : filtros.status === v)
                        ? 'bg-[#1D4E89] text-white'
                        : 'text-gray-600 hover:bg-gray-50')}>
                    {v === 'todos' ? 'Todos' : v === 'ativo' ? 'Ativo' : v === 'bloqueado' ? 'Bloqueado' : 'Inativo'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Chips de filtro ativos ── */}
      {filtrosAtivos && (
        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
          {tipoLabel && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Tipo: {tipoLabel}
              <button onClick={() => setF('tipo', '')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {papelLabel && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Papel: {papelLabel}
              <button onClick={() => setF('papel', '')} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {statusLabel && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Status: {statusLabel}
              <button onClick={() => setF('status', '')} className="hover:text-blue-800"><X size={11} /></button>
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
          <table className="w-full table-fixed text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-semibold text-gray-700 px-6 py-3 w-44">Documento</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 w-64">Nome / Razão Social</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 w-40">Papel</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 w-44">Contato</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 w-36">Município</th>
                <th className="w-10 pr-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    {search || filtrosAtivos ? 'Nenhum resultado encontrado.' : 'Nenhuma pessoa cadastrada.'}
                  </td>
                </tr>
              ) : paginated.map(p => (
                <tr key={p.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className={cn('px-6 py-3 text-gray-500 tabular-nums truncate', !p.ativo && 'opacity-50')}>
                    {maskDoc(p.tipo, p.doc)}
                  </td>
                  <td className={cn('px-4 py-3 truncate', !p.ativo && 'opacity-50')}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium">{p.nome}</span>
                      {p.bloqueado && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-600 leading-none shrink-0">
                          Bloqueado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={cn('px-4 py-3', !p.ativo && 'opacity-50')}>
                    <div className="flex flex-wrap gap-1">
                      {p.papeis.length > 0
                        ? p.papeis.map(papel => (
                            <span key={papel}
                              className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', PAPEL_COLORS[papel] ?? 'bg-gray-100 text-gray-500')}>
                              {papel}
                            </span>
                          ))
                        : <span className="text-gray-300">—</span>
                      }
                    </div>
                  </td>
                  <td className={cn('px-4 py-3 text-gray-500 truncate', !p.ativo && 'opacity-50')}>
                    {p.email ?? maskPhone(p.telefone) ?? '—'}
                  </td>
                  <td className={cn('px-4 py-3 text-gray-500 truncate', !p.ativo && 'opacity-50')}>
                    {p.cidade !== '—' ? `${p.cidade}${p.uf ? ` – ${p.uf}` : ''}` : '—'}
                  </td>
                  <td className="pr-4 text-right">
                    <RowMenu
                      p={p}
                      onView={() => navigate(`/cadastros/pessoas/${p.tipo}/${p.id}`)}
                      onEdit={() => handleEditar(p)}
                      onDesativar={() => handleDesativar(p)}
                      onBloquear={() => handleBloquear(p)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        aberto={editarTarget !== null}
        titulo="Editar pessoa"
        descricao={editarTarget ? `Editar "${editarTarget.nome}"?` : ''}
        variante="info"
        labelConfirmar="Confirmar"
        onConfirmar={execEditar}
        onCancelar={() => setEditarTarget(null)}
      />

      <ModalMsg
        aberto={desativarTarget !== null}
        titulo={desativarTarget ? `${desativarTarget.ativo ? 'Desativar' : 'Reativar'} pessoa` : ''}
        descricao={desativarTarget ? `${desativarTarget.ativo ? 'Desativar' : 'Reativar'} "${desativarTarget.nome}"?` : ''}
        variante={desativarTarget?.ativo ? 'perigo' : 'aviso'}
        onConfirmar={execDesativar}
        onCancelar={() => setDesativarTarget(null)}
      />

      <ModalMsg
        aberto={bloquearTarget !== null}
        titulo={bloquearTarget?.bloqueado ? 'Desbloquear crédito' : 'Bloquear crédito'}
        descricao={bloquearTarget
          ? bloquearTarget.bloqueado
            ? `Realmente deseja desbloquear "${bloquearTarget.nome}"?`
            : `Realmente deseja bloquear "${bloquearTarget.nome}"?`
          : ''}
        variante={bloquearTarget?.bloqueado ? 'aviso' : 'perigo'}
        labelConfirmar={bloquearTarget?.bloqueado ? 'Sim' : 'Bloquear'}
        onConfirmar={execBloquear}
        onCancelar={() => setBloquearTarget(null)}
      />
    </div>
  );
}
