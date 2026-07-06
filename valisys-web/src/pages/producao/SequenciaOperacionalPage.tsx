import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader2, Plus, Trash2, Edit2, Check, X,
  Home, ChevronRight, ChevronLeft, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Fase { id: string; nome: string; ordem: number }

interface SeqItem {
  localId: string;
  id?: string;
  faseId: string;
  faseNome: string;
  ordem: number;
  descricao: string;
  observacao: string;
  tempoEstimadoDias: number;
}

interface FichaTecnica {
  id: string;
  produtoCodigo: string;
  produtoNome: string;
  codigo: string;
  versao: string;
  descricao: string | null;
  ativa: boolean;
  sequencias: {
    id: string;
    faseProducaoId: string;
    faseProducaoNome: string;
    ordem: number;
    descricao: string;
    observacao: string | null;
    tempoEstimadoDias: number;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2);

// ─── SeqRow ───────────────────────────────────────────────────────────────────

function SeqRow({
  item, fases, index, onSave, onRemove,
}: {
  item: SeqItem;
  fases: Fase[];
  index: number;
  onSave: (updated: SeqItem) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(!item.faseId);
  const [draft, setDraft]     = useState<SeqItem>(item);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!draft.faseId)             e.fase = 'Obrigatório';
    if (!draft.descricao.trim())   e.descricao = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirm = () => {
    if (!validate()) return;
    onSave({ ...draft });
    setEditing(false);
  };

  const cancel = () => {
    if (!item.faseId) { onRemove(); return; }
    setDraft(item); setErrors({}); setEditing(false);
  };

  const isEven = index % 2 === 0;

  if (!editing) return (
    <tr className={cn(
      'border-b border-gray-100 hover:bg-blue-50/40 transition-colors group',
      isEven ? 'bg-white' : 'bg-gray-50/60',
    )}>
      <td className="py-2.5 pl-4 pr-3 text-center w-16">
        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center mx-auto">
          {item.ordem}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-xs text-gray-600 whitespace-nowrap w-40">{item.faseNome}</td>
      <td className="py-2.5 pr-3 text-xs font-medium text-gray-800">{item.descricao}</td>
      <td className="py-2.5 pr-3 text-xs text-gray-500 max-w-[160px] truncate">
        {item.observacao || <span className="text-gray-300">—</span>}
      </td>
      <td className="py-2.5 pr-3 text-xs text-gray-600 text-center tabular-nums w-24">
        {item.tempoEstimadoDias > 0 ? `${item.tempoEstimadoDias}d` : <span className="text-gray-300">—</span>}
      </td>
      <td className="py-2.5 pr-3 text-right w-16">
        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)}
            className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition-colors">
            <Edit2 size={12} />
          </button>
          <button onClick={onRemove}
            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <tr className="border-b border-blue-200 bg-blue-50/60">
      {/* Ordem */}
      <td className="py-2 pl-4 pr-2 align-top w-16">
        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mx-auto">
          {index + 1}
        </span>
      </td>

      {/* Fase */}
      <td className="py-2 pr-2 align-top w-40">
        <select
          value={draft.faseId}
          onChange={e => {
            const fase = fases.find(f => f.id === e.target.value);
            setDraft(d => ({ ...d, faseId: e.target.value, faseNome: fase?.nome ?? '' }));
          }}
          className={cn(
            'w-full h-7 text-xs border rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200',
            errors.fase ? 'border-red-400 bg-red-50' : 'border-gray-300',
          )}>
          <option value="">Selecione…</option>
          {fases.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        {errors.fase && <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.fase}</p>}
      </td>

