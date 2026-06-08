import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Smartphone } from 'lucide-react';
import { gerarPixPayload, PIX_CONFIG } from '@/lib/pix';

interface PixModalProps {
  descricao: string;
  valor: number;
  contaId: string;
  onClose: () => void;
}

export function PixModal({ descricao, valor, contaId, onClose }: PixModalProps) {
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const payload = gerarPixPayload({
    chave:     PIX_CONFIG.chave,
    nome:      PIX_CONFIG.nome,
    cidade:    PIX_CONFIG.cidade,
    valor,
    descricao: descricao.slice(0, 72),
    txid:      contaId.replace(/-/g, '').slice(0, 25),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-[#32BCAD] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <Smartphone size={18} />
            <span className="font-semibold text-sm">Pagar via PIX</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-6">

          {/* Beneficiário */}
          <div className="text-center mb-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Beneficiário</p>
            <p className="text-sm font-semibold text-gray-800">{PIX_CONFIG.nome}</p>
            <p className="text-xs text-gray-400">{PIX_CONFIG.chave}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-5">
            <div className="p-3 border-2 border-gray-100 rounded-2xl bg-white shadow-sm">
              <QRCodeSVG
                value={payload}
                size={192}
                level="M"
                bgColor="#ffffff"
                fgColor="#111827"
                imageSettings={{
                  src: '',
                  height: 0,
                  width: 0,
                  excavate: false,
                }}
              />
            </div>
          </div>

          {/* Valor + Descrição */}
          <div className="text-center mb-5">
            <p className="text-2xl font-bold text-gray-900">
              {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{descricao}</p>
          </div>

          {/* Copia e Cola */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              PIX Copia e Cola
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="flex-1 text-[11px] text-gray-500 font-mono break-all leading-relaxed line-clamp-2">
                {payload}
              </p>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 shadow-sm"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Aviso acadêmico */}
          <p className="mt-4 text-center text-[10px] text-gray-300">
            Ambiente acadêmico · chave PIX simulada · payload EMV real
          </p>
        </div>
      </div>
    </div>
  );
}
