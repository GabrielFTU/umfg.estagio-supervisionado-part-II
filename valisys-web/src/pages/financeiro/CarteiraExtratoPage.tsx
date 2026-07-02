import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, ChevronRight, Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/services/api';

interface CarteiraItem {
  id: string;
  codigoBanco: string;
  nomeBanco: string;
  titular: string;
  saldoInicial: number;
  saldoAtual: number;
}

interface MovimentacaoItem {
  id: string;
  tipo: string;
  origem: string;
  valor: number;
  dataMovimentacao: string;
  descricao: string;
  contaPagarId: string | null;
  contaReceberId: string | null;
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDateTime(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

export function CarteiraExtratoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [carteira, setCarteira] = useState<CarteiraItem | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetchWithAuth(`/api/carteiras/${id}`),
      fetchWithAuth(`/api/carteiras/${id}/movimentacoes`),
    ]).then(async ([resCart, resMov]) => {
      if (!resCart.ok) { navigate('/financeiro/carteira'); return; }
      setCarteira(await resCart.json());
      setMovimentacoes(resMov.ok ? await resMov.json() : []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto px-10 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-8 text-gray-400">
          <Home size={14} className="shrink-0" />
          <ChevronRight size={12} className="shrink-0" />
          <button onClick={() => navigate('/financeiro/carteira')} className="hover:text-gray-600 transition-colors">
            Carteiras
          </button>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-gray-600 font-medium">Extrato</span>
        </nav>

        {/* Cabeçalho da carteira */}
        {carteira && (
          <div className="flex items-center gap-10 mb-8 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Carteira</p>
              <p className="text-sm font-semibold text-gray-800">{carteira.codigoBanco} — {carteira.nomeBanco}</p>
              <p className="text-xs text-gray-400">{carteira.titular}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Saldo inicial</p>
              <p className="text-sm text-gray-600">{fmtBRL(carteira.saldoInicial)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Saldo atual</p>
              <p className={cn('text-base font-bold', carteira.saldoAtual >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {fmtBRL(carteira.saldoAtual)}
              </p>
            </div>
          </div>
        )}

        {/* Tabela de movimentações */}
        {movimentacoes.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma movimentação registrada nesta carteira.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-6 py-3" />
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Data</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Descrição</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Origem</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map(m => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-3 px-1">
                    {m.tipo === 'Credito'
                      ? <ArrowUpCircle size={15} className="text-emerald-500" />
                      : <ArrowDownCircle size={15} className="text-red-500" />}
                  </td>
                  <td className="py-3 px-3 text-gray-500">{fmtDateTime(m.dataMovimentacao)}</td>
                  <td className="py-3 px-3 text-gray-700">{m.descricao}</td>
                  <td className="py-3 px-3 text-gray-500">{m.origem === 'ContaPagar' ? 'Conta a pagar' : 'Conta a receber'}</td>
                  <td className={cn('py-3 px-3 text-right font-medium', m.tipo === 'Credito' ? 'text-emerald-600' : 'text-red-500')}>
                    {m.tipo === 'Credito' ? '+' : '-'} {fmtBRL(m.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
