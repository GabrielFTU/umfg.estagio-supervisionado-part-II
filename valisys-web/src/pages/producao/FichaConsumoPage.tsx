import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader2, Plus, Trash2, Search, Edit2, Check, X,
  Home, ChevronRight, ChevronLeft, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Fase { id: string; nome: string; ordem: number }
interface Cor  { id: string; nome: string; codigoHex: string | null }

interface ProdutoOption {
  id: string; nome: string; codigo: string;
  unidadeMedidaSigla: string;
  variacoes: Cor[];
}

interface ConsumoItem {
  localId: string;
  id?: string;
  faseId: string;
  faseNome: string;
  produtoId: string;
  produtoNome: string;
  produtoCodigo: string;
  unidade: string;
  corId: string | null;
  corNome: string | null;
  quantidade: number;
  perdaPercentual: number;
  observacao: string;
  variacoes: Cor[];
}

interface FichaTecnica {
  id: string;
  produtoCodigo: string;
  produtoNome: string;
  codigo: string;
  versao: string;
  descricao: string | null;
  ativa: boolean;
  itens: {
    id: string;
    produtoComponenteId: string;
    produtoComponenteNome: string;
    produtoComponenteCodigo: string;
    unidadeMedida: string;
    quantidade: number;
    perdaPercentual: number;
    faseProducaoId: string | null;
    faseProducaoNome: string | null;
    corId: string | null;
    corNome: string | null;
    observacao: string | null;
  }[];
  sequencias: {
    id: string;
    faseProducaoId: string;
    faseProducaoNome: string;
    ordem: number;
  }[];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2);

// ─── SearchDropdown ───────────────────────────────────────────────────────────

