import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, Factory,
  Loader2, MoreHorizontal, Play, Printer, Eye, Pencil, XCircle,
  AlertTriangle, ShoppingBag, X, AlertCircle, ArrowRight, RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { fetchWithAuth } from '@/services/api';
import { Barcode } from '@/components/producao/Barcode';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrdemItem = {
  id: string;
  codigoOrdem: string;
  quantidade: number;
  status: string | number;
  dataInicio: string;
  dataFim: string | null;
  observacoes: string | null;
  produtoId: string;
  produtoNome: string;
  almoxarifadoId: string;
  almoxarifadoNome: string;
  faseAtualId: string;
  faseAtualNome: string;
  loteId: string | null;
  loteNumero: string | null;
  roteiroProducaoId: string | null;
  roteiroCodigo: string | null;
  pedidoId?: string;
  pedidoCodigo?: string;
  pedidoClienteNome?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_LABEL: Record<string, string> = {
  Ativa: 'Em Produção',
  Aguardando: 'Aguardando',
  Finalizada: 'Finalizada',
  Cancelada: 'Cancelada',
  Estornada: 'Estornada',
  '1': 'Em Produção',
  '2': 'Aguardando',
  '3': 'Finalizada',
  '4': 'Cancelada',
  '5': 'Estornada',
};

const STATUS_COLORS: Record<string, string> = {
  Ativa: 'bg-blue-50 text-blue-700 border border-blue-200',
  Aguardando: 'bg-amber-50 text-amber-700 border border-amber-200',
  Finalizada: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelada: 'bg-gray-100 text-gray-500 border border-gray-200',
  Estornada: 'bg-orange-50 text-orange-600 border border-orange-200',
  '1': 'bg-blue-50 text-blue-700 border border-blue-200',
  '2': 'bg-amber-50 text-amber-700 border border-amber-200',
  '3': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '4': 'bg-gray-100 text-gray-500 border border-gray-200',
  '5': 'bg-orange-50 text-orange-600 border border-orange-200',
};

const STATUS_KEYS = ['Ativa', 'Aguardando', 'Finalizada', 'Cancelada', 'Estornada'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function statusStr(s: string | number): string {
  return String(s);
}

function StatusBadge({ status }: { status: string | number }) {
  const s = statusStr(status);
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[s] ?? 'bg-gray-100 text-gray-500')}>
      {STATUS_LABEL[s] ?? s}
    </span>
  );
}

