import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Package, ChevronRight, Home,
  Loader2, LayoutGrid, List, Eye, Tag, EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProdutoCatalogo = {
  id: string;
  codigo: string;
  nome: string;
  classificacao: string;
  categoriaNome: string;
  unidadeSigla: string;
  imagemUrl: string | null;
  ativo: boolean;
  disponivelParaVenda: boolean;
  custoPadrao: number;
  descricao: string | null;
};

const CLASSIF_COLORS: Record<string, string> = {
  MateriaPrima:    'bg-amber-50 text-amber-700 border-amber-200',
  Componente:      'bg-blue-50 text-blue-600 border-blue-200',
  SemiAcabado:     'bg-violet-50 text-violet-600 border-violet-200',
  ProdutoAcabado:  'bg-emerald-50 text-emerald-600 border-emerald-200',
  MaterialConsumo: 'bg-gray-100 text-gray-600 border-gray-200',
};

const CLASSIF_LABEL: Record<string, string> = {
  MateriaPrima:    'Matéria-prima',
  Componente:      'Componente',
  SemiAcabado:     'Semi-acabado',
  ProdutoAcabado:  'Produto Acabado',
  MaterialConsumo: 'Material de Consumo',
};

const CLASSIF_FILTER_TABS = [
  { key: '', label: 'Todos' },
  { key: 'ProdutoAcabado', label: 'Acabado' },
  { key: 'Componente', label: 'Componente' },
  { key: 'SemiAcabado', label: 'Semi-acabado' },
  { key: 'MateriaPrima', label: 'Matéria-prima' },
  { key: 'MaterialConsumo', label: 'Mat. Consumo' },
];

function fmt(value: number) {
  if (!value || value === 0) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ToggleSwitch({ value, onChange, loading }: {
  value: boolean; onChange: () => void; loading: boolean;
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(); }}
      disabled={loading}
      title={value ? 'Disponível para venda — clique para suspender' : 'Suspenso para venda — clique para reativar'}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        value ? 'bg-emerald-500' : 'bg-gray-200',
        loading && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
        value ? 'translate-x-4' : 'translate-x-0',
      )} />
    </button>
  );
}

const CLASSIF_ACCENT: Record<string, string> = {
  MateriaPrima:    'bg-amber-400',
  Componente:      'bg-blue-500',
  SemiAcabado:     'bg-violet-500',
  ProdutoAcabado:  'bg-emerald-500',
  MaterialConsumo: 'bg-gray-400',
};

function CardProduto({ p, onToggle, toggling, onClick }: {
  p: ProdutoCatalogo;
  onToggle: () => void;
  toggling: boolean;
  onClick: () => void;
}) {
  const accent = CLASSIF_ACCENT[p.classificacao] ?? 'bg-gray-300';
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-gray-200 hover:border-[#1D4E89]/40 hover:bg-blue-50/20 transition-colors cursor-pointer group flex flex-col',
        !p.disponivelParaVenda && 'opacity-60',
      )}
    >
      {/* Barra de classificação */}
      <div className={cn('h-1 w-full shrink-0', accent)} />

      <div className="relative w-full h-36 bg-gray-50 overflow-hidden shrink-0">
        {p.imagemUrl
          ? <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={32} className="text-gray-200" />
            </div>
          )
        }
        {!p.disponivelParaVenda && (
          <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center">
            <span className="bg-white/90 text-gray-500 text-xs font-medium px-2 py-1 flex items-center gap-1">
              <EyeOff size={11} /> Suspenso
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        <div>
          <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">#{p.codigo}</p>
          <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mt-0.5">{p.nome}</h3>
        </div>

        <span className={cn(
          'self-start text-[10px] font-semibold px-2 py-0.5 border',
          CLASSIF_COLORS[p.classificacao] ?? 'bg-gray-100 text-gray-500 border-gray-200',
        )}>
          {CLASSIF_LABEL[p.classificacao] ?? p.classificacao}
        </span>

        <div className="flex flex-wrap gap-1 mt-auto">
          <span className="text-[10px] text-gray-500 border border-gray-200 px-1.5 py-0.5">
            {p.categoriaNome}
          </span>
          <span className="text-[10px] text-gray-500 border border-gray-200 px-1.5 py-0.5">
            {p.unidadeSigla}
          </span>
        </div>

        {p.custoPadrao > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={11} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-700">{fmt(p.custoPadrao)}</span>
          </div>
        )}

        <div
          className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto"
          onClick={e => e.stopPropagation()}
        >
          <span className={cn(
            'text-[11px] font-medium',
            p.disponivelParaVenda ? 'text-emerald-600' : 'text-gray-400',
          )}>
            {p.disponivelParaVenda ? 'Disponível p/ venda' : 'Suspenso'}
          </span>
          <ToggleSwitch value={p.disponivelParaVenda} onChange={onToggle} loading={toggling} />
        </div>
      </div>
    </div>
  );
}