      {/* Descrição */}
      <td className="py-2 pr-2 align-top">
        <input
          type="text" maxLength={500}
          value={draft.descricao}
          onChange={e => setDraft(d => ({ ...d, descricao: e.target.value }))}
          placeholder="Descrição da operação…"
          className={cn(
            'w-full h-7 text-xs border rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200',
            errors.descricao ? 'border-red-400 bg-red-50' : 'border-gray-300',
          )}
        />
        {errors.descricao && <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.descricao}</p>}
      </td>

      {/* Observação */}
      <td className="py-2 pr-2 align-top">
        <input
          type="text" maxLength={500}
          value={draft.observacao}
          onChange={e => setDraft(d => ({ ...d, observacao: e.target.value }))}
          placeholder="Opcional…"
          className="w-full h-7 text-xs border border-gray-300 rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
        />
      </td>

      {/* Tempo */}
      <td className="py-2 pr-2 align-top w-24">
        <div className="flex items-center gap-1">
          <input
            type="number" min="0"
            value={draft.tempoEstimadoDias || ''}
            onChange={e => setDraft(d => ({ ...d, tempoEstimadoDias: parseInt(e.target.value) || 0 }))}
            className="w-full h-7 text-xs border border-gray-300 rounded px-1.5 text-right bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
          <span className="text-xs text-gray-500 shrink-0">d</span>
        </div>
      </td>

      {/* Ações */}
      <td className="py-2 pr-3 align-top w-16">
        <div className="flex items-center gap-0.5 pt-0.5">
          <button onClick={confirm}
            className="p-1.5 rounded text-emerald-700 hover:bg-emerald-100 transition-colors" title="Confirmar">
            <Check size={14} />
          </button>
          <button onClick={cancel}
            className="p-1.5 rounded text-gray-500 hover:bg-gray-200 transition-colors" title="Cancelar">
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SequenciaOperacionalPage() {
  const { id }        = useParams<{ id: string }>();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [ficha, setFicha]     = useState<FichaTecnica | null>(null);
  const [fases, setFases]     = useState<Fase[]>([]);
  const [itens, setItens]     = useState<SeqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    try {
      const [rFicha, rFases] = await Promise.all([
        fetch(`/api/fichas-tecnicas/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/fases-producao', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!rFicha.ok) throw new Error();
      const fichaData: FichaTecnica = await rFicha.json();
      const fasesData: Fase[] = rFases.ok ? await rFases.json() : [];

      setFicha(fichaData);
      setFases(fasesData.sort((a, b) => a.ordem - b.ordem));
      setItens((fichaData.sequencias ?? [])
        .sort((a, b) => a.ordem - b.ordem)
        .map(s => ({
          localId: uid(),
          id: s.id,
          faseId: s.faseProducaoId,
          faseNome: s.faseProducaoNome,
          ordem: s.ordem,
          descricao: s.descricao,
          observacao: s.observacao ?? '',
          tempoEstimadoDias: s.tempoEstimadoDias,
        })));
    } catch { setError('Não foi possível carregar a ficha técnica.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddRow = () => {
    setItens(prev => [...prev, {
      localId: uid(), faseId: '', faseNome: '',
      ordem: prev.length + 1, descricao: '', observacao: '', tempoEstimadoDias: 0,
    }]);
  };

  const handleSaveRow = (localId: string, updated: SeqItem) => {
    setItens(prev => prev.map((item, idx) =>
      item.localId === localId ? { ...updated, localId, ordem: idx + 1 } : item,
    ));
  };

  const handleRemoveRow = (localId: string) => {
    setItens(prev => prev.filter(i => i.localId !== localId).map((item, idx) => ({ ...item, ordem: idx + 1 })));
  };

  const handleSave = async () => {
    if (!ficha) return;
    const incomplete = itens.find(i => !i.faseId || !i.descricao.trim());
    if (incomplete) { alert('Existe uma etapa incompleta. Confirme ou remova-a antes de salvar.'); return; }

    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const payload = {
        id: ficha.id,
        codigo: ficha.codigo,
        versao: ficha.versao,
        descricao: ficha.descricao,
        ativa: ficha.ativa,
        itens: null,
        sequencias: itens.map((s, idx) => ({
          faseProducaoId: s.faseId,
          ordem: idx + 1,
          descricao: s.descricao,
          observacao: s.observacao || null,
          tempoEstimadoDias: s.tempoEstimadoDias,
        })),
      };

      const res = await fetch(`/api/fichas-tecnicas/${ficha.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? 'Erro ao salvar.');
      }

      showToast('Sequência operacional salva com sucesso');
      load();
    } catch (e: any) {
      alert(e.message ?? 'Erro inesperado.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full gap-2 text-gray-600 text-sm">
      <Loader2 size={16} className="animate-spin" /> Carregando…
    </div>
  );

  if (error || !ficha) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      <p className="text-sm text-red-600 font-medium">{error || 'Ficha técnica não encontrada.'}</p>
      <button onClick={() => navigate('/engenharia/fichas-tecnicas')}
        className="text-xs text-blue-600 hover:underline font-medium">Voltar</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <button onClick={() => navigate('/engenharia/fichas-tecnicas')}
            className="hover:text-gray-700 transition-colors">Ficha Técnica</button>
          <ChevronRight size={11} />
          <button onClick={() => navigate(`/engenharia/fichas-tecnicas/${id}`)}
            className="hover:text-gray-700 transition-colors">Painel</button>
          <ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Sequência Operacional</span>
        </div>
      </div>

      {/* Subheader */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-700">
          {ficha.produtoNome}
          <span className="ml-2 text-xs font-normal text-gray-400">{ficha.codigo}</span>
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/engenharia/fichas-tecnicas/${id}`)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            <ChevronLeft size={13} /> Voltar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salvar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pl-4 pr-3 w-16">#</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3 w-40">Fase <span className="text-red-400">*</span></th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3">Descrição <span className="text-red-400">*</span></th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3 w-40">Observação</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3 w-24">Tempo</th>
                <th className="w-16 pr-3" />
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <p className="text-sm text-gray-400">Nenhuma etapa adicionada.</p>
                    <p className="text-xs text-gray-300 mt-1">Clique em "Adicionar etapa" para começar.</p>
                  </td>
                </tr>
              )}
              {itens.map((item, idx) => (
                <SeqRow
                  key={item.localId}
                  item={item}
                  index={idx}
                  fases={fases}
                  onSave={updated => handleSaveRow(item.localId, updated)}
                  onRemove={() => handleRemoveRow(item.localId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-4 flex items-center justify-between">
        <span className="text-xs text-gray-400 pl-1">
          {itens.filter(i => i.faseId).length} {itens.filter(i => i.faseId).length === 1 ? 'etapa' : 'etapas'}
        </span>
        <button
          onClick={handleAddRow}
          className="flex items-center gap-1.5 h-8 px-4 rounded-lg border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <Plus size={13} /> Adicionar etapa
        </button>
      </div>
    </div>
  );
}
