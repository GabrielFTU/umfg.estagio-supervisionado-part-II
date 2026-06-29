import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, Package,
  ChevronRight, Home, Loader2, MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';

type ProdutoItem = {
  id: string;
  codigo: string;
  nome: string;
  classificacao: string;
  categoriaNome: string;
  unidadeSigla: string;
  imagemUrl: string | null;
  ativo: boolean;
};

const CLASSIF_COLORS: Record<string, string> = {
  MateriaPrima:      'bg-amber-50   text-amber-700',
  Componente:        'bg-blue-50    text-blue-600',
  SemiAcabado:       'bg-violet-50  text-violet-600',
  ProdutoAcabado:    'bg-emerald-50 text-emerald-600',
  MaterialConsumo:   'bg-gray-100   text-gray-600',
};

const CLASSIF_LABEL: Record<string, string> = {
  MateriaPrima:    'Matéria-prima',
  Componente:      'Componente',
  SemiAcabado:     'Semi-acabado',
  ProdutoAcabado:  'Produto Acabado',
  MaterialConsumo: 'Material de Consumo',
};

function RowMenu({ id, ativo, onEdit, onView, onDesativar }: {
  id: string; ativo: boolean;
  onEdit: () => void; onView: () => void; onDesativar: () => void;
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
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Visualizar
          </button>
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Editar
          </button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onDesativar(); }}
            className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors">
            {ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

export function ProdutosPage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [produtos, setProdutos] = useState<ProdutoItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filtroClassif, setFiltroClassif] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmTarget, setConfirmTarget] = useState<ProdutoItem | null>(null);

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
      const res = await fetch('/api/produtos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) { setProdutos([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      const lista: ProdutoItem[] = data.map(p => ({
        id: p.id,
        codigo: p.codigo,
        nome: p.nome,
        classificacao: p.classificacao,
        categoriaNome: p.categoriaProdutoNome ?? '—',
        unidadeSigla: p.unidadeMedidaSigla ?? '—',
        imagemUrl: p.imagemUrl ?? null,
        ativo: p.ativo,
      }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setProdutos(lista);
    } catch {
      setError('Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDesativar = (p: ProdutoItem) => {
    setConfirmTarget(p);
  };

  const execDesativar = async () => {
    if (!confirmTarget) return;
    const p = confirmTarget;
    setConfirmTarget(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/produtos/${p.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const filtrosAtivos = !!filtroClassif;
  const filtered = produtos.filter(p => {
    if (search && !p.nome.toLowerCase().includes(search.toLowerCase()) && !(p.codigo ?? '').includes(search)) return false;
    if (filtroClassif && p.classificacao !== filtroClassif) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">

      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Produtos</span>
        </div>
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200/50">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6] transition-all placeholder:text-gray-400"
              placeholder="Buscar por nome ou código…"
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
                <span className="w-4 h-4 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center">1</span>
              )}
            </button>

            {filterOpen && (
              <div onMouseDown={e => e.stopPropagation()}
                className="absolute z-30 top-full right-0 mt-1.5 w-60 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Classificação</span>
                  {filtroClassif && (
                    <button onClick={() => setFiltroClassif('')}
                      className="text-[11px] text-red-400 hover:text-red-600">Limpar</button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {Object.entries(CLASSIF_LABEL).map(([k, v]) => (
                    <button key={k} onClick={() => setFiltroClassif(k === filtroClassif ? '' : k)}
                      className={cn('text-xs py-1.5 px-3 rounded-md border text-left transition-colors',
                        filtroClassif === k
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/cadastros/produtos/novo')}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] shadow-sm shadow-blue-200 transition-colors sm:ml-auto shrink-0"
          >
            <Plus size={15} /> Novo Produto
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando produtos…
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
              <Package size={28} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || filtrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhum produto cadastrado'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || filtrosAtivos ? 'Ajuste os filtros ou a busca.' : 'Clique em "Novo Produto" para começar.'}
              </p>
            </div>
            {!search && !filtrosAtivos && (
              <button onClick={() => navigate('/cadastros/produtos/novo')}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#3B82F6] text-white text-sm hover:bg-[#2563eb] transition-colors">
                <Plus size={14} /> Cadastrar produto
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="w-12 py-2.5 pl-4" />
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Código</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5">Nome</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Classificação</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Categoria</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">UM</th>
                    <th className="w-10 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className={cn(
                      'border-b border-gray-50 hover:bg-blue-50/40 transition-colors',
                      !p.ativo && 'opacity-50',
                    )}>
                      <td className="py-2 pl-4 pr-2">
                        <div className="w-9 h-9 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                          {p.imagemUrl
                            ? <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover" />
                            : <Package size={14} className="text-gray-300" />}
                        </div>
                      </td>
                      <td className="py-3 pr-6 text-xs text-gray-500 tabular-nums font-medium">#{p.codigo}</td>
                      <td className="py-3 pr-6 text-gray-700 font-medium">{p.nome}</td>
                      <td className="py-3 pr-6">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', CLASSIF_COLORS[p.classificacao] ?? 'bg-gray-100 text-gray-500')}>
                          {CLASSIF_LABEL[p.classificacao] ?? p.classificacao}
                        </span>
                      </td>
                      <td className="py-3 pr-6 text-xs text-gray-500">{p.categoriaNome}</td>
                      <td className="py-3 pr-6 text-xs text-gray-500">{p.unidadeSigla}</td>
                      <td className="py-3 pr-3 text-right">
                        <RowMenu
                          id={p.id}
                          ativo={p.ativo}
                          onView={() => navigate(`/cadastros/produtos/${p.id}`)}
                          onEdit={() => navigate(`/cadastros/produtos/${p.id}/editar`)}
                          onDesativar={() => handleDesativar(p)}
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
        titulo={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} produto` : ''}
        descricao={confirmTarget ? `${confirmTarget.ativo ? 'Desativar' : 'Reativar'} "${confirmTarget.nome}"?` : ''}
        variante={confirmTarget?.ativo ? 'perigo' : 'aviso'}
        onConfirmar={execDesativar}
        onCancelar={() => setConfirmTarget(null)}
      />
    </div>
  );
}
