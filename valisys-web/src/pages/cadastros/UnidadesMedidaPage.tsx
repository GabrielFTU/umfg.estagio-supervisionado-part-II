import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, Ruler,
  ChevronRight, Home, Loader2, MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

const GRANDEZA_LABEL: Record<number, string> = {
  0: 'Unidade',
  1: 'Massa',
  2: 'Comprimento',
  3: 'Volume',
  4: 'Tempo',
  5: 'Área',
};

type UnidadeItem = {
  id: string;
  nome: string;
  sigla: string;
  grandeza: number;
  fatorConversao: number;
  ehUnidadeBase: boolean;
  ativo: boolean;
};

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
          open ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
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
          <button
            onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Visualizar
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Editar
          </button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button
            onClick={() => { setOpen(false); onToggleAtivo(); }}
            className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors"
          >
            {ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

export function UnidadesMedidaPage() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState('');
  const [unidades, setUnidades]     = useState<UnidadeItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtroStatus, setFiltroStatus]   = useState('');
  const [filtroGrandeza, setFiltroGrandeza] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmTarget, setConfirmTarget] = useState<UnidadeItem | null>(null);

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
    try {
      const res = await fetch('/api/UnidadesMedida', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) { setUnidades([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      const lista: UnidadeItem[] = data.map(u => ({
        id:              u.id,
        nome:            u.nome,
        sigla:           u.sigla,
        grandeza:        u.grandeza,
        fatorConversao:  u.fatorConversao,
        ehUnidadeBase:   u.ehUnidadeBase,
        ativo:           u.ativo,
      }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setUnidades(lista);
    } catch {
      setError('Não foi possível carregar as unidades de medida.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleAtivo = (u: UnidadeItem) => {
    setConfirmTarget(u);
  };

  const execToggleAtivo = async () => {
    if (!confirmTarget) return;
    const u = confirmTarget;
    setConfirmTarget(null);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/UnidadesMedida/${u.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 409) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? 'Esta unidade de medida possui produtos ativos e não pode ser desativada.');
      return;
    }

    load();
  };

  const filtrosAtivos = !!(filtroStatus || filtroGrandeza);
  const filtrosCount  = [filtroStatus, filtroGrandeza].filter(Boolean).length;

  const filtered = unidades.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      if (!u.nome.toLowerCase().includes(q) && !u.sigla.toLowerCase().includes(q)) return false;
    }
    if (filtroStatus === 'ativo'   && !u.ativo) return false;
    if (filtroStatus === 'inativo' &&  u.ativo) return false;
    if (filtroGrandeza !== '' && u.grandeza !== Number(filtroGrandeza)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">

      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Unidades de Medida</span>
        </div>
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200/50">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6] transition-all placeholder:text-gray-400"
              placeholder="Buscar por nome ou sigla…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

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
              <SlidersHorizontal size={13} /> Filtros
              {filtrosAtivos && (
                <span className="w-4 h-4 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center">
                  {filtrosCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div
                onMouseDown={e => e.stopPropagation()}
                className="absolute z-30 top-full right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4"
              >
                {/* Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Status</span>
                    {filtroStatus && (
                      <button onClick={() => setFiltroStatus('')} className="text-[11px] text-red-400 hover:text-red-600">Limpar</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(['ativo', 'inativo'] as const).map(k => (
                      <button
                        key={k}
                        onClick={() => setFiltroStatus(k === filtroStatus ? '' : k)}
                        className={cn('text-xs py-1.5 px-3 rounded-md border text-left transition-colors',
                          filtroStatus === k
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300')}
                      >
                        {k.charAt(0).toUpperCase() + k.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Grandeza */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Grandeza</span>
                    {filtroGrandeza !== '' && (
                      <button onClick={() => setFiltroGrandeza('')} className="text-[11px] text-red-400 hover:text-red-600">Limpar</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(GRANDEZA_LABEL).map(([k, label]) => (
                      <button
                        key={k}
                        onClick={() => setFiltroGrandeza(filtroGrandeza === k ? '' : k)}
                        className={cn('text-xs py-1.5 px-3 rounded-md border text-left transition-colors',
                          filtroGrandeza === k
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/cadastros/unidades/novo')}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] shadow-sm shadow-blue-200 transition-colors sm:ml-auto shrink-0"
          >
            <Plus size={15} /> Nova Unidade
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando unidades de medida…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#3B82F6] hover:underline">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Ruler size={28} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || filtrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhuma unidade de medida cadastrada'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || filtrosAtivos ? 'Ajuste os filtros ou a busca.' : 'Clique em "Nova Unidade" para começar.'}
              </p>
            </div>
            {!search && !filtrosAtivos && (
              <button
                onClick={() => navigate('/cadastros/unidades/novo')}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#3B82F6] text-white text-sm hover:bg-[#2563eb] transition-colors"
              >
                <Plus size={14} /> Cadastrar unidade
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pl-4 w-20">Sigla</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Nome</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Grandeza</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Fator Conv.</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Base</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Status</th>
                    <th className="w-10 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr
                      key={u.id}
                      className={cn(
                        'border-b border-gray-50 hover:bg-blue-50/40 transition-colors',
                        !u.ativo && 'opacity-50',
                      )}
                    >
                      <td className="py-3 pl-4 pr-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-[#3B82F6] text-xs font-mono font-semibold">
                          {u.sigla}
                        </span>
                      </td>
                      <td className="py-3 pr-6">
                        <p className="text-gray-700 font-medium">{u.nome}</p>
                      </td>
                      <td className="py-3 pr-6">
                        <span className="text-xs text-gray-500">{GRANDEZA_LABEL[u.grandeza] ?? u.grandeza}</span>
                      </td>
                      <td className="py-3 pr-6 text-right">
                        <span className="text-xs font-mono text-gray-500">{u.fatorConversao}</span>
                      </td>
                      <td className="py-3 pr-6">
                        {u.ehUnidadeBase ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">Sim</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-6">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                          u.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <RowMenu
                          ativo={u.ativo}
                          onView={() => navigate(`/cadastros/unidades/${u.id}`)}
                          onEdit={() => navigate(`/cadastros/unidades/${u.id}/editar`)}
                          onToggleAtivo={() => handleToggleAtivo(u)}
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
        aberto={confirmTarget !== null}
        titulo={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} unidade de medida` : ''}
        descricao={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} a unidade de medida "${confirmTarget.nome} (${confirmTarget.sigla})"?` : ''}
        variante={confirmTarget?.ativo ? 'perigo' : 'aviso'}
        onConfirmar={execToggleAtivo}
        onCancelar={() => setConfirmTarget(null)}
      />
    </div>
  );
}
