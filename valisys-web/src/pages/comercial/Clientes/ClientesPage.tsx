import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, User,
  ChevronRight, Home, Loader2, MoreHorizontal,
} from 'lucide-react';
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
  inscricaoEstadual: string | null;
  cidade: string;
  uf: string;
  ativo: boolean;
  bloqueado: boolean;
};

type Filtros = {
  tipo: '' | 'fisica' | 'juridica';
  status: '' | 'ativo' | 'bloqueado' | 'inativo';
};

const FILTROS_VAZIOS: Filtros = { tipo: '', status: '' };

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ ativo, bloqueado }: { ativo: boolean; bloqueado: boolean }) {
  if (!ativo)    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-black">Inativo</span>;
  if (bloqueado) return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Bloqueado</span>;
  return              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">Ativo</span>;
}

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
        btnRef.current  && !btnRef.current.contains(e.target as Node)
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
          open
            ? 'bg-gray-100 text-gray-700'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
        )}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/[0.07] py-0.5 text-[13px]"
        >
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Visualizar
          </button>
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Editar
          </button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onBloquear(); }}
            className="w-full text-left px-3 py-1.5 text-amber-600 hover:bg-amber-50 transition-colors">
            {p.bloqueado ? 'Desbloquear' : 'Bloquear'}
          </button>
          <button onClick={() => { setOpen(false); onDesativar(); }}
            className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors">
            {p.ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ClientesPage() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [pessoas, setPessoas] = useState<PessoaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<{ p: PessoaItem; acao: 'desativar' | 'bloquear' } | null>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

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
          inscricaoEstadual: p.inscricaoEstadual ?? null,
          email: p.email ?? null,
          telefone: p.celular ?? p.telefone ?? null,
          cidade: p.endereco?.cidade ?? '—', uf: p.endereco?.uf ?? '',
          ativo: p.ativo, bloqueado: p.bloqueado ?? false,
        })),
        ...juridicas.map(p => ({
          id: p.id, tipo: 'juridica' as const,
          doc: p.cnpj, nome: p.razaoSocial,
          inscricaoEstadual: p.inscricaoEstadual ?? null,
          email: p.email ?? null,
          telefone: p.celular ?? p.telefone ?? null,
          cidade: p.endereco?.cidade ?? '—', uf: p.endereco?.uf ?? '',
          ativo: p.ativo, bloqueado: p.bloqueado ?? false,
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

  const handleDesativar = (p: PessoaItem) => setModal({ p, acao: 'desativar' });
  const handleBloquear  = (p: PessoaItem) => setModal({ p, acao: 'bloquear' });

  const execAcao = async () => {
    if (!modal) return;
    const { p, acao } = modal;
    setModal(null);
    const token = localStorage.getItem('token');
    const base = p.tipo === 'fisica' ? '/api/PessoasFisicas' : '/api/PessoasJuridicas';
    if (acao === 'desativar') {
      const method = p.ativo ? 'DELETE' : 'PATCH';
      const url = p.ativo ? `${base}/${p.id}` : `${base}/${p.id}/reativar`;
      await fetch(url, { method, headers: { Authorization: `Bearer ${token}` } });
    } else {
      const endpoint = p.bloqueado ? 'desbloquear' : 'bloquear';
      await fetch(`${base}/${p.id}/${endpoint}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    }
    load();
  };

  const filtrosAtivos = Object.values(filtros).some(v => v !== '');

  const filtered = pessoas.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.nome.toLowerCase().includes(q) && !p.doc.includes(search)) return false;
    if (filtros.tipo  && p.tipo !== filtros.tipo)                    return false;
    if (filtros.status === 'ativo'     && (!p.ativo || p.bloqueado))  return false;
    if (filtros.status === 'bloqueado' && !p.bloqueado)              return false;
    if (filtros.status === 'inativo'   &&  p.ativo)                  return false;
    return true;
  });

  const setF = <K extends keyof Filtros>(k: K, v: Filtros[K]) =>
    setFiltros(prev => ({ ...prev, [k]: v }));

  return (
    <div className="flex flex-col h-full">

      {/* ── Breadcrumb ── */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Clientes</span>
        </div>
      </div>

      {/* ── Subheader ── */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200/50">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* Busca */}
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6] transition-all placeholder:text-gray-400"
              placeholder="Buscar por nome, CPF ou CNPJ…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs font-medium transition-colors',
                filtrosAtivos
                  ? 'bg-blue-50 border-[#3B82F6] text-[#3B82F6]'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
              )}
            >
              <SlidersHorizontal size={13} /> Filtros
              {filtrosAtivos && (
                <span className="w-4 h-4 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center">
                  {Object.values(filtros).filter(v => v !== '').length}
                </span>
              )}
            </button>

            {filterOpen && (
              <div
                onMouseDown={e => e.stopPropagation()}
                className="absolute z-30 top-full right-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Filtros</span>
                  {filtrosAtivos && (
                    <button onClick={() => setFiltros(FILTROS_VAZIOS)}
                      className="text-[11px] text-red-400 hover:text-red-600 transition-colors">
                      Limpar tudo
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-1.5">Tipo</p>
                  <div className="flex gap-1.5">
                    {(['', 'fisica', 'juridica'] as const).map(v => (
                      <button key={v} onClick={() => setF('tipo', v)}
                        className={cn('flex-1 text-xs py-1.5 rounded-md border transition-colors',
                          filtros.tipo === v
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                        {v === '' ? 'Todos' : v === 'fisica' ? 'Física' : 'Jurídica'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-1.5">Status</p>
                  <div className="flex gap-1.5">
                    {(['', 'ativo', 'bloqueado', 'inativo'] as const).map(v => (
                      <button key={v} onClick={() => setF('status', v)}
                        className={cn('flex-1 text-xs py-1.5 rounded-md border transition-colors',
                          filtros.status === v
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                        {v === '' ? 'Todos' : v === 'ativo' ? 'Ativo' : v === 'bloqueado' ? 'Bloqueado' : 'Inativo'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/comercial/clientes/novo')}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] shadow-sm shadow-blue-200 transition-colors sm:ml-auto shrink-0"
          >
            <Plus size={15} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando cadastros…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#3B82F6] hover:underline">
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <User size={28} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || filtrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhum cliente cadastrado'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || filtrosAtivos
                  ? 'Tente ajustar os filtros ou a busca.'
                  : 'Clique em "Novo Cliente" para adicionar o primeiro cadastro.'}
              </p>
            </div>
            {!search && !filtrosAtivos && (
              <button onClick={() => navigate('/comercial/clientes/novo')}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#3B82F6] text-white text-sm hover:bg-[#2563eb] transition-colors">
                <Plus size={14} /> Cadastrar cliente
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pl-4 pr-6">Documento</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5">Nome / Razão Social</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Inscrição Estadual</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Contato</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Município</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Status</th>
                    <th className="w-10 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className={cn(
                      'border-b border-gray-50 hover:bg-blue-50/40 transition-colors',
                      !p.ativo && 'opacity-50',
                      p.ativo && p.bloqueado && 'bg-amber-50/30',
                    )}>
                      <td className="py-3 pl-4 pr-6 text-xs text-gray-500 tabular-nums">
                        {maskDoc(p.tipo, p.doc)}
                      </td>
                      <td className="py-3 pr-6 text-gray-700 font-medium">{p.nome}</td>
                      <td className="py-3 pr-6 text-xs text-gray-500">
                        {p.inscricaoEstadual ?? '—'}
                      </td>
                      <td className="py-3 pr-6 text-xs text-gray-500">
                        {p.email ?? maskPhone(p.telefone) ?? '—'}
                      </td>
                      <td className="py-3 pr-6 text-xs text-gray-500">
                        {p.cidade !== '—' ? `${p.cidade}${p.uf ? ` – ${p.uf}` : ''}` : '—'}
                      </td>
                      <td className="py-3 pr-6">
                        <StatusBadge ativo={p.ativo} bloqueado={p.bloqueado} />
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <RowMenu
                          p={p}
                          onView={() => navigate(`/comercial/clientes/${p.tipo}/${p.id}`)}
                          onEdit={() => navigate(`/comercial/clientes/${p.tipo}/${p.id}/editar`)}
                          onDesativar={() => handleDesativar(p)}
                          onBloquear={() => handleBloquear(p)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ModalMsg
        aberto={!!modal}
        variante={modal?.acao === 'desativar' ? 'perigo' : 'aviso'}
        titulo={
          modal?.acao === 'desativar'
            ? `${modal.p.ativo ? 'Desativar' : 'Reativar'} "${modal.p.nome}"?`
            : `${modal?.p.bloqueado ? 'Desbloquear' : 'Bloquear'} crédito de "${modal?.p.nome}"?`
        }
        descricao={
          modal?.acao === 'desativar'
            ? modal.p.ativo
              ? 'O cliente será inativado e não aparecerá em novas operações.'
              : 'O cliente será reativado e voltará a estar disponível.'
            : modal?.p.bloqueado
              ? 'O crédito do cliente será liberado.'
              : 'O cliente ficará impedido de realizar compras a crédito.'
        }
        labelConfirmar={
          modal?.acao === 'desativar'
            ? modal.p.ativo ? 'Desativar' : 'Reativar'
            : modal?.p.bloqueado ? 'Desbloquear' : 'Bloquear'
        }
        onConfirmar={execAcao}
        onCancelar={() => setModal(null)}
      />
    </div>
  );
}