function RowProduto({ p, onToggle, toggling, onClick }: {
  p: ProdutoCatalogo;
  onToggle: () => void;
  toggling: boolean;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
        !p.disponivelParaVenda && 'opacity-55',
      )}
    >
      <td className="py-3 pl-6 pr-4 w-12">
        <div className="w-9 h-9 border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
          {p.imagemUrl
            ? <img src={p.imagemUrl} alt={p.nome} className="w-full h-full object-cover" />
            : <Package size={14} className="text-gray-300" />}
        </div>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500 font-mono">#{p.codigo}</td>
      <td className="py-3 pr-6 max-w-[220px]">
        <p className="text-sm text-gray-700">{p.nome}</p>
        {p.descricao && <p className="text-[11px] text-gray-400 truncate mt-0.5">{p.descricao}</p>}
      </td>
      <td className="py-3 pr-4">
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 border',
          CLASSIF_COLORS[p.classificacao] ?? 'bg-gray-100 text-gray-500 border-gray-200')}>
          {CLASSIF_LABEL[p.classificacao] ?? p.classificacao}
        </span>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-500">{p.categoriaNome}</td>
      <td className="py-3 pr-4 text-sm text-gray-500">{p.unidadeSigla}</td>
      <td className="py-3 pr-6 text-right text-sm font-semibold text-gray-700">
        {fmt(p.custoPadrao)}
      </td>
      <td className="py-3 pr-6 text-right" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
          <span className={cn('text-[11px] font-medium hidden xl:block',
            p.disponivelParaVenda ? 'text-emerald-600' : 'text-gray-400')}>
            {p.disponivelParaVenda ? 'Disponível' : 'Suspenso'}
          </span>
          <ToggleSwitch value={p.disponivelParaVenda} onChange={onToggle} loading={toggling} />
        </div>
      </td>
    </tr>
  );
}

