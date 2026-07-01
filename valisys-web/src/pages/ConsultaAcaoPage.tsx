import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Home, ChevronRight, ScanLine, Loader2, CheckCircle2, XCircle,
  Package, ArrowRight, PlayCircle,
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

export function ConsultaAcaoPage() {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [ordem, setOrdem] = useState<OrdemLookup | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

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

              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
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
    </div>
  );
}
