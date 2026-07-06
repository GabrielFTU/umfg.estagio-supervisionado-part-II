import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Home, ChevronRight, ScanLine, Loader2, CheckCircle2, XCircle,
  Package, ArrowRight, PlayCircle, Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { fetchWithAuth } from '@/services/api';
import { Barcode } from '@/components/producao/Barcode';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrdemLookup = {
  id: string;
  codigoOrdem: string;
  quantidade: number;
  status: string | number;
  produtoNome: string;
  almoxarifadoNome: string;
  faseAtualNome: string;
  loteNumero: string | null;
  dataInicio?: string;
  dataFim?: string | null;
  observacoes?: string | null;
  roteiroCodigo?: string | null;
  pedidoCodigo?: string | null;
  pedidoClienteNome?: string | null;
};

type HistoricoItem = {
  id: number;
  codigo: string;
  ok: boolean;
  mensagem: string;
  hora: string;
};

const STATUS_LABEL: Record<string, string> = {
  '1': 'Em Produção', Ativa: 'Em Produção',
  '2': 'Aguardando', Aguardando: 'Aguardando',
  '3': 'Finalizada', Finalizada: 'Finalizada',
  '4': 'Cancelada', Cancelada: 'Cancelada',
  '5': 'Estornada', Estornada: 'Estornada',
};

const STATUS_COLORS: Record<string, string> = {
  '1': 'bg-blue-50 text-blue-700 border-blue-200', Ativa: 'bg-blue-50 text-blue-700 border-blue-200',
  '2': 'bg-amber-50 text-amber-700 border-amber-200', Aguardando: 'bg-amber-50 text-amber-700 border-amber-200',
  '3': 'bg-emerald-50 text-emerald-700 border-emerald-200', Finalizada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '4': 'bg-gray-100 text-gray-500 border-gray-200', Cancelada: 'bg-gray-100 text-gray-500 border-gray-200',
  '5': 'bg-orange-50 text-orange-600 border-orange-200', Estornada: 'bg-orange-50 text-orange-600 border-orange-200',
};

function podeBipar(status: string | number): boolean {
  const s = String(status);
  return s === '1' || s === 'Ativa' || s === '2' || s === 'Aguardando';
}

function labelAcao(status: string | number): string {
  const s = String(status);
  return (s === '2' || s === 'Aguardando') ? 'Iniciar Produção' : 'Avançar Fase';
}

let historicoSeq = 0;

