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
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
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
      <div className="flex items-center gap-2 border-b border-gray-300 focus-within:border-blue-500 pb-1">
        <Search size={13} className="text-gray-400 shrink-0" />
        <input
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-300 text-gray-800"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
        />
        {busy && <Loader2 size={13} className="text-gray-400 animate-spin shrink-0" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-y-auto max-h-48">
            {results.map(r => (
              <button key={r.id} type="button"
                onClick={() => { onSelect(r); setQuery(''); setResults([]); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-800">{r.label}</p>
                {r.sub && <p className="text-[11px] text-gray-500">{r.sub}</p>}
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
  item, fases, onSave, onRemove, readonly,
}: {
  item: ConsumoItem;
  fases: Fase[];
  onSave: (updated: ConsumoItem) => void;
  onRemove: () => void;
  readonly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<ConsumoItem>(item);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!draft.faseId) e.fase = 'Fase é obrigatória';
    if (!draft.produtoId) e.produto = 'Produto é obrigatório';
    if (!draft.quantidade || draft.quantidade <= 0) e.quantidade = 'Deve ser > 0';
    if (draft.perdaPercentual < 0 || draft.perdaPercentual > 100) e.perda = '0–100%';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirm = () => {
    if (!validate()) return;
    onSave(draft);
    setEditing(false);
  };

  const cancel = () => {
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

  if (!editing) {
    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
        <td className="py-3 pl-4 pr-2 text-xs text-gray-600">{item.faseNome || '—'}</td>
        <td className="py-3 pr-2">
          <div>
            <p className="text-sm text-gray-800">{item.produtoNome}</p>
            <p className="text-[11px] text-gray-500">{item.produtoCodigo}</p>
          </div>
        </td>
        <td className="py-3 pr-2 text-sm text-gray-700">
          {item.corNome
            ? <span className="flex items-center gap-1.5">
                {item.corNome}
              </span>
            : <span className="text-gray-400">—</span>
          }
        </td>
        <td className="py-3 pr-2 text-sm text-gray-700 text-right tabular-nums">
          {item.quantidade} {item.unidade}
        </td>
        <td className="py-3 pr-2 text-sm text-gray-700 text-right tabular-nums">
          {item.perdaPercentual > 0 ? `${item.perdaPercentual}%` : '—'}
        </td>
        <td className="py-3 pr-2 text-sm text-gray-600 max-w-[120px] truncate">{item.observacao || '—'}</td>
        {!readonly && (
          <td className="py-3 pr-3 text-right">
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(true)}
                className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Edit2 size={13} />
              </button>
              <button onClick={onRemove}
                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  }

  return (
    <tr className="border-b border-blue-100 bg-blue-50/40">
      <td className="py-2 pl-4 pr-2 align-top">
        <div>
          <select
            value={draft.faseId}
            onChange={e => {
              const fase = fases.find(f => f.id === e.target.value);
              setDraft(d => ({ ...d, faseId: e.target.value, faseNome: fase?.nome ?? '' }));
            }}
            className={cn(
              'w-full text-xs border rounded px-1.5 py-1 bg-white outline-none focus:border-blue-500',
              errors.fase ? 'border-red-400' : 'border-gray-300',
            )}>
            <option value="">Selecione…</option>
            {fases.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {errors.fase && <p className="text-[10px] text-red-500 mt-0.5">{errors.fase}</p>}
        </div>
      </td>
      <td className="py-2 pr-2 align-top min-w-[180px]">
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
        {errors.produto && <p className="text-[10px] text-red-500 mt-0.5">{errors.produto}</p>}
        {draft.produtoNome && (
          <p className="text-[11px] text-gray-500 mt-0.5">{draft.produtoCodigo}</p>
        )}
      </td>
      <td className="py-2 pr-2 align-top">
        {draft.variacoes.length > 0 ? (
          <select
            value={draft.corId ?? ''}
            onChange={e => {
              const cor = draft.variacoes.find(v => v.id === e.target.value);
              setDraft(d => ({ ...d, corId: cor?.id ?? null, corNome: cor?.nome ?? null }));
            }}
            className="w-full text-xs border border-gray-300 rounded px-1.5 py-1 bg-white outline-none focus:border-blue-500">
            <option value="">Sem cor</option>
            {draft.variacoes.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="py-2 pr-2 align-top">
        <div>
          <input
            type="number" min="0.0001" step="0.001"
            value={draft.quantidade || ''}
            onChange={e => setDraft(d => ({ ...d, quantidade: parseFloat(e.target.value) || 0 }))}
            className={cn(
              'w-20 text-xs border rounded px-1.5 py-1 text-right bg-white outline-none focus:border-blue-500',
              errors.quantidade ? 'border-red-400' : 'border-gray-300',
            )}
          />
          {errors.quantidade && <p className="text-[10px] text-red-500 mt-0.5">{errors.quantidade}</p>}
        </div>
      </td>
      <td className="py-2 pr-2 align-top">
        <div>
          <div className="flex items-center gap-0.5">
            <input
              type="number" min="0" max="100" step="0.1"
              value={draft.perdaPercentual || ''}
              onChange={e => setDraft(d => ({ ...d, perdaPercentual: parseFloat(e.target.value) || 0 }))}
              className={cn(
                'w-16 text-xs border rounded px-1.5 py-1 text-right bg-white outline-none focus:border-blue-500',
                errors.perda ? 'border-red-400' : 'border-gray-300',
              )}
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
          {errors.perda && <p className="text-[10px] text-red-500 mt-0.5">{errors.perda}</p>}
        </div>
      </td>
      <td className="py-2 pr-2 align-top">
        <input
          type="text" maxLength={500}
          value={draft.observacao}
          onChange={e => setDraft(d => ({ ...d, observacao: e.target.value }))}
          className="w-full text-xs border border-gray-300 rounded px-1.5 py-1 bg-white outline-none focus:border-blue-500"
          placeholder="Obs…"
        />
      </td>
      <td className="py-2 pr-3 align-top">
        <div className="flex items-center gap-1">
          <button onClick={confirm}
            className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors">
            <Check size={14} />
          </button>
          <button onClick={cancel}
            className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition-colors">
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
      <button onClick={() => navigate(`/producao/fichas-tecnicas`)}
        className="text-xs text-blue-600 hover:underline font-medium">Voltar</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200">
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
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">{ficha.produtoCodigo} — {ficha.produtoNome}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ficha {ficha.codigo} · v{ficha.versao}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/producao/fichas-tecnicas/${id}`)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <ChevronLeft size={13} /> Voltar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salvar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 sticky top-0">
              <th className="text-left text-xs font-semibold text-gray-600 py-3 pl-4 pr-2 w-36">Fase *</th>
              <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-2">Produto *</th>
              <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-2 w-32">Cor</th>
              <th className="text-right text-xs font-semibold text-gray-600 py-3 pr-2 w-28">Quantidade *</th>
              <th className="text-right text-xs font-semibold text-gray-600 py-3 pr-2 w-24">Perda %</th>
              <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-2 w-32">Observação</th>
              <th className="w-16 pr-3" />
            </tr>
          </thead>
          <tbody>
            {itens.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                  Nenhum item adicionado. Clique em "Adicionar item" para começar.
                </td>
              </tr>
            )}
            {itens.map(item => (
              <ItemRow
                key={item.localId}
                item={item}
                fases={fases}
                onSave={updated => handleSaveRow(item.localId, updated)}
                onRemove={() => handleRemoveRow(item.localId)}
                readonly={false}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {itens.length} {itens.length === 1 ? 'item' : 'itens'}
        </span>
        <button
          onClick={handleAddRow}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-gray-400 text-xs font-medium text-gray-600 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
          <Plus size={13} /> Adicionar item
        </button>
      </div>
    </div>
  );
}