export function CatalogoProdutosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtroClassif, setFiltroClassif] = useState('');
  const [apenasDisp, setApenasDisp] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/produtos?apenasAtivos=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      const lista: ProdutoCatalogo[] = data.map(p => ({
        id: p.id,
        codigo: p.codigo,
        nome: p.nome,
        classificacao: p.classificacao,
        categoriaNome: p.categoriaProdutoNome ?? '—',
        unidadeSigla: p.unidadeMedidaSigla ?? '—',
        imagemUrl: p.imagemUrl ?? null,
        ativo: p.ativo,
        disponivelParaVenda: p.disponivelParaVenda ?? true,
        custoPadrao: p.custoPadrao ?? 0,
        descricao: p.descricao ?? null,
      }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setProdutos(lista);
    } catch {
      setError('Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (p: ProdutoCatalogo) => {
    setToggling(prev => ({ ...prev, [p.id]: true }));
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/produtos/${p.id}/disponibilidade`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProdutos(prev => prev.map(x =>
          x.id === p.id ? { ...x, disponivelParaVenda: data.disponivelParaVenda } : x,
        ));
      }
    } finally {
      setToggling(prev => ({ ...prev, [p.id]: false }));
    }
  };

  const filtered = produtos.filter(p => {
    if (search) {
      const s = search.toLowerCase();
      if (!p.nome.toLowerCase().includes(s) && !(p.codigo ?? '').includes(s) && !p.categoriaNome.toLowerCase().includes(s))
        return false;
    }
    if (filtroClassif && p.classificacao !== filtroClassif) return false;
    if (apenasDisp && !p.disponivelParaVenda) return false;
    return true;
  });

  const totalDisp = produtos.filter(p => p.disponivelParaVenda).length;
  const filtrosAtivos = !!filtroClassif || apenasDisp;
  const filtrosCount = (filtroClassif ? 1 : 0) + (apenasDisp ? 1 : 0);

  return (
    <div className="flex flex-col h-full bg-gray-50/40">

      {/* Breadcrumb */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Comercial</span><ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Catálogo de Produtos</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Catálogo de Produtos</h1>
            {!loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {totalDisp} disponíveis para venda · {produtos.length} no total
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="shrink-0 bg-white border-b border-gray-200/50 px-4 sm:px-6 py-2.5 space-y-2.5">
        {/* Tabs de classificação */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {CLASSIF_FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFiltroClassif(tab.key === filtroClassif ? '' : tab.key)}
              className={cn(
                'whitespace-nowrap shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                filtroClassif === tab.key
                  ? 'bg-[#1D4E89] border-[#1D4E89] text-white shadow-sm shadow-blue-200'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + filtros extras + view toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/25 focus:border-[#1D4E89] transition-all placeholder:text-gray-400"
              placeholder="Buscar por nome, código ou categoria…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro extra: disponibilidade */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs font-medium transition-colors',
                filtrosAtivos
                  ? 'bg-blue-50 border-[#1D4E89] text-[#1D4E89]'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400',
              )}
            >
              <SlidersHorizontal size={13} /> Filtros
              {filtrosCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1D4E89] text-white text-[10px] font-bold flex items-center justify-center">
                  {filtrosCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div
                onMouseDown={e => e.stopPropagation()}
                className="absolute z-30 top-full right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-3"
              >
                <p className="text-xs font-semibold text-gray-600">Disponibilidade</p>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={apenasDisp}
                    onChange={() => setApenasDisp(v => !v)}
                    className="rounded border-gray-300 text-[#1D4E89] focus:ring-[#1D4E89]"
                  />
                  <span className="text-xs text-gray-600">Apenas disponíveis para venda</span>
                </label>
                {filtrosAtivos && (
                  <button
                    onClick={() => { setApenasDisp(false); setFiltroClassif(''); }}
                    className="text-[11px] text-red-400 hover:text-red-600 w-full text-right"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden shrink-0 ml-auto">
            <button
              onClick={() => setView('grid')}
              className={cn('p-2 transition-colors', view === 'grid' ? 'bg-[#1D4E89] text-white' : 'text-gray-400 hover:text-gray-600 bg-white')}
              title="Visualização em cards"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-2 transition-colors', view === 'list' ? 'bg-[#1D4E89] text-white' : 'text-gray-400 hover:text-gray-600 bg-white')}
              title="Visualização em lista"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto">

        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando catálogo…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#1D4E89] hover:underline">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
            <div className="w-16 h-16 bg-blue-50 flex items-center justify-center">
              <Package size={28} className="text-[#1D4E89]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || filtrosAtivos ? 'Nenhum produto encontrado' : 'Nenhum produto ativo'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || filtrosAtivos ? 'Ajuste os filtros ou a busca.' : 'Cadastre produtos para exibi-los aqui.'}
              </p>
            </div>
          </div>
        )}

        {/* Grid view */}
        {!loading && !error && filtered.length > 0 && view === 'grid' && (
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3 mb-3 text-[11px] text-gray-400">
              <span>{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-emerald-400" /> disponível para venda
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> clique para ver detalhes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(p => (
                <CardProduto
                  key={p.id}
                  p={p}
                  onToggle={() => handleToggle(p)}
                  toggling={!!toggling[p.id]}
                  onClick={() => navigate(`/cadastros/produtos/${p.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* List view — edge-to-edge como almoxarifado */}
        {!loading && !error && filtered.length > 0 && view === 'list' && (
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-12 py-3 pl-6" />
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Código</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Nome / Descrição</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Classificação</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">Categoria</th>
                  <th className="text-left font-semibold text-gray-700 px-4 py-3">UM</th>
                  <th className="text-right font-semibold text-gray-700 px-4 py-3">Preço ref.</th>
                  <th className="text-right font-semibold text-gray-700 px-4 py-3 w-32">Venda</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <RowProduto
                    key={p.id}
                    p={p}
                    onToggle={() => handleToggle(p)}
                    toggling={!!toggling[p.id]}
                    onClick={() => navigate(`/cadastros/produtos/${p.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
