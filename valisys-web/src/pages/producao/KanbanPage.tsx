import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home, ChevronRight, Loader2, RefreshCw, AlertTriangle, Clock, Package,
  GripVertical, X, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { fetchWithAuth } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoFase = 'Intermediaria' | 'Inicial' | 'Final' | 'Pausa' | 'Impedimento' | 'Conferencia';

interface Fase {
  id: string;
  nome: string;
  ordem: number;
  tipoFase: TipoFase;
  tempoPadraoDias: number;
  ativo: boolean;
}

interface OrdemKanban {
  id: string;
  codigoOrdem: string;
  produtoNome: string;
  quantidade: number;
  status: string;
  dataInicio: string;
  faseAtualId: string;
  observacoes: string | null;
  loteNumero: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_FASE_LABEL: Record<TipoFase, string> = {
  Inicial: 'Inicial',
  Intermediaria: 'Intermediária',
  Final: 'Final',
  Pausa: 'Pausa',
  Impedimento: 'Impedimento',
  Conferencia: 'Conferência',
};

const TIPO_FASE_COLORS: Record<TipoFase, { header: string; badge: string }> = {
  Inicial:      { header: 'bg-blue-600',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  Intermediaria:{ header: 'bg-gray-600',   badge: 'bg-gray-50 text-gray-700 border-gray-200' },
  Final:        { header: 'bg-emerald-600',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Pausa:        { header: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  Impedimento:  { header: 'bg-red-600',    badge: 'bg-red-50 text-red-700 border-red-200' },
  Conferencia:  { header: 'bg-purple-600', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const TIPO_FASE_ENUM: Record<number, TipoFase> = {
  0: 'Intermediaria',
  1: 'Inicial',
  2: 'Final',
  3: 'Pausa',
  4: 'Impedimento',
  5: 'Conferencia',
};

function isOverdue(ordem: OrdemKanban, fase: Fase): boolean {
  if (!fase.tempoPadraoDias) return false;
  const inicio = new Date(ordem.dataInicio);
  const limite = new Date(inicio);
  limite.setDate(limite.getDate() + fase.tempoPadraoDias);
  return new Date() > limite;
}

function diasNaFase(dataInicio: string): number {
  return Math.floor((Date.now() - new Date(dataInicio).getTime()) / 86_400_000);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ─── Justification Modal ──────────────────────────────────────────────────────

interface JustificativaModalProps {
  faseNome: string;
  onConfirm: (justificativa: string) => void;
  onCancel: () => void;
}

function JustificativaModal({ faseNome, onConfirm, onCancel }: JustificativaModalProps) {
  const [texto, setTexto] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleConfirm = () => {
    const v = texto.trim();
    if (!v) { inputRef.current?.focus(); return; }
    onConfirm(v);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle size={18} />
            <span className="font-semibold text-sm text-gray-800">Justificativa obrigatória</span>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 mb-3">
            A fase <strong>{faseNome}</strong> exige uma justificativa para mover a ordem.
          </p>
          <textarea
            ref={inputRef}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleConfirm(); }}
            placeholder="Descreva o motivo…"
            rows={3}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none placeholder:text-gray-400"
          />
          <p className="text-[11px] text-gray-400 mt-1">Ctrl+Enter para confirmar</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onCancel}
            className="h-8 px-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!texto.trim()}
            className="h-8 px-5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

interface CardProps {
  ordem: OrdemKanban;
  fase: Fase;
  onDragStart: (ordemId: string) => void;
}

function KanbanCard({ ordem, fase, onDragStart }: CardProps) {
  const overdue = isOverdue(ordem, fase);
  const dias = diasNaFase(ordem.dataInicio);

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(ordem.id);
      }}
      className={cn(
        'group bg-white border rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing',
        'hover:shadow-md transition-all select-none',
        overdue ? 'border-red-300' : 'border-gray-200',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical size={13} className="text-gray-300 shrink-0 group-hover:text-gray-400" />
          <span className="text-xs font-bold text-gray-700 truncate">{ordem.codigoOrdem}</span>
        </div>
        {overdue && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0">
            <AlertTriangle size={9} /> Atrasado
          </span>
        )}
      </div>

      {/* Product */}
      <div className="flex items-center gap-1.5 mb-2">
        <Package size={11} className="text-gray-400 shrink-0" />
        <span className="text-xs text-gray-700 truncate font-medium">{ordem.produtoNome}</span>
      </div>

      {/* Quantity + lot */}
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>Qtd: <strong className="text-gray-700">{ordem.quantidade.toLocaleString('pt-BR')}</strong></span>
        {ordem.loteNumero && (
          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">
            Lote {ordem.loteNumero}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={9} />
          Início: {fmtDate(ordem.dataInicio)}
        </span>
        <span className={cn(dias > 0 && overdue ? 'text-red-500 font-semibold' : '')}>
          {dias === 0 ? 'Hoje' : `${dias}d na fase`}
        </span>
      </div>

      {ordem.observacoes && (
        <p className="mt-1.5 text-[10px] text-gray-400 truncate" title={ordem.observacoes}>
          {ordem.observacoes}
        </p>
      )}
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface ColumnProps {
  fase: Fase;
  ordens: OrdemKanban[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent, faseId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, faseId: string) => void;
  onDragStart: (ordemId: string) => void;
}

function KanbanColumn({ fase, ordens, isDragOver, onDragOver, onDragLeave, onDrop, onDragStart }: ColumnProps) {
  const tipo = fase.tipoFase;
  const colors = TIPO_FASE_COLORS[tipo];
  const overdueCount = ordens.filter(o => isOverdue(o, fase)).length;

  return (
    <div className="flex flex-col shrink-0 w-72 h-full">
      {/* Column header */}
      <div className={cn('rounded-t-xl px-3 py-2.5', colors.header)}>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{fase.nome}</p>
            <p className="text-white/70 text-[10px]">{TIPO_FASE_LABEL[tipo]}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {overdueCount > 0 && (
              <span className="flex items-center gap-0.5 bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                <AlertTriangle size={9} /> {overdueCount}
              </span>
            )}
            <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {ordens.length}
            </span>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => onDragOver(e, fase.id)}
        onDragLeave={onDragLeave}
        onDrop={e => onDrop(e, fase.id)}
        className={cn(
          'flex-1 overflow-y-auto rounded-b-xl border-2 border-t-0 p-2 space-y-2 transition-colors',
          isDragOver
            ? 'border-blue-400 bg-blue-50/60'
            : 'border-gray-200 bg-gray-50',
        )}
      >
        {ordens.length === 0 && !isDragOver && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400">
            Sem ordens
          </div>
        )}
        {isDragOver && ordens.length === 0 && (
          <div className="flex items-center justify-center h-16 rounded-lg border-2 border-dashed border-blue-400 text-xs text-blue-500">
            Soltar aqui
          </div>
        )}
        {ordens.map(ordem => (
          <KanbanCard key={ordem.id} ordem={ordem} fase={fase} onDragStart={onDragStart} />
        ))}
        {isDragOver && ordens.length > 0 && (
          <div className="h-10 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center text-xs text-blue-500">
            Soltar aqui
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function KanbanPage() {
  const { showToast } = useToast();

  const [fases, setFases]   = useState<Fase[]>([]);
  const [ordens, setOrdens] = useState<OrdemKanban[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);

  const [pendingMove, setPendingMove] = useState<{
    ordemId: string;
    novaFaseId: string;
    faseNome: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [fasesRes, ordensRes] = await Promise.all([
        fetchWithAuth('/api/fases-producao'),
        fetchWithAuth('/api/ordens-producao'),
      ]);

      if (!fasesRes.ok || !ordensRes.ok) throw new Error('Erro ao carregar dados.');

      const fasesData: any[] = await fasesRes.json();
      const ordensData: any[] = await ordensRes.json();

      const fasesAtivas = fasesData
        .filter(f => f.ativo)
        .sort((a, b) => a.ordem - b.ordem)
        .map(f => ({
          id: f.id,
          nome: f.nome,
          ordem: f.ordem,
          tipoFase: (TIPO_FASE_ENUM[f.tipoFase as number] ?? 'Intermediaria') as TipoFase,
          tempoPadraoDias: f.tempoPadraoDias ?? 0,
          ativo: f.ativo,
        }));

      const ordensKanban: OrdemKanban[] = ordensData
        .filter((o: any) => o.status !== 'Finalizada' && o.status !== 'Cancelada')
        .map((o: any) => ({
          id: o.id,
          codigoOrdem: o.codigoOrdem,
          produtoNome: o.produtoNome ?? '—',
          quantidade: o.quantidade ?? 0,
          status: o.status ?? '',
          dataInicio: o.dataInicio,
          faseAtualId: o.faseAtualId,
          observacoes: o.observacoes ?? null,
          loteNumero: o.loteNumero ?? null,
        }));

      setFases(fasesAtivas);
      setOrdens(ordensKanban);
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const moverOrdem = async (ordemId: string, novaFaseId: string, justificativa?: string) => {
    setOrdens(prev => prev.map(o => o.id === ordemId ? { ...o, faseAtualId: novaFaseId } : o));

    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordemId}/fase/${novaFaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificativa: justificativa ?? null }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar fase.');
      showToast();
    } catch {
      load();
    }
  };

  const handleDragStart = (ordemId: string) => setDraggingId(ordemId);

  const handleDragOver = (e: React.DragEvent, faseId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(faseId);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (e: React.DragEvent, novaFaseId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggingId || !novaFaseId) { setDraggingId(null); return; }

    const ordem = ordens.find(o => o.id === draggingId);
    if (!ordem || ordem.faseAtualId === novaFaseId) { setDraggingId(null); return; }

    const novaFase = fases.find(f => f.id === novaFaseId);
    setDraggingId(null);

    if (novaFase && (novaFase.tipoFase === 'Pausa' || novaFase.tipoFase === 'Impedimento')) {
      setPendingMove({ ordemId: draggingId || ordem.id, novaFaseId, faseNome: novaFase.nome });
      return;
    }

    moverOrdem(ordem.id, novaFaseId);
  };

  const handleDragEnd = () => { setDraggingId(null); setDragOverId(null); };

  const ordensParaFase = (faseId: string) => ordens.filter(o => o.faseAtualId === faseId);

  const totalOrdens   = ordens.length;
  const totalAtrasadas = ordens.filter(o => {
    const fase = fases.find(f => f.id === o.faseAtualId);
    return fase ? isOverdue(o, fase) : false;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando Kanban…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
        <AlertTriangle size={28} className="text-red-400" />
        <p className="text-sm">{error}</p>
        <button onClick={load} className="text-xs text-blue-600 hover:underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white" onDragEnd={handleDragEnd}>

      {/* Breadcrumb */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Kanban</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            <strong className="text-gray-800 text-sm">{totalOrdens}</strong> ordem{totalOrdens !== 1 ? 's' : ''} ativas
          </span>
          {totalAtrasadas > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <AlertTriangle size={12} />
              {totalAtrasadas} atrasada{totalAtrasadas !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-gray-400">
            {fases.length} fase{fases.length !== 1 ? 's' : ''} cadastrada{fases.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-300 text-xs text-gray-600 hover:border-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={12} /> Atualizar
        </button>
      </div>

      {/* Kanban board */}
      {fases.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Package size={32} className="text-gray-300" />
          <p className="text-sm">Nenhuma fase de produção cadastrada.</p>
          <p className="text-xs text-gray-400">Cadastre as fases em <strong>Cadastros → Fases de Produção</strong>.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          <div className="flex gap-4 h-full" style={{ minWidth: `${fases.length * 296}px` }}>
            {fases.map(fase => (
              <KanbanColumn
                key={fase.id}
                fase={fase}
                ordens={ordensParaFase(fase.id)}
                isDragOver={dragOverId === fase.id}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Justification modal */}
      {pendingMove && (
        <JustificativaModal
          faseNome={pendingMove.faseNome}
          onConfirm={justificativa => {
            moverOrdem(pendingMove.ordemId, pendingMove.novaFaseId, justificativa);
            setPendingMove(null);
          }}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </div>
  );
}