function SearchDropdown<T extends { id: string; label: string; sub?: string }>({
  placeholder, onSelect, disabled, fetchItems,
}: {
  placeholder: string;
  onSelect: (item: T) => void;
  disabled?: boolean;
  fetchItems: (q: string) => Promise<T[]>;
}) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [open, setOpen]       = useState(false);
  const [busy, setBusy]       = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setBusy(true);
    try { setResults(await fetchItems(q)); } finally { setBusy(false); }
  }, [fetchItems]);

  useEffect(() => {
    const t = setTimeout(() => { if (open) search(query); }, 300);
    return () => clearTimeout(t);
  }, [query, open, search]);

  return (
    <div ref={wrapRef} className="relative">
      <div className={cn(
        'flex items-center gap-1.5 h-7 px-2 rounded border bg-white transition-colors',
        open ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-300 hover:border-gray-400',
        disabled && 'opacity-50 pointer-events-none',
      )}>
        <Search size={11} className="text-gray-400 shrink-0" />
        <input
          className="flex-1 text-xs outline-none bg-transparent placeholder:text-gray-400 text-gray-800 min-w-0"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
        />
        {busy && <Loader2 size={11} className="text-gray-400 animate-spin shrink-0" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-y-auto max-h-44">
            {results.map(r => (
              <button key={r.id} type="button"
                onClick={() => { onSelect(r); setQuery(''); setResults([]); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                <p className="text-xs font-medium text-gray-800">{r.label}</p>
                {r.sub && <p className="text-[10px] text-gray-500 mt-0.5">{r.sub}</p>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ItemRow ──────────────────────────────────────────────────────────────────

function ItemRow({
  item, fases, index, onSave, onRemove, readonly, startEditing,
}: {
  item: ConsumoItem;
  fases: Fase[];
  index: number;
  onSave: (updated: ConsumoItem) => void;
  onRemove: () => void;
  readonly: boolean;
  startEditing: boolean;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [draft, setDraft]     = useState<ConsumoItem>(item);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!draft.faseId)                                          e.fase = 'Obrigatório';
    if (!draft.produtoId)                                       e.produto = 'Obrigatório';
    if (!draft.quantidade || draft.quantidade <= 0)             e.quantidade = '> 0';
    if (draft.perdaPercentual < 0 || draft.perdaPercentual > 100) e.perda = '0–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirm = () => {
    if (!validate()) return;
    onSave(draft);
    setEditing(false);
  };

  const cancel = () => {
    if (!item.produtoId) { onRemove(); return; }
    setDraft(item);
    setErrors({});
    setEditing(false);
  };

  const token = localStorage.getItem('token');

  const fetchProdutos = useCallback(async (q: string) => {
    const res = await fetch(`/api/produtos?search=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data as ProdutoOption[]).slice(0, 10).map(p => ({
      id: p.id, label: p.nome, sub: p.codigo, variacoes: p.variacoes, unidade: p.unidadeMedidaSigla,
    }));
  }, [token]);

  const isEven = index % 2 === 0;

  if (!editing) {
    return (
      <tr className={cn(
        'border-b border-gray-100 hover:bg-blue-50/40 transition-colors group',
        isEven ? 'bg-white' : 'bg-gray-50/60',
      )}>
        <td className="py-2.5 pl-4 pr-3 text-xs text-gray-600 whitespace-nowrap">{item.faseNome || <span className="text-gray-300">—</span>}</td>
        <td className="py-2.5 pr-3">
          <p className="text-xs font-medium text-gray-800 leading-snug">{item.produtoNome}</p>
          <p className="text-[10px] text-gray-400 font-mono">{item.produtoCodigo}</p>
        </td>
        <td className="py-2.5 pr-3 text-xs text-gray-600">
          {item.corNome ?? <span className="text-gray-300">—</span>}
        </td>
        <td className="py-2.5 pr-3 text-xs text-gray-700 text-right tabular-nums font-medium">
          {item.quantidade} <span className="text-gray-400 font-normal">{item.unidade}</span>
        </td>
        <td className="py-2.5 pr-3 text-xs text-gray-600 text-right tabular-nums">
          {item.perdaPercentual > 0 ? `${item.perdaPercentual}%` : <span className="text-gray-300">—</span>}
        </td>
        <td className="py-2.5 pr-3 text-xs text-gray-500 max-w-[140px] truncate">
          {item.observacao || <span className="text-gray-300">—</span>}
        </td>
        {!readonly && (
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
        )}
      </tr>
    );
  }

  return (
    <tr className="border-b border-blue-200 bg-blue-50/60">
      {/* Fase */}
      <td className="py-2 pl-4 pr-2 align-top w-36">
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

      {/* Produto */}
      <td className="py-2 pr-2 align-top min-w-[200px]">
        <SearchDropdown
          placeholder="Buscar produto…"
          fetchItems={fetchProdutos as any}
          onSelect={(r: any) => setDraft(d => ({
            ...d,
            produtoId: r.id,
            produtoNome: r.label,
            produtoCodigo: r.sub ?? '',
            unidade: r.unidade ?? '',
            variacoes: r.variacoes ?? [],
            corId: null, corNome: null,
          }))}
        />
        {errors.produto && <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.produto}</p>}
        {draft.produtoNome && (
          <p className="text-[10px] text-blue-700 font-medium mt-0.5 truncate">{draft.produtoNome}</p>
        )}
      </td>

      {/* Cor */}
      <td className="py-2 pr-2 align-top w-32">
        {draft.variacoes.length > 0 ? (
          <select
            value={draft.corId ?? ''}
            onChange={e => {
              const cor = draft.variacoes.find(v => v.id === e.target.value);
              setDraft(d => ({ ...d, corId: cor?.id ?? null, corNome: cor?.nome ?? null }));
            }}
            className="w-full h-7 text-xs border border-gray-300 rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200">
            <option value="">Sem cor</option>
            {draft.variacoes.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        ) : (
          <span className="text-xs text-gray-400 h-7 flex items-center">—</span>
        )}
      </td>

      {/* Quantidade */}
      <td className="py-2 pr-2 align-top w-28">
        <input
          type="number" min="0.0001" step="0.001"
          value={draft.quantidade || ''}
          onChange={e => setDraft(d => ({ ...d, quantidade: parseFloat(e.target.value) || 0 }))}
          className={cn(
            'w-full h-7 text-xs border rounded px-1.5 text-right bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200',
            errors.quantidade ? 'border-red-400 bg-red-50' : 'border-gray-300',
          )}
        />
        {errors.quantidade && <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.quantidade}</p>}
      </td>

      {/* Perda */}
      <td className="py-2 pr-2 align-top w-24">
        <div className="flex items-center gap-1">
          <input
            type="number" min="0" max="100" step="0.1"
            value={draft.perdaPercentual || ''}
            onChange={e => setDraft(d => ({ ...d, perdaPercentual: parseFloat(e.target.value) || 0 }))}
            className={cn(
              'w-full h-7 text-xs border rounded px-1.5 text-right bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200',
              errors.perda ? 'border-red-400 bg-red-50' : 'border-gray-300',
            )}
          />
          <span className="text-xs text-gray-500 shrink-0">%</span>
        </div>
        {errors.perda && <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{errors.perda}</p>}
      </td>

      {/* Observação */}
      <td className="py-2 pr-2 align-top min-w-[120px]">
        <input
          type="text" maxLength={500}
          value={draft.observacao}
          onChange={e => setDraft(d => ({ ...d, observacao: e.target.value }))}
          className="w-full h-7 text-xs border border-gray-300 rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          placeholder="Opcional…"
        />
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

export function FichaConsumoPage() {
  const { id }        = useParams<{ id: string }>();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [ficha, setFicha]     = useState<FichaTecnica | null>(null);
  const [fases, setFases]     = useState<Fase[]>([]);
  const [itens, setItens]     = useState<ConsumoItem[]>([]);
  const [semSequencia, setSemSequencia] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(''); setSemSequencia(false);
    const token = localStorage.getItem('token');
    try {
      const rFicha = await fetch(`/api/fichas-tecnicas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!rFicha.ok) throw new Error();
      const fichaData: FichaTecnica = await rFicha.json();

      if (!fichaData.sequencias || fichaData.sequencias.length === 0) {
        setFicha(fichaData);
        setSemSequencia(true);
        return;
      }

      const fasesUnicas = fichaData.sequencias
        .reduce<Fase[]>((acc, s) => {
          if (!acc.find(f => f.id === s.faseProducaoId))
            acc.push({ id: s.faseProducaoId, nome: s.faseProducaoNome, ordem: s.ordem });
          return acc;
        }, [])
        .sort((a, b) => a.ordem - b.ordem);

      setFicha(fichaData);
      setFases(fasesUnicas);
      setItens(fichaData.itens.map(i => ({
        localId: uid(),
        id: i.id,
        faseId: i.faseProducaoId ?? '',
        faseNome: i.faseProducaoNome ?? '',
        produtoId: i.produtoComponenteId,
        produtoNome: i.produtoComponenteNome,
        produtoCodigo: i.produtoComponenteCodigo,
        unidade: i.unidadeMedida,
        corId: i.corId,
        corNome: i.corNome,
        quantidade: i.quantidade,
        perdaPercentual: i.perdaPercentual,
        observacao: i.observacao ?? '',
        variacoes: [],
      })));
    } catch { setError('Não foi possível carregar a ficha técnica.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddRow = () => {
    setItens(prev => [...prev, {
      localId: uid(), faseId: '', faseNome: '',
      produtoId: '', produtoNome: '', produtoCodigo: '', unidade: '',
      corId: null, corNome: null, quantidade: 1, perdaPercentual: 0,
      observacao: '', variacoes: [],
    }]);
  };

  const handleSaveRow = (localId: string, updated: ConsumoItem) => {
    setItens(prev => prev.map(i => i.localId === localId ? { ...updated, localId } : i));
  };

  const handleRemoveRow = (localId: string) => {
    setItens(prev => prev.filter(i => i.localId !== localId));
  };

  const handleSave = async () => {
    if (!ficha) return;
    const incomplete = itens.find(i => !i.produtoId);
    if (incomplete) { alert('Existe um item sem produto selecionado. Confirme ou remova-o antes de salvar.'); return; }

    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const payload = {
        id: ficha.id,
        codigo: ficha.codigo,
        versao: ficha.versao,
        descricao: ficha.descricao,
        ativa: ficha.ativa,
        itens: itens.map(i => ({
          produtoComponenteId: i.produtoId,
          quantidade: i.quantidade,
          perdaPercentual: i.perdaPercentual,
          faseProducaoId: i.faseId || null,
          corId: i.corId || null,
          observacao: i.observacao || null,
        })),
        sequencias: null,
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

      showToast('Ficha de consumo salva com sucesso');
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
      <button onClick={() => navigate('/producao/fichas-tecnicas')}
        className="text-xs text-blue-600 hover:underline font-medium">Voltar</button>
    </div>
  );

  if (semSequencia) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
        <X size={22} className="text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">Produto sem sequência de produção</p>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Configure a sequência operacional antes de definir o consumo de materiais.
        </p>
      </div>
      <button
        onClick={() => navigate(`/producao/fichas-tecnicas/${id}/sequencia-operacional`)}
        className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors">
        Configurar sequência
      </button>
      <button onClick={() => navigate(`/producao/fichas-tecnicas/${id}`)}
        className="text-xs text-gray-500 hover:text-gray-700 hover:underline">
        Voltar ao painel
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <button onClick={() => navigate('/producao/fichas-tecnicas')}
            className="hover:text-gray-700 transition-colors">Ficha Técnica</button>
          <ChevronRight size={11} />
          <button onClick={() => navigate(`/producao/fichas-tecnicas/${id}`)}
            className="hover:text-gray-700 transition-colors">Painel</button>
          <ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Ficha de Consumo</span>
        </div>
      </div>

      {/* Subheader */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-700">
          {ficha.produtoNome}
          <span className="ml-2 text-xs font-normal text-gray-400">{ficha.codigo}</span>
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/producao/fichas-tecnicas/${id}`)}
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
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pl-4 pr-3 w-36">Fase <span className="text-red-400">*</span></th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3">Produto <span className="text-red-400">*</span></th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3 w-32">Cor</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3 w-28">Qtd. <span className="text-red-400">*</span></th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3 w-24">Perda %</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-3 w-36">Observação</th>
                <th className="w-16 pr-3" />
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <p className="text-sm text-gray-400">Nenhum componente adicionado.</p>
                    <p className="text-xs text-gray-300 mt-1">Clique em "Adicionar item" para começar.</p>
                  </td>
                </tr>
              )}
              {itens.map((item, idx) => (
                <ItemRow
                  key={item.localId}
                  item={item}
                  fases={fases}
                  index={idx}
                  onSave={updated => handleSaveRow(item.localId, updated)}
                  onRemove={() => handleRemoveRow(item.localId)}
                  readonly={false}
                  startEditing={!item.produtoId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-4 flex items-center justify-between">
        <span className="text-xs text-gray-400 pl-1">
          {itens.filter(i => i.produtoId).length} {itens.filter(i => i.produtoId).length === 1 ? 'componente' : 'componentes'}
        </span>
        <button
          onClick={handleAddRow}
          className="flex items-center gap-1.5 h-8 px-4 rounded-lg border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
          <Plus size={13} /> Adicionar item
        </button>
      </div>
    </div>
  );
}
