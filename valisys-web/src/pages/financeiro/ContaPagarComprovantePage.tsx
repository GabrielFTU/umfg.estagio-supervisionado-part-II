import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, ChevronRight, Loader2, Printer } from 'lucide-react';

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildHtml(parcela: ParcelaDetail, conta: ContaDetail): string {
  return `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8">
<title>Comprovante de Pagamento</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 32px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .sub { color: #666; font-size: 12px; margin-bottom: 24px; }
  .meta { margin-bottom: 24px; line-height: 2; }
  .meta span { color: #666; }
  .row { display: flex; justify-content: space-between; padding: 8px 0;
         border-bottom: 1px solid #f0f0f0; }
  .row:last-child { border-bottom: none; }
  .total-row { display: flex; justify-content: space-between; padding: 12px 0;
               border-top: 2px solid #e5e5e5; font-weight: 700; margin-top: 4px; }
  @media print { @page { margin: 20mm; } }
</style>
</head><body>
<h1>Comprovante de Pagamento</h1>
<p class="sub">Valisys ERP</p>
<div class="meta">
  <div><span>Data de pagamento:&nbsp;</span>${fmtDate(parcela.dataPagamento ?? '')}</div>
  <div><span>Conta:&nbsp;</span>${conta.descricao}</div>
  <div><span>Parcela:&nbsp;</span>${parcela.numeroParcela} / ${conta.totalParcelas}</div>
  ${conta.fornecedorNome ? `<div><span>Fornecedor:&nbsp;</span>${conta.fornecedorNome}</div>` : ''}
</div>
<div>
  <div class="row"><span>Valor pago</span><strong>${fmtBRL(parcela.valorPago ?? 0)}</strong></div>
  ${(parcela.multa ?? 0) > 0 ? `<div class="row"><span>Multa</span><span>${fmtBRL(parcela.multa ?? 0)}</span></div>` : ''}
  ${(parcela.juros ?? 0) > 0 ? `<div class="row"><span>Juros</span><span>${fmtBRL(parcela.juros ?? 0)}</span></div>` : ''}
  <div class="total-row"><span>Total pago</span><span>${fmtBRL(parcela.valorPago ?? 0)}</span></div>
</div>
</body></html>`;
}

interface ParcelaDetail {
  id: string;
  numeroParcela: number;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  valorPago: number | null;
  juros: number | null;
  multa: number | null;
  status: string;
}

interface ContaDetail {
  id: string;
  descricao: string;
  fornecedorNome: string | null;
  totalParcelas: number;
  parcelas: ParcelaDetail[];
}

export function ContaPagarComprovantePage() {
  const { contaId, parcelaId } = useParams<{ contaId: string; parcelaId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [conta, setConta]     = useState<ContaDetail | null>(null);
  const [parcela, setParcela] = useState<ParcelaDetail | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/contas-pagar/${contaId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) { navigate('/financeiro/contas-pagar'); return; }
        const data: any = await res.json();
        const total = data.parcelas?.length ?? 1;
        const detail: ContaDetail = {
          id: data.id,
          descricao: data.descricao,
          fornecedorNome: data.fornecedorNome ?? null,
          totalParcelas: total,
          parcelas: data.parcelas ?? [],
        };
        setConta(detail);
        const found = detail.parcelas.find((p: ParcelaDetail) => p.id === parcelaId) ?? null;
        setParcela(found);
      })
      .finally(() => setLoading(false));
  }, [contaId, parcelaId]);

  const handlePrint = () => {
    if (!conta || !parcela) return;
    const blob = new Blob([buildHtml(parcela, conta)], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.src = url;
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
      <Loader2 size={16} className="animate-spin" /> Carregando…
    </div>
  );

  if (!conta || !parcela) return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400">
      Comprovante não encontrado.
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto px-10 py-8 max-w-2xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-10 text-gray-400">
          <Home size={14} className="shrink-0" />
          <ChevronRight size={12} className="shrink-0" />
          <button onClick={() => navigate('/financeiro/contas-pagar')}
            className="hover:text-gray-600 transition-colors">
            Contas a pagar
          </button>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-[#1D4E89] font-medium">Comprovante</span>
        </nav>

        {/* Card */}
        <div className="border border-gray-200 rounded-xl p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Comprovante de Pagamento</h2>
          <p className="text-xs text-gray-400 mb-8">Valisys ERP</p>

          <dl className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Data de pagamento</dt>
              <dd className="font-medium text-gray-800">{fmtDate(parcela.dataPagamento ?? '')}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Conta</dt>
              <dd className="font-medium text-gray-800">{conta.descricao}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Parcela</dt>
              <dd className="font-medium text-gray-800">{parcela.numeroParcela} / {conta.totalParcelas}</dd>
            </div>
            {conta.fornecedorNome && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Fornecedor</dt>
                <dd className="font-medium text-gray-800">{conta.fornecedorNome}</dd>
              </div>
            )}
          </dl>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Valor pago</span>
              <span className="text-gray-800">{fmtBRL(parcela.valorPago ?? 0)}</span>
            </div>
            {(parcela.multa ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Multa</span>
                <span className="text-gray-800">{fmtBRL(parcela.multa ?? 0)}</span>
              </div>
            )}
            {(parcela.juros ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Juros</span>
                <span className="text-gray-800">{fmtBRL(parcela.juros ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-3 border-t border-gray-200">
              <span className="text-gray-700">Total pago</span>
              <span className="text-gray-900">{fmtBRL(parcela.valorPago ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 px-10 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/financeiro/contas-pagar')}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Voltar
        </button>
        <button onClick={handlePrint}
          className="h-9 px-5 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Printer size={14} />
          Imprimir
        </button>
      </div>
    </div>
  );
}
