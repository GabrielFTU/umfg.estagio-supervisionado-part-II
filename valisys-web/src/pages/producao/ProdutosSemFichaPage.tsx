import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader2, ArrowRight, Package,
  Home, ChevronRight,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProdutoSemFicha {
  id: string;
  codigo: string;
  nome: string;
  classificacao: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProdutosSemFichaPage() {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [produtos, setProdutos]   = useState<ProdutoSemFicha[]>([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [creating, setCreating]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/fichas-tecnicas/produtos-sem-ficha', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setProdutos(await res.json());
    } catch { setError('Não foi possível carregar os produtos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return produtos;
    const q = search.toLowerCase();
    return produtos.filter(p => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q));
  }, [produtos, search]);

  const handleSelecionar = async (produto: ProdutoSemFicha) => {
    setCreating(produto.id);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/fichas-tecnicas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ produtoId: produto.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? 'Erro ao criar ficha técnica.');
      }
      const ficha = await res.json();
      showToast('Ficha técnica criada');
      navigate(`/producao/fichas-tecnicas/${ficha.id}`);
    } catch (e: any) {
      alert(e.message ?? 'Erro inesperado.');
      setCreating(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <button onClick={() => navigate('/producao/fichas-tecnicas')}
            className="hover:text-gray-700 transition-colors">Ficha Técnica</button>
          <ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Produtos sem ficha técnica</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-400 focus:border-blue-600 focus:outline-none transition-colors placeholder:text-gray-400 text-gray-800"
            placeholder="Buscar por código ou nome"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-600 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={load} className="text-xs text-blue-600 hover:underline font-medium">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16 text-center">
            <Package size={36} className="text-gray-300" />
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search ? 'Nenhum resultado encontrado' : 'Todos os produtos já possuem ficha técnica'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {search ? 'Ajuste a busca.' : 'Não há produtos elegíveis sem ficha cadastrada.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pl-6 pr-4 w-40">Código ↑↓</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4">Nome ↑↓</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4 w-36">Pendências</th>
                <th className="w-14 pr-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pl-6 pr-4 text-sm font-mono text-gray-700">{p.codigo}</td>
                  <td className="py-3 pr-4 text-sm text-gray-800">{p.nome}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium text-emerald-700">NÃO</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={() => handleSelecionar(p)}
                      disabled={creating === p.id}
                      className="flex items-center justify-center w-8 h-8 ml-auto rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40">
                      {creating === p.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <ArrowRight size={15} />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && (
        <div className="shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-xs font-semibold text-gray-700">
            {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
            {filtered.length !== produtos.length && <span className="font-normal text-gray-500"> de {produtos.length} total</span>}
          </span>
        </div>
      )}
    </div>
  );
}