function PedidoIndicator({ pedidoId, pedidoCodigo, clienteNome }: {
  pedidoId: string; pedidoCodigo?: string; clienteNome?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="relative group/pedido inline-flex items-center">
      <button
        onClick={e => { e.stopPropagation(); navigate(`/comercial/pedidos/${pedidoId}`); }}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-[#1D4E89] hover:bg-blue-100 transition-colors"
        aria-label={`Pedido ${pedidoCodigo ?? pedidoId}`}
      >
        <ShoppingBag size={9} />
      </button>
      <div className="
        pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2
        px-2.5 py-2 rounded-lg bg-gray-800 text-white text-xs whitespace-nowrap
        opacity-0 group-hover/pedido:opacity-100
        -translate-y-1 group-hover/pedido:translate-y-0
        transition-all duration-150 z-50 shadow-lg min-w-max
      ">
        <p className="font-semibold">Pedido {pedidoCodigo ?? pedidoId}</p>
        {clienteNome && <p className="text-gray-300 mt-0.5">{clienteNome}</p>}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

// ─── Row Menu ────────────────────────────────────────────────────────────────

function RowMenu({ ordem, onView, onEdit, onIniciar, onAvancar, onCancelar, onImprimir, onEstornar }: {
  ordem: OrdemItem;
  onView: () => void; onEdit: () => void;
  onIniciar: () => void; onAvancar: () => void; onCancelar: () => void; onImprimir: () => void;
  onEstornar: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const s = statusStr(ordem.status);
  const semRoteiro    = !ordem.roteiroProducaoId;
  const podeIniciar   = s === 'Aguardando' || s === '2';
  const podeAvancar   = s === 'Ativa' || s === '1';
  const podeEditar    = s !== 'Finalizada' && s !== 'Cancelada' && s !== 'Estornada' && s !== '3' && s !== '4' && s !== '5';
  const podeCancelar  = s === 'Ativa' || s === '1';
  const podeEstornar  = s === 'Finalizada' || s === '3';

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
        btnRef.current && !btnRef.current.contains(e.target as Node)
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
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-0.5 text-[13px]"
        >
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">
            <Eye size={13} /> Visualizar
          </button>
          {podeEditar && (
            <button onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">
              <Pencil size={13} /> Editar
            </button>
          )}
          {podeIniciar && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onIniciar(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
                <Play size={13} /> Iniciar Produção
              </button>
            </>
          )}
          {podeAvancar && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onAvancar(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
                <ArrowRight size={13} /> {semRoteiro ? 'Concluir Produção' : 'Avançar Fase'}
              </button>
            </>
          )}
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onImprimir(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer size={13} /> Imprimir
          </button>
          {podeCancelar && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onCancelar(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors">
                <XCircle size={13} /> Cancelar Ordem
              </button>
            </>
          )}
          {podeEstornar && (
            <>
              <div className="my-0.5 mx-2 border-t border-gray-100" />
              <button onClick={() => { setOpen(false); onEstornar(); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-orange-500 hover:bg-orange-50 transition-colors">
                <RotateCcw size={13} /> Estornar Produção
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({ ordem, loading, onConfirm, onCancel }: {
  ordem: OrdemItem; loading: boolean;
  onConfirm: (justificativa: string) => void;
  onCancel: () => void;
}) {
  const [texto, setTexto] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCancel]);

  const handleConfirm = () => {
    setTouched(true);
    if (!texto.trim()) { inputRef.current?.focus(); return; }
    onConfirm(texto.trim());
  };

  const invalid = touched && !texto.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl shadow-black/10 w-full max-w-sm mx-4 overflow-hidden border border-gray-100">
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={17} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">Cancelar Ordem</p>
              <p className="mt-1 text-xs text-gray-500">{ordem.codigoOrdem} — {ordem.produtoNome}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 pb-2">
          <p className="text-xs text-gray-500 mb-2">Esta ação não pode ser desfeita. Informe o motivo:</p>
          <textarea
            ref={inputRef}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleConfirm(); }}
            placeholder="Descreva o motivo do cancelamento…"
            rows={3}
            className={cn(
              'w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-red-400 resize-none placeholder:text-gray-300',
              invalid ? 'border-red-300' : 'border-gray-200',
            )}
          />
          {invalid && (
            <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 inline-block" />
              Justificativa obrigatória
            </p>
          )}
          <p className="text-[11px] text-gray-400 mt-1">Ctrl+Enter para confirmar</p>
        </div>
        <div className="flex gap-2 px-5 pb-5 pt-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Voltar
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {loading && <Loader2 size={13} className="animate-spin" />}
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Estornar Modal ───────────────────────────────────────────────────────────

function EstornarModal({ ordem, loading, onConfirm, onCancel }: {
  ordem: OrdemItem; loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-xl shadow-black/10 w-full max-w-sm mx-4 overflow-hidden border border-gray-100">
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <RotateCcw size={17} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">Estornar Produção</p>
              <p className="mt-1 text-xs text-gray-500">{ordem.codigoOrdem} — {ordem.produtoNome}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 pb-4 space-y-2">
          <p className="text-xs text-gray-600 font-medium">Esta ação irá:</p>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
            <li>Reverter o consumo das matérias-primas ao estoque</li>
            <li>Remover o produto acabado gerado pela produção</li>
            <li>Registrar a movimentação de estorno</li>
            <li>Alterar o status da O.P. para <span className="text-orange-600 font-medium">Estornada</span></li>
          </ul>
          <p className="text-xs text-red-500 font-medium pt-1">Esta ação não pode ser desfeita.</p>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Voltar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {loading && <Loader2 size={13} className="animate-spin" />}
            Confirmar Estorno
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Print Modal ─────────────────────────────────────────────────────────────

function getCurrentUser(): { nome: string; email: string } | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}


function PrintModal({
  ordem, filters, search, onClose,
}: {
  ordem: OrdemItem;
  filters: FilterState;
  search: string;
  onClose: () => void;
}) {
  const user = getCurrentUser();
  const emissao = new Date();
  const statusLabel = STATUS_LABEL[statusStr(ordem.status)] ?? statusStr(ordem.status);

  const filtrosDesc: string[] = [];
  if (search) filtrosDesc.push(`Busca: "${search}"`);
  if (filters.status.length) filtrosDesc.push(`Status: ${filters.status.map(s => STATUS_LABEL[s] ?? s).join(', ')}`);
  if (filters.fase) filtrosDesc.push(`Fase: ${filters.fase}`);
  if (filters.dateFrom) filtrosDesc.push(`De: ${new Date(filters.dateFrom + 'T00:00').toLocaleDateString('pt-BR')}`);
  if (filters.dateTo) filtrosDesc.push(`Até: ${new Date(filters.dateTo + 'T00:00').toLocaleDateString('pt-BR')}`);

  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handlePrint = () => {
    if (!docRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <base href="${window.location.origin}/">
  <title>Ordem de Produção ${ordem.codigoOrdem}</title>
  <style>
    html, body { margin: 0; padding: 0; background: white; font-family: Arial, Helvetica, sans-serif; color: #111; }
    table { border-collapse: collapse; }
    img { display: block; }
    @page { size: A4 portrait; margin: 1.2cm 1.5cm; }
  </style>
</head>
<body>${docRef.current.innerHTML}</body>
</html>`);
    win.document.close();
    win.onload = () => { win.print(); win.close(); };
  };

  return (
    <>

      {/* ── Fullscreen print-preview overlay ── */}
      <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-[2px]">

        {/* Toolbar */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Printer size={15} />
            <span className="font-semibold text-sm text-gray-800">Pré-visualização — Ordem de Produção</span>
            <span className="ml-1 font-mono text-xs text-gray-400">{ordem.codigoOrdem}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="h-8 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              Fechar
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#1D4E89] hover:bg-[#163D6D] text-white text-sm font-medium transition-colors">
              <Printer size={13} /> Imprimir
            </button>
          </div>
        </div>

        {/* Paper area */}
        <div className="flex-1 overflow-y-auto bg-[#5a5a5a] py-8 px-4 flex justify-center">

          {/* A4 paper */}
          <div
            ref={docRef}
            style={{
              width: '21cm',
              minHeight: '29.7cm',
              backgroundColor: 'white',
              boxShadow: '0 6px 32px rgba(0,0,0,0.45)',
              padding: '1.2cm 1.5cm',
              boxSizing: 'border-box',
              fontFamily: 'Arial, Helvetica, sans-serif',
              color: '#111',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* ══ CABEÇALHO ══ */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: '10px', marginBottom: '12px',
              borderBottom: '2px solid #2c2c2c',
            }}>
              {/* Logo + sistema */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
                <img src="/icon-black.png" alt="" style={{ height: '42px', display: 'block' }} />
                <div>
                  <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#222', letterSpacing: '1px', textTransform: 'uppercase' }}>Valisys ERP</div>
                  <div style={{ fontSize: '7pt', color: '#888', marginTop: '1px' }}>Sistema de Gestão Industrial</div>
                </div>
              </div>

              {/* Título central */}
              <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                <div style={{ fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', color: '#555' }}>
                  Ordem de Produção
                </div>
                <div style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: "'Courier New', monospace", color: '#000', lineHeight: 1.1, marginTop: '2px' }}>
                  {ordem.codigoOrdem}
                </div>
              </div>

              {/* Data + hora */}
              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <div style={{ fontSize: '6.5pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emissão</div>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#222', marginTop: '2px' }}>
                  {emissao.toLocaleDateString('pt-BR')}
                </div>
                <div style={{ fontSize: '8.5pt', color: '#666', marginTop: '1px' }}>
                  {emissao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* ══ CORPO (borda única envolvendo as seções) ══ */}
            <div style={{ border: '1px solid #333' }}>

              {/* ── Seção 1: DADOS DO PEDIDO ── */}
              <div>
                <div style={{
                  backgroundColor: '#2c2c2c', color: 'white',
                  fontSize: '6.5pt', fontWeight: 'bold',
                  textTransform: 'uppercase', letterSpacing: '1.5px',
                  padding: '3px 9px',
                }}>
                  Dados do Pedido
                </div>

                {/* Filtros aplicados (dentro da seção, antes dos campos) */}
                {filtrosDesc.length > 0 && (
                  <div style={{
                    borderBottom: '1px solid #ddd',
                    padding: '4px 9px',
                    fontSize: '7pt', color: '#777',
                    backgroundColor: '#fafafa',
                  }}>
                    <strong style={{ color: '#555' }}>Filtros:</strong>&nbsp;{filtrosDesc.join(' · ')}
                  </div>
                )}

                {/* Linha 1: Código | Status | D.Início | D.Conclusão | Fase */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ccc', borderLeft: 'none', padding: '4px 8px', width: '18%' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Código da O.P.</div>
                        <div style={{ fontSize: '9.5pt', marginTop: '2px', color: '#444' }}>
                          {ordem.codigoOrdem}
                        </div>
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '16%' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Status</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{statusLabel}</div>
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '16%' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Data de Início</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{fmtDate(ordem.dataInicio)}</div>
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '16%' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Data de Conclusão</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.dataFim ? fmtDate(ordem.dataFim) : '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #ccc', borderRight: 'none', padding: '4px 8px' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Fase Atual</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.faseAtualNome || '—'}</div>
                      </td>
                    </tr>

                    {/* Linha 2: Almoxarifado | Lote | Roteiro | Pedido */}
                    <tr>
                      <td style={{ border: '1px solid #ccc', borderLeft: 'none', borderBottom: 'none', padding: '4px 8px' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Almoxarifado</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.almoxarifadoNome}</div>
                      </td>
                      <td style={{ border: '1px solid #ccc', borderBottom: 'none', padding: '4px 8px' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Lote</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.loteNumero || '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #ccc', borderBottom: 'none', padding: '4px 8px' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Roteiro</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.roteiroCodigo || '—'}</div>
                      </td>
                      <td colSpan={2} style={{ border: '1px solid #ccc', borderRight: 'none', borderBottom: 'none', padding: '4px 8px' }}>
                        <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Pedido Vinculado</div>
                        <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>
                          {ordem.pedidoCodigo
                            ? `${ordem.pedidoCodigo}${ordem.pedidoClienteNome ? ` — ${ordem.pedidoClienteNome}` : ''}`
                            : '—'}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── Seção 2: PRODUTO ── */}
              <div style={{ borderTop: '2px solid #2c2c2c' }}>
                <div style={{
                  backgroundColor: '#2c2c2c', color: 'white',
                  fontSize: '6.5pt', fontWeight: 'bold',
                  textTransform: 'uppercase', letterSpacing: '1.5px',
                  padding: '3px 9px',
                }}>
                  Produto
                </div>

                <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #ddd' }}>
                  {/* Nome do produto (destaque) */}
                  <div style={{ flex: 1, padding: '12px 14px', borderRight: '1px solid #ccc' }}>
                    <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>
                      Descrição do Produto
                    </div>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', color: '#000', lineHeight: 1.2 }}>
                      {ordem.produtoNome}
                    </div>
                  </div>
                  {/* Quantidade (destaque lateral) */}
                  <div style={{ minWidth: '110px', padding: '12px 14px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>
                      Quantidade
                    </div>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', lineHeight: 1 }}>
                      {ordem.quantidade.toLocaleString('pt-BR')}
                    </div>
                    <div style={{ fontSize: '7pt', color: '#aaa', marginTop: '2px' }}>unidades</div>
                  </div>
                </div>

                {/* Observações (dentro da seção Produto) */}
                {ordem.observacoes && (
                  <div style={{ padding: '8px 14px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>
                      Observações
                    </div>
                    <div style={{ fontSize: '9pt', color: '#333', lineHeight: 1.5 }}>
                      {ordem.observacoes}
                    </div>
                  </div>
                )}
              </div>

            </div>{/* fim do corpo */}

            {/* ══ ASSINATURAS ══ */}
            <div style={{ marginTop: '28px' }}>
              <div style={{
                backgroundColor: '#2c2c2c', color: 'white',
                fontSize: '6.5pt', fontWeight: 'bold',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                padding: '3px 9px',
              }}>
                Assinaturas
              </div>
              <div style={{ display: 'flex' }}>
                {['Responsável de Produção', 'Controle de Qualidade', 'Almoxarifado'].map((label, i) => (
                  <div key={label} style={{
                    flex: 1,
                    borderRight: i < 2 ? '1px solid #ccc' : 'none',
                    padding: '26px 20px 14px',
                    textAlign: 'center',
                  }}>
                    <div style={{ borderTop: '1px solid #555', paddingTop: '5px', fontSize: '7.5pt', color: '#555' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ RODAPÉ ══ */}
            <div style={{
              marginTop: 'auto', borderTop: '1px solid #e0e0e0', paddingTop: '6px',
              fontSize: '7pt', color: '#bbb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
              <span>
                Emitido em {emissao.toLocaleString('pt-BR')}
                {user ? ` · Usuário: ${user.nome}` : ''}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                <Barcode value={ordem.codigoOrdem} height={48} width={1.8} />
                <span style={{ fontFamily: "'Courier New', monospace" }}>{ordem.codigoOrdem}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterState {
  status: string[];
  fase: string;
  dateFrom: string;
  dateTo: string;
}

function FilterPanel({
  fases, filters, onApply, onClear, onClose,
}: {
  fases: string[];
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);

  return (
    <div className="absolute z-30 top-full right-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Filtros</span>
        <button onClick={onClear} className="text-[11px] text-red-400 hover:text-red-600 transition-colors">
          Limpar tudo
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_KEYS.map(s => (
            <button
              key={s}
              onClick={() => setLocal(prev => ({
                ...prev,
                status: prev.status.includes(s) ? prev.status.filter(x => x !== s) : [...prev.status, s],
              }))}
              className={cn(
                'text-xs py-1 px-2.5 rounded-full border transition-colors',
                local.status.includes(s)
                  ? 'bg-[#1D4E89] border-[#1D4E89] text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300',
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {fases.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Fase Atual</p>
          <select
            value={local.fase}
            onChange={e => setLocal(prev => ({ ...prev, fase: e.target.value }))}
            className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#1D4E89] bg-white text-gray-700"
          >
            <option value="">Todas as fases</option>
            {fases.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Período de Criação</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 mb-0.5 block">De</label>
            <input
              type="date"
              value={local.dateFrom}
              onChange={e => setLocal(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#1D4E89]"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 mb-0.5 block">Até</label>
            <input
              type="date"
              value={local.dateTo}
              onChange={e => setLocal(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full h-8 px-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#1D4E89]"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button onClick={onClose}
          className="flex-1 h-8 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Fechar
        </button>
        <button onClick={() => { onApply(local); onClose(); }}
          className="flex-1 h-8 text-xs text-white bg-[#1D4E89] hover:bg-[#163D6D] rounded-lg transition-colors font-medium">
          Aplicar
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OrdensDeProducaoPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [ordens, setOrdens]           = useState<OrdemItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState<FilterState>({ status: [], fase: '', dateFrom: '', dateTo: '' });
  const [filterOpen, setFilterOpen]   = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);

  const [cancelTarget, setCancelTarget]   = useState<OrdemItem | null>(null);
  const [estornarTarget, setEstornarTarget] = useState<OrdemItem | null>(null);
  const [printTarget, setPrintTarget]     = useState<OrdemItem | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/api/ordens-producao');
      if (res.status === 403) { setOrdens([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      setOrdens(data.map(o => ({
        id: o.id,
        codigoOrdem: o.codigoOrdem,
        quantidade: o.quantidade ?? 0,
        status: o.status,
        dataInicio: o.dataInicio,
        dataFim: o.dataFim ?? null,
        observacoes: o.observacoes ?? null,
        produtoId: o.produtoId,
        produtoNome: o.produtoNome ?? '—',
        almoxarifadoId: o.almoxarifadoId,
        almoxarifadoNome: o.almoxarifadoNome ?? '—',
        faseAtualId: o.faseAtualId,
        faseAtualNome: o.faseAtualNome ?? '—',
        loteId: o.loteId ?? null,
        loteNumero: o.loteNumero ?? null,
        roteiroProducaoId: o.roteiroProducaoId ?? null,
        roteiroCodigo: o.roteiroCodigo ?? null,
        pedidoId: o.pedidoId ?? undefined,
        pedidoCodigo: o.pedidoCodigo ?? undefined,
        pedidoClienteNome: o.pedidoClienteNome ?? undefined,
      })));
    } catch {
      setError('Não foi possível carregar as ordens de produção.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAvancarFase = async (ordem: OrdemItem, acao: 'iniciar' | 'avancar' = 'avancar') => {
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordem.id}/avancar-fase`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail ?? err?.title ?? (acao === 'iniciar' ? 'Não foi possível iniciar a produção.' : 'Não foi possível avançar a fase.'));
      }
      showToast(acao === 'iniciar' ? `Produção iniciada: ${ordem.codigoOrdem}` : `Fase avançada: ${ordem.codigoOrdem}`);
      load();
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao avançar fase.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEstornar = async (ordem: OrdemItem) => {
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordem.id}/estornar`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail ?? err?.title ?? 'Não foi possível estornar a produção.');
      }
      showToast(`Produção estornada: ${ordem.codigoOrdem}`);
      setEstornarTarget(null);
      load();
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao estornar produção.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelar = async (ordem: OrdemItem, justificativa: string) => {
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordem.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificativa }),
      });
      if (!res.ok) throw new Error('Não foi possível cancelar a ordem.');
      showToast(`Ordem ${ordem.codigoOrdem} cancelada.`);
      setCancelTarget(null);
      load();
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao cancelar ordem.');
    } finally {
      setActionLoading(false);
    }
  };

  const fases = Array.from(new Set(ordens.map(o => o.faseAtualNome).filter(Boolean)));

  const filtrosAtivos = filters.status.length + (filters.fase ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  const filtered = ordens.filter(o => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.codigoOrdem.toLowerCase().includes(q) &&
        !o.produtoNome.toLowerCase().includes(q) &&
        !(o.loteNumero ?? '').toLowerCase().includes(q) &&
        !(o.pedidoCodigo ?? '').toLowerCase().includes(q))
        return false;
    }
    if (filters.status.length && !filters.status.includes(statusStr(o.status))) return false;
    if (filters.fase && o.faseAtualNome !== filters.fase) return false;
    if (filters.dateFrom && new Date(o.dataInicio) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(o.dataInicio) > new Date(filters.dateTo + 'T23:59:59')) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const clearFilters = () => setFilters({ status: [], fase: '', dateFrom: '', dateTo: '' });

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Toolbar ── */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none transition-colors placeholder:text-gray-300 text-gray-700"
            placeholder="Buscar por ordem, produto ou lote…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button
          onClick={() => navigate('/producao/ordens/novo')}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors shrink-0"
        >
          <Plus size={14} /> Nova Ordem
        </button>

        <div ref={filterRef} className="relative shrink-0">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
              filtrosAtivos
                ? 'border-[#1D4E89] bg-blue-50 text-[#1D4E89]'
                : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600',
            )}
          >
            <SlidersHorizontal size={15} />
          </button>
          {filtrosAtivos > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1D4E89] text-white text-[9px] font-bold flex items-center justify-center pointer-events-none">
              {filtrosAtivos}
            </span>
          )}
          {filterOpen && (
            <div onMouseDown={e => e.stopPropagation()}>
              <FilterPanel
                fases={fases}
                filters={filters}
                onApply={f => { setFilters(f); setPage(1); }}
                onClear={() => { clearFilters(); setPage(1); }}
                onClose={() => setFilterOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Chips filtros ativos ── */}
      {filtrosAtivos > 0 && (
        <div className="shrink-0 px-6 py-2 border-b border-gray-100 flex flex-wrap items-center gap-2">
          {filters.status.map(s => (
            <span key={s} className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Status: {STATUS_LABEL[s]}
              <button onClick={() => setFilters(p => ({ ...p, status: p.status.filter(x => x !== s) }))} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          ))}
          {filters.fase && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Fase: {filters.fase}
              <button onClick={() => setFilters(p => ({ ...p, fase: '' }))} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              A partir de: {new Date(filters.dateFrom).toLocaleDateString('pt-BR')}
              <button onClick={() => setFilters(p => ({ ...p, dateFrom: '' }))} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          {filters.dateTo && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#1D4E89] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
              Até: {new Date(filters.dateTo).toLocaleDateString('pt-BR')}
              <button onClick={() => setFilters(p => ({ ...p, dateTo: '' }))} className="hover:text-blue-800"><X size={11} /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
            Limpar tudo
          </button>
        </div>
      )}

      {/* ── Tabela ── */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#1D4E89] hover:underline">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left font-semibold text-gray-700 px-6 py-3 w-36">Ordem</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Produto</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden md:table-cell">Lote</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden lg:table-cell">Fase Atual</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3 hidden lg:table-cell">Data Início</th>
                <th className="text-left font-semibold text-gray-700 px-4 py-3">Status</th>
                <th className="w-10 pr-4" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Factory size={24} className="text-[#1D4E89]" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {search || filtrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhuma ordem de produção cadastrada'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {search || filtrosAtivos ? 'Ajuste os filtros ou a busca.' : 'Clique em "Nova Ordem" para criar a primeira.'}
                      </p>
                      {!search && !filtrosAtivos && (
                        <button
                          onClick={() => navigate('/producao/ordens/novo')}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D4E89] text-white text-sm hover:bg-[#163D6D] transition-colors mt-1"
                        >
                          <Plus size={14} /> Nova Ordem
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paginated.map(o => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/producao/ordens/${o.id}`)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3">
                    <span className="text-sm font-semibold text-gray-700 font-mono">{o.codigoOrdem}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-gray-700 truncate">{o.produtoNome}</span>
                      {o.pedidoId && (
                        <PedidoIndicator
                          pedidoId={o.pedidoId}
                          pedidoCodigo={o.pedidoCodigo}
                          clienteNome={o.pedidoClienteNome}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    {o.loteNumero
                      ? <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{o.loteNumero}</span>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{o.faseAtualNome || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell tabular-nums text-center">{fmtDate(o.dataInicio)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="pr-4 text-right" onClick={e => e.stopPropagation()}>
                    <RowMenu
                      ordem={o}
                      onView={() => navigate(`/producao/ordens/${o.id}`)}
                      onEdit={() => navigate(`/producao/ordens/${o.id}/editar`)}
                      onIniciar={() => handleAvancarFase(o, 'iniciar')}
                      onAvancar={() => handleAvancarFase(o, 'avancar')}
                      onCancelar={() => setCancelTarget(o)}
                      onImprimir={() => setPrintTarget(o)}
                      onEstornar={() => setEstornarTarget(o)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && filtered.length > 0 && (
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-3 text-sm text-gray-500">
          <span className="mr-4">
            Exibindo {filtered.length} ordem{filtered.length !== 1 ? 's' : ''}
            {filtrosAtivos || search ? ` (filtrado de ${ordens.length})` : ''}.
          </span>
          <button onClick={() => goPage(1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
          <button onClick={() => goPage(page - 1)} disabled={page === 1} className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => goPage(p)}
              className={cn('w-7 h-7 rounded-full text-sm transition-colors', p === page ? 'bg-blue-100 text-[#1D4E89] font-semibold' : 'hover:bg-gray-100')}>
              {p}
            </button>
          ))}
          <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>'}</button>
          <button onClick={() => goPage(totalPages)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>>'}</button>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="ml-2 border border-gray-300 rounded text-xs px-1 py-0.5 outline-none focus:border-[#1D4E89]">
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* ── Modais ── */}
      {cancelTarget && (
        <CancelModal
          ordem={cancelTarget}
          loading={actionLoading}
          onConfirm={just => handleCancelar(cancelTarget, just)}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {estornarTarget && (
        <EstornarModal
          ordem={estornarTarget}
          loading={actionLoading}
          onConfirm={() => handleEstornar(estornarTarget)}
          onCancel={() => setEstornarTarget(null)}
        />
      )}

      {printTarget && (
        <PrintModal
          ordem={printTarget}
          filters={filters}
          search={search}
          onClose={() => setPrintTarget(null)}
        />
      )}
    </div>
  );
}