function getCurrentUser(): { nome: string; email: string } | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function PrintModal({ ordem, onClose }: { ordem: OrdemLookup; onClose: () => void }) {
  const user = getCurrentUser();
  const emissao = new Date();
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
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-[2px]">
      <div className="shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Printer size={15} />
          <span className="font-semibold text-sm text-gray-800">Pré-visualização — Ordem de Produção</span>
          <span className="ml-1 font-mono text-xs text-gray-400">{ordem.codigoOrdem}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="h-8 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            Fechar
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#1D4E89] hover:bg-[#163D6D] text-white text-sm font-medium transition-colors">
            <Printer size={13} /> Imprimir
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#5a5a5a] py-8 px-4 flex justify-center">
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '12px', borderBottom: '2px solid #2c2c2c' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
              <img src="/icon-black.png" alt="" style={{ height: '42px', display: 'block' }} />
              <div>
                <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#222', letterSpacing: '1px', textTransform: 'uppercase' }}>Valisys ERP</div>
                <div style={{ fontSize: '7pt', color: '#888', marginTop: '1px' }}>Sistema de Gestão Industrial</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
              <div style={{ fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', color: '#555' }}>Ordem de Produção</div>
              <div style={{ fontSize: '22pt', fontWeight: 'bold', fontFamily: "'Courier New', monospace", color: '#000', lineHeight: 1.1, marginTop: '2px' }}>{ordem.codigoOrdem}</div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '120px' }}>
              <div style={{ fontSize: '6.5pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emissão</div>
              <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#222', marginTop: '2px' }}>{emissao.toLocaleDateString('pt-BR')}</div>
              <div style={{ fontSize: '8.5pt', color: '#666', marginTop: '1px' }}>{emissao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div style={{ border: '1px solid #333' }}>
            <div>
              <div style={{ backgroundColor: '#2c2c2c', color: 'white', fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '3px 9px' }}>Dados da Ordem</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #ccc', borderLeft: 'none', padding: '4px 8px', width: '20%' }}>
                      <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Código da O.P.</div>
                      <div style={{ fontSize: '9.5pt', marginTop: '2px', color: '#444' }}>{ordem.codigoOrdem}</div>
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '20%' }}>
                      <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Status</div>
                      <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{STATUS_LABEL[String(ordem.status)] ?? String(ordem.status)}</div>
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '4px 8px', width: '20%' }}>
                      <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Data de Início</div>
                      <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.dataInicio ? new Date(ordem.dataInicio).toLocaleDateString('pt-BR') : '—'}</div>
                    </td>
                    <td style={{ border: '1px solid #ccc', borderRight: 'none', padding: '4px 8px' }}>
                      <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Fase Atual</div>
                      <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.faseAtualNome || '—'}</div>
                    </td>
                  </tr>
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
                    <td style={{ border: '1px solid #ccc', borderRight: 'none', borderBottom: 'none', padding: '4px 8px' }}>
                      <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Pedido Vinculado</div>
                      <div style={{ fontSize: '9pt', marginTop: '2px', color: '#111' }}>{ordem.pedidoCodigo ? `${ordem.pedidoCodigo}${ordem.pedidoClienteNome ? ` — ${ordem.pedidoClienteNome}` : ''}` : '—'}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '2px solid #2c2c2c' }}>
              <div style={{ backgroundColor: '#2c2c2c', color: 'white', fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '3px 9px' }}>Produto</div>
              <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #ddd' }}>
                <div style={{ flex: 1, padding: '12px 14px', borderRight: '1px solid #ccc' }}>
                  <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Descrição do Produto</div>
                  <div style={{ fontSize: '14pt', fontWeight: 'bold', color: '#000', lineHeight: 1.2 }}>{ordem.produtoNome}</div>
                </div>
                <div style={{ minWidth: '110px', padding: '12px 14px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Quantidade</div>
                  <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000', lineHeight: 1 }}>{ordem.quantidade.toLocaleString('pt-BR')}</div>
                  <div style={{ fontSize: '7pt', color: '#aaa', marginTop: '2px' }}>unidades</div>
                </div>
              </div>
              {ordem.observacoes && (
                <div style={{ padding: '8px 14px', borderTop: '1px dashed #ccc' }}>
                  <div style={{ fontSize: '6pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>Observações</div>
                  <div style={{ fontSize: '9pt', color: '#333', lineHeight: 1.5 }}>{ordem.observacoes}</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '28px' }}>
            <div style={{ backgroundColor: '#2c2c2c', color: 'white', fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '3px 9px' }}>Assinaturas</div>
            <div style={{ display: 'flex' }}>
              {['Responsável de Produção', 'Controle de Qualidade', 'Almoxarifado'].map((label, i) => (
                <div key={label} style={{ flex: 1, borderRight: i < 2 ? '1px solid #ccc' : 'none', padding: '26px 20px 14px', textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #555', paddingTop: '5px', fontSize: '7.5pt', color: '#555' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #e0e0e0', paddingTop: '6px', fontSize: '7pt', color: '#bbb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span>Emitido em {emissao.toLocaleString('pt-BR')}{user ? ` · Usuário: ${user.nome}` : ''}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
              <Barcode value={ordem.codigoOrdem} height={48} width={1.8} />
              <span style={{ fontFamily: "'Courier New', monospace" }}>{ordem.codigoOrdem}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConsultaAcaoPage() {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [ordem, setOrdem] = useState<OrdemLookup | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const addHistorico = useCallback((codigoBipado: string, ok: boolean, mensagem: string) => {
    historicoSeq += 1;
    setHistorico(h => [
      { id: historicoSeq, codigo: codigoBipado, ok, mensagem, hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      ...h,
    ].slice(0, 15));
  }, []);

  const refocus = () => {
    setCodigo('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = codigo.trim();
    if (!valor) return;

    setLoading(true);
    setErrorMsg(null);
    setOrdem(null);
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/codigo/${encodeURIComponent(valor)}`);
      if (!res.ok) {
        throw new Error(res.status === 404
          ? `Nenhuma ordem encontrada para o código "${valor}".`
          : 'Não foi possível buscar a ordem.');
      }
      const data: OrdemLookup = await res.json();
      setOrdem(data);
      addHistorico(data.codigoOrdem, true, `Localizada — ${data.produtoNome}`);
    } catch (e: any) {
      const msg = e.message ?? 'Erro ao buscar ordem.';
      setErrorMsg(msg);
      addHistorico(valor, false, msg);
    } finally {
      setLoading(false);
      refocus();
    }
  };

  const handleBipar = async () => {
    if (!ordem) return;
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordem.id}/avancar-fase`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail ?? err?.title ?? 'Não foi possível registrar a bipagem.');
      }
      showToast(`Bipada: ${ordem.codigoOrdem}`);
      addHistorico(ordem.codigoOrdem, true, labelAcao(ordem.status));
      setOrdem(null);
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao bipar ordem.');
      addHistorico(ordem.codigoOrdem, false, e.message ?? 'Erro ao bipar ordem.');
    } finally {
      setActionLoading(false);
      refocus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Consulta e Ação</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col items-center">
        <div className="w-full max-w-xl space-y-5">

          {/* Scan input */}
          <form onSubmit={handleBuscar} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <ScanLine size={14} /> Bipar Ordem de Produção
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                placeholder="Bipe ou digite o código da O.P."
                autoComplete="off"
                className="flex-1 h-12 px-4 rounded-lg border border-gray-300 text-lg font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !codigo.trim()}
                className="h-12 px-5 rounded-lg bg-[#1D4E89] hover:bg-[#163D6D] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ScanLine size={15} />}
                Buscar
              </button>
            </div>
          </form>

          {/* Erro */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <XCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Ordem encontrada */}
          {ordem && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">Código da O.P.</div>
                  <div className="text-xl font-bold font-mono text-gray-900">{ordem.codigoOrdem}</div>
                </div>
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', STATUS_COLORS[String(ordem.status)] ?? 'bg-gray-100 text-gray-500 border-gray-200')}>
                  {STATUS_LABEL[String(ordem.status)] ?? String(ordem.status)}
                </span>
              </div>

              <div className="px-5 py-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">Produto</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{ordem.produtoNome}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">Quantidade</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{ordem.quantidade.toLocaleString('pt-BR')}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">Fase Atual</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{ordem.faseAtualNome || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">Almoxarifado</div>
                  <div className="text-sm font-medium text-gray-800 mt-0.5">{ordem.almoxarifadoNome || '—'}</div>
                </div>
              </div>

              <div className="px-5 pb-4 flex justify-center">
                <Barcode value={ordem.codigoOrdem} height={36} width={1.4} />
              </div>

              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setPrintOpen(true)}
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={16} /> Imprimir O.P.
                </button>
                {podeBipar(ordem.status) ? (
                  <button
                    onClick={handleBipar}
                    disabled={actionLoading}
                    className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading
                      ? <Loader2 size={16} className="animate-spin" />
                      : (String(ordem.status) === '2' || ordem.status === 'Aguardando')
                        ? <PlayCircle size={16} />
                        : <ArrowRight size={16} />}
                    Bipar — {labelAcao(ordem.status)}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-1">
                    <Package size={14} /> Ordem {STATUS_LABEL[String(ordem.status)]?.toLowerCase()} — nenhuma ação disponível.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Histórico de bipagens */}
          {historico.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Últimas bipagens</div>
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {historico.map(h => (
                  <div key={h.id} className="flex items-center gap-2.5 px-4 py-2.5 text-sm">
                    {h.ok ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
                    <span className="font-mono text-xs text-gray-700">{h.codigo}</span>
                    <span className="text-gray-500 text-xs flex-1 truncate">{h.mensagem}</span>
                    <span className="text-[11px] text-gray-400 shrink-0">{h.hora}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {printOpen && ordem && (
        <PrintModal ordem={ordem} onClose={() => setPrintOpen(false)} />
      )}
    </div>
  );
}
