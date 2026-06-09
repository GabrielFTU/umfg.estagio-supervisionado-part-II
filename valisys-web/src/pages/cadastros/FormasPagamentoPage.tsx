import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, CreditCard,
  ChevronRight, Home, Loader2, MoreHorizontal, Users, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type FormaItem = {
  id: string;
  codigo: number;
  nome: string;
  descricao: string | null;
  prazoDias: number | null;
  ativo: boolean;
  restritaAVendedores: boolean;
  totalVendedores: number;
};

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
          className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/[0.07] py-0.5 text-[13px]"
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
          <button onClick={() => { setOpen(false); onToggle(); }}
            className={cn(
              'w-full text-left px-3 py-1.5 transition-colors',
              item.ativo
                ? 'text-red-500 hover:bg-red-50'
                : 'text-emerald-600 hover:bg-emerald-50',
            )}>
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
  const [search, setSearch]         = useState('');
  const [formas, setFormas]         = useState<FormaItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroRestrita, setFiltroRestrita] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch('/api/formas-pagamento', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      setFormas(data.map(f => ({
        id:                  f.id,
        codigo:              f.codigo,
        nome:                f.nome,
        descricao:           f.descricao ?? null,
        prazoDias:           f.prazoDias ?? null,
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

  const handleToggle = async (f: FormaItem) => {
    const acao = f.ativo ? 'Desativar' : 'Reativar';
    if (!confirm(`${acao} a forma de pagamento "${f.nome}"?`)) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/formas-pagamento/${f.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const filtrosAtivos = !!(filtroStatus || filtroRestrita);
  const filtrosCount  = [filtroStatus, filtroRestrita].filter(Boolean).length;

  const filtered = formas.filter(f => {
    if (search) {
      const q = search.toLowerCase();
      const codeMatch = String(f.codigo).padStart(3, '0').includes(search);
      if (!f.nome.toLowerCase().includes(q) && !codeMatch) return false;
    }
    if (filtroStatus === 'ativo'   && !f.ativo) return false;
    if (filtroStatus === 'inativo' &&  f.ativo) return false;
    if (filtroRestrita === 'restrita'     && !f.restritaAVendedores) return false;
    if (filtroRestrita === 'livre'        &&  f.restritaAVendedores) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">

      {/* ── Breadcrumb ── */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Formas de Pagamento</span>
        </div>
      </div>

      {/* ── Subheader ── */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200/50 bg-white">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6] transition-all placeholder:text-gray-400"
              placeholder="Buscar por código ou nome…"
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
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
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
                className="absolute z-30 top-full right-0 mt-1.5 w-60 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Filtros</span>
                  {filtrosAtivos && (
                    <button
                      onClick={() => { setFiltroStatus(''); setFiltroRestrita(''); }}
                      className="text-[11px] text-red-400 hover:text-red-600 transition-colors"
                    >
                      Limpar tudo
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-1.5">Status</p>
                  <div className="flex gap-1.5">
                    {(['', 'ativo', 'inativo'] as const).map(v => (
                      <button key={v}
                        onClick={() => setFiltroStatus(v === filtroStatus ? '' : v)}
                        className={cn('flex-1 text-xs py-1.5 rounded-md border transition-colors',
                          filtroStatus === v
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                        {v === '' ? 'Todos' : v === 'ativo' ? 'Ativo' : 'Inativo'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-gray-400 mb-1.5">Acesso de vendedor</p>
                  <div className="flex gap-1.5">
                    {(['', 'livre', 'restrita'] as const).map(v => (
                      <button key={v}
                        onClick={() => setFiltroRestrita(v === filtroRestrita ? '' : v)}
                        className={cn('flex-1 text-xs py-1.5 rounded-md border transition-colors',
                          filtroRestrita === v
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                        {v === '' ? 'Todos' : v === 'livre' ? 'Livre' : 'Restrita'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/cadastros/formas-pagamento/novo')}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] shadow-sm shadow-blue-200 transition-colors sm:ml-auto shrink-0"
          >
            <Plus size={15} /> Nova Forma
          </button>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando formas de pagamento…
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
              <CreditCard size={28} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || filtrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhuma forma de pagamento cadastrada'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || filtrosAtivos
                  ? 'Ajuste os filtros ou a busca.'
                  : 'Clique em "Nova Forma" para começar.'}
              </p>
            </div>
            {!search && !filtrosAtivos && (
              <button
                onClick={() => navigate('/cadastros/formas-pagamento/novo')}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#3B82F6] text-white text-sm hover:bg-[#2563eb] transition-colors"
              >
                <Plus size={14} /> Nova forma de pagamento
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pl-4 pr-3 w-20">Código</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-4">Nome</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-4">Prazo</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-4">Acesso</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-4">Status</th>
                    <th className="w-10 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr
                      key={f.id}
                      onClick={() => navigate(`/cadastros/formas-pagamento/${f.id}`)}
                      className={cn(
                        'border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer',
                        !f.ativo && 'opacity-50',
                      )}
                    >
                      <td className="py-3 pl-4 pr-3">
                        <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {String(f.codigo).padStart(3, '0')}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-700">{f.nome}</p>
                        {f.descricao && (
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">{f.descricao}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {f.prazoDias != null ? (
                          <span className="text-xs text-gray-600">
                            {f.prazoDias === 0 ? 'À vista' : `${f.prazoDias} dias`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
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
                      <td className="py-3 pr-4">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          f.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500',
                        )}>
                          {f.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right" onClick={e => e.stopPropagation()}>
                        <RowMenu
                          item={f}
                          onView={() => navigate(`/cadastros/formas-pagamento/${f.id}`)}
                          onEdit={() => navigate(`/cadastros/formas-pagamento/${f.id}/editar`)}
                          onToggle={() => handleToggle(f)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/40">
              <span className="text-xs text-gray-400">
                {filtered.length} {filtered.length === 1 ? 'forma' : 'formas'}
                {filtered.length !== formas.length && ` de ${formas.length}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
