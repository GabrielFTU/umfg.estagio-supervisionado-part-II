import { useEffect, useRef } from 'react';
import { X, Printer, AlertTriangle } from 'lucide-react';
import { gerarBoleto, i25Bars, i25Width, BOLETO_CONFIG, type BoletoOptions } from '@/lib/boleto';

interface BoletoViewerProps extends Omit<BoletoOptions, 'beneficiario' | 'instrucoes'> {
  onClose: () => void;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('pt-BR');
}
function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function BarcodeI25({ code }: { code: string }) {
  const bars  = i25Bars(code);
  const total = i25Width(code);
  const H     = 56;
  return (
    <svg
      viewBox={`0 0 ${total} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: H }}
    >
      {bars.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={H} fill="#000" />
      ))}
    </svg>
  );
}

function Field({ label, value, className = '', style }: { label: string; value: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex flex-col border border-gray-400 px-2 py-0.5 ${className}`} style={style}>
      <span style={{ fontSize: 8 }} className="text-gray-500 font-semibold uppercase leading-none mb-0.5">{label}</span>
      <span style={{ fontSize: 11 }} className="text-gray-900 font-medium leading-snug">{value}</span>
    </div>
  );
}

export function BoletoViewer({ onClose, ...opts }: BoletoViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const printRef   = useRef<HTMLDivElement>(null);

  const boleto = gerarBoleto({
    ...opts,
    beneficiario: BOLETO_CONFIG.beneficiario,
    instrucoes: [
      'Não receber após o vencimento.',
      'Pagável em qualquer banco ou lotérica até o vencimento.',
      'Após vencimento cobrar multa de 2% + juros de 1% a.m.',
    ],
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML ?? '';
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head>
      <title>Boleto — ${boleto.descricao}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
        body { background: white; padding: 24px; }
        .boleto { max-width: 760px; margin: 0 auto; border: 1px solid #999; }
        .row { display: flex; }
        .field { border: 1px solid #aaa; padding: 2px 6px; display: flex; flex-direction: column; }
        .field-label { font-size: 8px; color: #555; font-weight: 700; text-transform: uppercase; line-height: 1; margin-bottom: 2px; }
        .field-value { font-size: 11px; color: #111; font-weight: 500; line-height: 1.3; }
        .logo-area { border: 1px solid #aaa; padding: 4px 8px; display: flex; align-items: center; min-width: 120px; }
        .bank-code { border-left: 3px solid #aaa; border-right: 3px solid #aaa; padding: 0 8px; font-size: 14px; font-weight: 700; display: flex; align-items: center; }
        .linha-dig { flex: 1; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; display: flex; align-items: center; padding: 0 8px; border: 1px solid #aaa; }
        .barcode-section { padding: 8px; border-top: 2px solid #000; }
        .linha-cod { font-family: monospace; font-size: 10px; letter-spacing: 1px; text-align: center; margin-top: 4px; }
        .section-title { font-size: 8px; font-weight: 700; background: #eee; padding: 2px 6px; text-transform: uppercase; border-bottom: 1px solid #aaa; }
        .instrucoes { font-size: 10px; line-height: 1.7; padding: 4px 6px; min-height: 60px; border: 1px solid #aaa; flex: 1; }
        .badge { background: #f59e0b; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
      </style>
      </head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="shrink-0 px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Boleto Bancário
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full font-medium">
              <AlertTriangle size={10} />
              Simulado para fins acadêmicos
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#1D4E89] text-white text-xs font-medium hover:bg-[#163D6D] transition-colors"
            >
              <Printer size={12} /> Imprimir
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Boleto content */}
        <div className="flex-1 overflow-auto p-5">
          <div ref={printRef} className="border border-gray-400 text-[11px] select-all" style={{ fontFamily: 'Arial, sans-serif' }}>

            {/* ─── Cabeçalho / Linha Digitável ─── */}
            <div className="flex border-b border-gray-400" style={{ height: 40 }}>
              <div className="flex items-center justify-center px-3 border-r border-gray-400" style={{ minWidth: 110 }}>
                <div className="text-center">
                  <div className="font-black text-base text-gray-800 leading-none">ITAÚ</div>
                  <div style={{ fontSize: 7 }} className="text-gray-500 font-semibold tracking-widest">SIMULADO</div>
                </div>
              </div>
              <div className="flex items-center justify-center px-4 border-r border-gray-400 font-black text-base text-gray-800" style={{ minWidth: 60 }}>
                341-7
              </div>
              <div className="flex items-center flex-1 px-4 font-mono font-semibold tracking-widest" style={{ fontSize: 13, letterSpacing: '0.04em' }}>
                {boleto.linhaDigitavel}
              </div>
            </div>

            {/* ─── Bloco 1: Local pagamento / Vencimento ─── */}
            <div className="flex border-b border-gray-400">
              <Field label="Local de Pagamento" value="Pagável em qualquer banco ou casa lotérica até o vencimento." className="flex-1" />
              <Field label="Vencimento" value={fmtDate(boleto.dataVencimento)} className="border-l border-gray-400" style={{ minWidth: 120 }} />
            </div>

            {/* ─── Bloco 2: Beneficiário / Ag-Cód Beneficiário ─── */}
            <div className="flex border-b border-gray-400">
              <Field
                label="Beneficiário"
                value={`${boleto.beneficiario.nome} — CNPJ ${boleto.beneficiario.cnpj}`}
                className="flex-1"
              />
              <Field
                label="Agência / Código Beneficiário"
                value={`${boleto.banco.agencia} / ${boleto.banco.conta}-0`}
                className="border-l border-gray-400"
                style={{ minWidth: 160 }}
              />
            </div>

            {/* ─── Bloco 3: Nosso Número / Nº Doc / Emissão / Valor ─── */}
            <div className="flex border-b border-gray-400">
              <Field label="Nosso Número" value={`${boleto.nossoNumero}-${boleto.nossoNumero.split('').reduce((s, d) => s + parseInt(d), 0) % 10}`} className="flex-1" />
              <Field label="Nº do Documento" value={boleto.descricao.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 16)} className="flex-1 border-l border-gray-400" />
              <Field label="Data Emissão" value={fmtDate(boleto.dataEmissao)} className="flex-1 border-l border-gray-400" />
              <Field label="Valor do Documento" value={fmtBRL(boleto.valor)} className="flex-1 border-l border-gray-400" />
            </div>

            {/* ─── Bloco 4: Instruções + Valor ─── */}
            <div className="flex border-b border-gray-400" style={{ minHeight: 72 }}>
              <div className="flex-1 flex flex-col border-r border-gray-400">
                <span style={{ fontSize: 8 }} className="font-semibold uppercase text-gray-500 px-2 pt-1">Instruções (Texto de responsabilidade do Beneficiário)</span>
                <div className="px-2 pt-1 pb-2 flex flex-col gap-0.5">
                  {boleto.instrucoes?.map((inst, i) => (
                    <span key={i} style={{ fontSize: 10 }} className="text-gray-800">{inst}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col" style={{ minWidth: 160 }}>
                <Field label="(–) Desconto / Abatimento" value="" className="flex-1" />
                <Field label="(+) Multa / Juros" value="" className="flex-1 border-t border-gray-400" />
                <Field label="(=) Valor Cobrado" value={fmtBRL(boleto.valor)} className="flex-1 border-t border-gray-400" />
              </div>
            </div>

            {/* ─── Bloco 5: Pagador ─── */}
            <div className="border-b-2 border-gray-400">
              <Field
                label="Pagador"
                value={`${boleto.pagador.nome} — CPF/CNPJ ${boleto.pagador.cpfCnpj}${boleto.pagador.endereco ? ' — ' + boleto.pagador.endereco : ''}`}
              />
            </div>

            {/* ─── Barcode ─── */}
            <div className="px-4 pt-3 pb-2">
              <BarcodeI25 code={boleto.codigoBarras44} />
              <p className="text-center font-mono mt-1.5 text-gray-600 tracking-widest" style={{ fontSize: 9, letterSpacing: '0.06em' }}>
                {boleto.codigoBarras44}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
