import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, ChevronRight, ChevronDown, Loader2, Printer, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { fetchWithAuth } from '@/services/api';

interface CarteiraItem {
  id: string;
  codigoBanco: string;
  nomeBanco: string;
  titular: string;
  ativo: boolean;
}

interface ParcelaEdit {
  parcelaId: string;
  descricao: string;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: string;
  valorAberto: number;
  valorAPagar: string;
  multa: string;
  juros: string;
  desconto: string;
}

interface ReciboItem {
  descricao: string;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: string;
  valorAPagar: number;
  multa: number;
  juros: number;
  desconto: number;
  totalPago: number;
}

interface ReciboData {
  contaNome: string;
  dataLancamento: string;
  itens: ReciboItem[];
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '0,00';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(masked: string): number {
  return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0;
}

function numToBRL(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcTotal(p: ParcelaEdit): number {
  return parseBRL(p.valorAPagar) + parseBRL(p.multa) + parseBRL(p.juros) - parseBRL(p.desconto);
}

function buildReceiptHtml(recibo: ReciboData): string {
  const rows = recibo.itens.map(it => `
    <tr>
      <td>${it.descricao}</td>
      <td style="text-align:center">${it.numeroParcela}/${it.totalParcelas}</td>
      <td style="text-align:center">${fmtDate(it.dataVencimento)}</td>
      <td style="text-align:right">${fmtBRL(it.valorAPagar)}</td>
      <td style="text-align:right">${fmtBRL(it.multa)}</td>
      <td style="text-align:right">${fmtBRL(it.juros)}</td>
      <td style="text-align:right">${fmtBRL(it.desconto)}</td>
      <td style="text-align:right;font-weight:600">${fmtBRL(it.totalPago)}</td>
    </tr>`).join('');

  const totais = recibo.itens.reduce(
    (acc, it) => ({
      vp: acc.vp + it.valorAPagar,
      m: acc.m + it.multa,
      j: acc.j + it.juros,
      d: acc.d + it.desconto,
      t: acc.t + it.totalPago,
    }),
    { vp: 0, m: 0, j: 0, d: 0, t: 0 },
  );

  return `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8">
<title>Comprovante de Pagamento</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 32px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .sub { color: #666; font-size: 12px; margin-bottom: 24px; }
  .meta { margin-bottom: 20px; line-height: 1.8; }
  .meta span { color: #666; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase;
       padding: 8px 10px; border-bottom: 2px solid #e5e5e5; text-align: left; }
  td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; }
  .total-row td { border-top: 2px solid #e5e5e5; border-bottom: none; font-weight: 700; padding-top: 12px; }
  @media print { @page { margin: 20mm; } }
</style>
</head><body>
<h1>Comprovante de Pagamento</h1>
<p class="sub">Valisys ERP</p>
<div class="meta">
  <div><span>Data de pagamento:&nbsp;</span>${fmtDate(recibo.dataLancamento)}</div>
  ${recibo.contaNome ? `<div><span>Conta financeira:&nbsp;</span>${recibo.contaNome}</div>` : ''}
</div>
<table>
  <thead>
    <tr>
      <th>Descrição</th>
      <th style="text-align:center">Parcela</th>
      <th style="text-align:center">Vencimento</th>
      <th style="text-align:right">Valor pago</th>
      <th style="text-align:right">Multa</th>
      <th style="text-align:right">Juros</th>
      <th style="text-align:right">Desconto</th>
      <th style="text-align:right">Total</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr class="total-row">
      <td colspan="3"></td>
      <td style="text-align:right">${fmtBRL(totais.vp)}</td>
      <td style="text-align:right">${fmtBRL(totais.m)}</td>
      <td style="text-align:right">${fmtBRL(totais.j)}</td>
      <td style="text-align:right">${fmtBRL(totais.d)}</td>
      <td style="text-align:right">${fmtBRL(totais.t)}</td>
    </tr>
  </tbody>
</table>
</body></html>`;
}

function ReciboModal({ recibo, onClose }: { recibo: ReciboData; onClose: () => void }) {
  const totais = recibo.itens.reduce(
    (acc, it) => ({
      vp: acc.vp + it.valorAPagar,
      m: acc.m + it.multa,
      j: acc.j + it.juros,
      d: acc.d + it.desconto,
      t: acc.t + it.totalPago,
    }),
    { vp: 0, m: 0, j: 0, d: 0, t: 0 },
  );

  const handlePrint = () => {
    const blob = new Blob([buildReceiptHtml(recibo)], { type: 'text/html' });
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Comprovante de Pagamento</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Data: {fmtDate(recibo.dataLancamento)}
              {recibo.contaNome && <> &middot; Conta: {recibo.contaNome}</>}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left pb-3 text-xs font-semibold text-gray-500">Descrição</th>
                <th className="text-center pb-3 px-3 text-xs font-semibold text-gray-500">Parcela</th>
                <th className="text-center pb-3 px-3 text-xs font-semibold text-gray-500">Vencimento</th>
                <th className="text-right pb-3 px-3 text-xs font-semibold text-gray-500">Valor pago</th>
                <th className="text-right pb-3 px-3 text-xs font-semibold text-gray-500">Multa</th>
                <th className="text-right pb-3 px-3 text-xs font-semibold text-gray-500">Juros</th>
                <th className="text-right pb-3 px-3 text-xs font-semibold text-gray-500">Desconto</th>
                <th className="text-right pb-3 text-xs font-semibold text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {recibo.itens.map((it, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 text-gray-700">{it.descricao}</td>
                  <td className="py-3 px-3 text-gray-500 text-center">{it.numeroParcela}/{it.totalParcelas}</td>
                  <td className="py-3 px-3 text-gray-500 text-center">{fmtDate(it.dataVencimento)}</td>
                  <td className="py-3 px-3 text-gray-700 text-right">{fmtBRL(it.valorAPagar)}</td>
                  <td className="py-3 px-3 text-gray-700 text-right">{fmtBRL(it.multa)}</td>
                  <td className="py-3 px-3 text-gray-700 text-right">{fmtBRL(it.juros)}</td>
                  <td className="py-3 px-3 text-gray-700 text-right">{fmtBRL(it.desconto)}</td>
                  <td className="py-3 text-gray-800 font-semibold text-right">{fmtBRL(it.totalPago)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} />
                <td className="pt-4 pb-2 px-3 text-right font-bold text-gray-700">{fmtBRL(totais.vp)}</td>
                <td className="pt-4 pb-2 px-3 text-right font-bold text-gray-700">{fmtBRL(totais.m)}</td>
                <td className="pt-4 pb-2 px-3 text-right font-bold text-gray-700">{fmtBRL(totais.j)}</td>
                <td className="pt-4 pb-2 px-3 text-right font-bold text-gray-700">{fmtBRL(totais.d)}</td>
                <td className="pt-4 pb-2 text-right font-bold text-gray-800">{fmtBRL(totais.t)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-4 flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Fechar
          </button>
          <button onClick={handlePrint}
            className="h-9 px-5 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Printer size={14} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

export function BaixaContaPagarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [carteiras, setCarteiras]       = useState<CarteiraItem[]>([]);
  const [carteiraId, setCarteiraId]     = useState('');
  const [carteiraOpen, setCarteiraOpen] = useState(false);
  const [dataLancamento, setDataLancamento] = useState(todayISO());
  const [emitirRecibo, setEmitirRecibo] = useState(false);
  const [parcelas, setParcelas]         = useState<ParcelaEdit[]>([]);
  const [erros, setErros]               = useState<Record<string, string>>({});
  const [recibo, setRecibo]             = useState<ReciboData | null>(null);

  const carteiraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetchWithAuth(`/api/contas-pagar/${id}`),
      fetchWithAuth('/api/carteiras'),
    ]).then(async ([resConta, resCart]) => {
      if (!resConta.ok) { navigate('/financeiro/contas-pagar'); return; }
      const conta: any     = await resConta.json();
      const cartList: any[] = resCart.ok ? await resCart.json() : [];

      setCarteiras(cartList.filter((c: any) => c.ativo !== false));

      const total = conta.parcelas?.length ?? 1;
      const editable: ParcelaEdit[] = (conta.parcelas ?? [])
        .filter((p: any) => p.status !== 'Pago')
        .map((p: any) => {
          const aberto = p.valor - (p.valorPago ?? 0);
          return {
            parcelaId: p.id,
            descricao: conta.descricao,
            numeroParcela: p.numeroParcela,
            totalParcelas: total,
            dataVencimento: p.dataVencimento,
            valorAberto: aberto,
            valorAPagar: numToBRL(aberto),
            multa: '0,00',
            juros: '0,00',
            desconto: '0,00',
          };
        });
      setParcelas(editable);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!carteiraOpen) return;
    const h = (e: MouseEvent) => {
      if (carteiraRef.current && !carteiraRef.current.contains(e.target as Node))
        setCarteiraOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [carteiraOpen]);

  const updateParcela = (
    pid: string,
    field: 'valorAPagar' | 'multa' | 'juros' | 'desconto',
    raw: string,
  ) => {
    setParcelas(prev =>
      prev.map(p => p.parcelaId === pid ? { ...p, [field]: maskBRL(raw) } : p)
    );
    setErros(prev => ({ ...prev, [`valor-${pid}`]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!carteiraId)     errs.carteira = 'Selecione uma conta financeira';
    if (!dataLancamento) errs.data     = 'Informe a data de lançamento';
    for (const p of parcelas) {
      const principal = parseBRL(p.valorAPagar) - parseBRL(p.juros) - parseBRL(p.multa);
      if (principal > p.valorAberto) {
        errs[`valor-${p.parcelaId}`] = 'Valor pago maior que o valor em aberto da parcela.';
      } else if (p.totalParcelas === 1 && Math.abs(principal - p.valorAberto) > 0.001) {
        errs[`valor-${p.parcelaId}`] = 'Pagamento à vista deve quitar o valor integral da parcela.';
      }
    }
    setErros(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvar = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      for (const p of parcelas) {
        const vPago = calcTotal(p);
        if (vPago <= 0) continue;
        const res = await fetchWithAuth('/api/contas-pagar/baixar-parcela', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contaId: id,
            parcelaId: p.parcelaId,
            valorPago: vPago,
            dataPagamento: dataLancamento,
            formaPagamento: 0,
            carteiraId,
            juros:  parseBRL(p.juros)  || null,
            multa:  parseBRL(p.multa)  || null,
            observacoes: null,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as any).message ?? 'Erro ao baixar parcela');
        }
      }

      showToast('Baixa realizada com sucesso!');

      if (emitirRecibo) {
        const selectedCart = carteiras.find(c => c.id === carteiraId);
        setRecibo({
          contaNome: selectedCart
            ? `${selectedCart.codigoBanco} ${selectedCart.nomeBanco}`
            : '',
          dataLancamento,
          itens: parcelas.map(p => ({
            descricao: p.descricao,
            numeroParcela: p.numeroParcela,
            totalParcelas: p.totalParcelas,
            dataVencimento: p.dataVencimento,
            valorAPagar: parseBRL(p.valorAPagar),
            multa: parseBRL(p.multa),
            juros: parseBRL(p.juros),
            desconto: parseBRL(p.desconto),
            totalPago: calcTotal(p),
          })),
        });
      } else {
        navigate('/financeiro/contas-pagar');
      }
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao realizar baixa');
    } finally {
      setSaving(false);
    }
  };

  const selectedCart = carteiras.find(c => c.id === carteiraId);

  const totais = parcelas.reduce(
    (acc, p) => ({
      valorAPagar: acc.valorAPagar + parseBRL(p.valorAPagar),
      multa:       acc.multa       + parseBRL(p.multa),
      juros:       acc.juros       + parseBRL(p.juros),
      desconto:    acc.desconto    + parseBRL(p.desconto),
      totalPago:   acc.totalPago   + calcTotal(p),
    }),
    { valorAPagar: 0, multa: 0, juros: 0, desconto: 0, totalPago: 0 },
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
      <Loader2 size={16} className="animate-spin" /> Carregando…
    </div>
  );

  return (
    <>
      {recibo && (
        <ReciboModal
          recibo={recibo}
          onClose={() => { setRecibo(null); navigate('/financeiro/contas-pagar'); }}
        />
      )}

      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 overflow-auto px-10 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-10 text-gray-400">
            <Home size={14} className="shrink-0" />
            <ChevronRight size={12} className="shrink-0" />
            <button
              onClick={() => navigate('/financeiro/contas-pagar')}
              className="hover:text-gray-600 transition-colors"
            >
              Contas a pagar
            </button>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-emerald-600 font-medium">Baixa</span>
          </nav>

          {/* Header fields */}
          <div className="flex items-start gap-10 mb-10">

            {/* Conta financeira */}
            <div className="relative w-80" ref={carteiraRef}>
              <div
                onClick={() => setCarteiraOpen(v => !v)}
                className={cn(
                  'flex items-center justify-between pb-2 border-b cursor-pointer transition-colors',
                  erros.carteira ? 'border-red-400' : 'border-gray-300 hover:border-gray-500',
                )}
              >
                <span className={cn('text-sm', selectedCart ? 'text-gray-700' : 'text-gray-400')}>
                  {selectedCart
                    ? `${selectedCart.codigoBanco} ${selectedCart.nomeBanco}`
                    : 'Conta financeira *'}
                </span>
                <ChevronDown size={14} className="text-gray-400 shrink-0 ml-2" />
              </div>
              {erros.carteira && (
                <p className="text-[11px] text-red-500 mt-0.5">{erros.carteira}</p>
              )}
              {carteiraOpen && (
                <div className="absolute z-30 mt-1 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm max-h-56 overflow-y-auto">
                  {carteiras.length === 0 ? (
                    <p className="px-3 py-2 text-gray-400 text-xs">Nenhuma carteira cadastrada</p>
                  ) : (
                    carteiras.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCarteiraId(c.id);
                          setCarteiraOpen(false);
                          setErros(e => ({ ...e, carteira: '' }));
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-700">{c.codigoBanco} — {c.nomeBanco}</div>
                        <div className="text-xs text-gray-400">{c.titular}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Data do lançamento */}
            <div>
              <label className={cn('block text-xs mb-1', erros.data ? 'text-red-500' : 'text-gray-500')}>
                Data do lançamento *
              </label>
              <input
                type="date"
                value={dataLancamento}
                onChange={e => { setDataLancamento(e.target.value); setErros(v => ({ ...v, data: '' })); }}
                className={cn(
                  'h-9 text-sm bg-transparent border-b transition-colors focus:outline-none',
                  erros.data
                    ? 'border-red-400 text-red-500'
                    : 'border-gray-300 focus:border-[#1D4E89] text-gray-700',
                )}
              />
              {erros.data && <p className="text-[11px] text-red-500 mt-0.5">{erros.data}</p>}
            </div>
          </div>

          {/* Table */}
          {parcelas.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma parcela pendente nesta conta.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Descrição</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-gray-600">Parcela</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-gray-600">Vencimento</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Valor aberto</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Valor a pagar</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Multa</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Juros</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Desconto</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600">Total pago</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map(p => (
                  <tr key={p.parcelaId} className="border-b border-gray-100">
                    <td className="py-3 px-3 text-gray-700">{p.descricao}</td>
                    <td className="py-3 px-3 text-gray-500 text-center">{p.numeroParcela}</td>
                    <td className="py-3 px-3 text-gray-500 text-center">{fmtDate(p.dataVencimento)}</td>
                    <td className="py-3 px-3 text-gray-700 text-right">{fmtBRL(p.valorAberto)}</td>
                    <td className="py-3 px-3 text-right">
                      <input
                        className={cn(
                          'w-28 text-right text-sm border-b focus:outline-none bg-transparent',
                          erros[`valor-${p.parcelaId}`] ? 'border-red-400 text-red-500' : 'border-gray-300 focus:border-[#1D4E89]',
                        )}
                        value={`R$ ${p.valorAPagar}`}
                        onChange={e => updateParcela(p.parcelaId, 'valorAPagar', e.target.value)}
                        onFocus={e => e.target.select()}
                      />
                      {erros[`valor-${p.parcelaId}`] && (
                        <p className="text-[11px] text-red-500 mt-0.5">{erros[`valor-${p.parcelaId}`]}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        className="w-24 text-right text-sm border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none bg-transparent"
                        value={`R$ ${p.multa}`}
                        onChange={e => updateParcela(p.parcelaId, 'multa', e.target.value)}
                        onFocus={e => e.target.select()}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        className="w-24 text-right text-sm border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none bg-transparent"
                        value={`R$ ${p.juros}`}
                        onChange={e => updateParcela(p.parcelaId, 'juros', e.target.value)}
                        onFocus={e => e.target.select()}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        className="w-24 text-right text-sm border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none bg-transparent"
                        value={`R$ ${p.desconto}`}
                        onChange={e => updateParcela(p.parcelaId, 'desconto', e.target.value)}
                        onFocus={e => e.target.select()}
                      />
                    </td>
                    <td className="py-3 px-3 text-gray-700 font-medium text-right">
                      {fmtBRL(calcTotal(p))}
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr>
                  <td colSpan={4} />
                  <td className="py-3 px-3 text-right font-semibold text-gray-700">{fmtBRL(totais.valorAPagar)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-700">{fmtBRL(totais.multa)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-700">{fmtBRL(totais.juros)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-700">{fmtBRL(totais.desconto)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-700">{fmtBRL(totais.totalPago)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-10 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/financeiro/contas-pagar')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emitirRecibo}
                onChange={e => setEmitirRecibo(e.target.checked)}
                className="rounded border-gray-300"
              />
              Emitir recibo
            </label>
            <button
              onClick={handleSalvar}
              disabled={saving || parcelas.length === 0}
              className="h-9 px-6 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
