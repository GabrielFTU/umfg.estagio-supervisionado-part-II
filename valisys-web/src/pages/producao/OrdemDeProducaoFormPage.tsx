import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWithAuth } from '@/services/api';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Home, ChevronRight, Loader2, AlertTriangle, X,
  Search, Check, ChevronDown, MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Modo = 'criar' | 'editar' | 'visualizar';

interface ProdutoOption {
  id: string;
  codigo: string;
  nome: string;
  unidadeSigla: string;
  ativo: boolean;
  controlaLote: boolean;
}

interface VariacaoOption { id: string; nome: string; codigoHex?: string }
interface TipoOrdemOption { id: string; nome: string }
interface LoteOption { id: string; numero: string; produtoId?: string }
interface AlmoxarifadoOption { id: string; nome: string }
interface RoteiroOption { id: string; label: string; produtoId: string }

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Ativa',      color: 'text-green-600 bg-green-50 border-green-200' },
  2: { label: 'Aguardando', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  3: { label: 'Finalizada', color: 'text-blue-600 bg-blue-50 border-blue-200'   },
  4: { label: 'Cancelada',  color: 'text-red-500 bg-red-50 border-red-200'      },
};

interface FormState {
  produtoId: string;
  produtoVariacaoId: string;
  tipoOrdemDeProducaoId: string;
  almoxarifadoId: string;
  roteiroProducaoId: string;
  loteId: string;
  quantidade: string;
  status: number;
  observacoes: string;
}

interface FormErrors {
  produtoId?: string;
  produtoVariacaoId?: string;
  tipoOrdemDeProducaoId?: string;
  almoxarifadoId?: string;
  loteId?: string;
  quantidade?: string;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const uInput = 'w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300';

// ─── UField ───────────────────────────────────────────────────────────────────

function UField({ label, required, error, children, readOnly }: {
  label: string; required?: boolean; error?: string;
  children: React.ReactNode; readOnly?: boolean;
}) {
  return (
    <div className={cn(
      'border-b py-3 transition-colors',
      readOnly ? 'border-gray-100' :
        error ? 'border-red-300 focus-within:border-red-400' :
          'border-gray-200 focus-within:border-gray-500',
    )}>
      <label className="block text-xs text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 inline-block" />{error}
        </p>
      )}
    </div>
  );
}

// ─── SelectDropdown ───────────────────────────────────────────────────────────

function SelectDropdown({ value, onChange, options, readOnly, placeholder, searchable }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  readOnly?: boolean;
  placeholder?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQ('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = searchable && q
    ? options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && setOpen(v => !v)}
        className="w-full flex items-center justify-between outline-none"
      >
        <span className={cn('text-sm', selected ? 'text-gray-800' : 'text-gray-300')}>
          {selected?.label ?? placeholder ?? ''}
        </span>
        {!readOnly && (
          <ChevronDown size={14} className={cn('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
        )}
      </button>

      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Buscar…"
                  className="w-full h-8 pl-8 pr-2 text-xs border border-gray-200 rounded-md outline-none focus:border-gray-400 placeholder:text-gray-300"
                />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">Nenhum resultado</div>
            )}
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50',
                  o.value === value && 'bg-gray-50',
                )}
              >
                <span className={o.value === value ? 'text-gray-800 font-medium' : 'text-gray-600'}>
                  {o.label}
                </span>
                {o.value === value && <Check size={13} className="text-blue-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ProdutoSelector ──────────────────────────────────────────────────────────

function ProdutoSelector({ value, options, onChange, error, readOnly }: {
  value: string;
  options: ProdutoOption[];
  onChange: (id: string, p: ProdutoOption | null) => void;
  error?: string;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = options.find(p => p.id === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQ('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = options
    .filter(p => p.ativo)
    .filter(p => !q ||
      p.nome.toLowerCase().includes(q.toLowerCase()) ||
      p.codigo.toLowerCase().includes(q.toLowerCase())
    );

  return (
    <UField label="Produto" required={!readOnly} error={error} readOnly={readOnly}>
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && setOpen(v => !v)}
          className="w-full flex items-center justify-between outline-none"
        >
          <span className={cn('text-sm flex-1 text-left truncate', selected ? 'text-gray-800' : 'text-gray-300')}>
            {selected ? `${selected.codigo} - ${selected.nome}` : 'Selecionar produto…'}
          </span>
          {!readOnly && (
            <div className="flex items-center gap-2.5 shrink-0 ml-2">
              {selected && (
                <span
                  role="button"
                  onClick={e => { e.stopPropagation(); onChange('', null); }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer leading-none"
                >
                  <X size={13} />
                </span>
              )}
              <ChevronDown size={14} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
            </div>
          )}
        </button>

        {open && (
          <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Buscar por nome ou código…"
                  className="w-full h-8 pl-8 pr-2 text-xs border border-gray-200 rounded-md outline-none focus:border-gray-400 placeholder:text-gray-300"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-400 text-center">Nenhum produto encontrado</div>
              )}
              {filtered.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p.id, p); setOpen(false); setQ(''); }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-gray-50',
                    p.id === value && 'bg-gray-50',
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">{p.codigo} - {p.nome}</p>
                    <p className="text-xs text-gray-400">{p.unidadeSigla}</p>
                  </div>
                  {p.id === value && <Check size={13} className="text-blue-500 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </UField>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────────────────

function FAB({ onSalvar, onCancelar, saving, readOnly }: {
  onSalvar: () => void;
  onCancelar: () => void;
  saving: boolean;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[140px] mb-1.5">
          {!readOnly && (
            <button
              onClick={() => { setOpen(false); onSalvar(); }}
              disabled={saving}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Salvar
            </button>
          )}
          <div className="my-0.5 mx-3 border-t border-gray-100" />
          <button
            onClick={() => { setOpen(false); onCancelar(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {readOnly ? 'Voltar' : 'Cancelar'}
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-12 h-12 rounded-full shadow-lg text-white flex items-center justify-center transition-colors',
          open ? 'bg-gray-800' : 'bg-gray-700 hover:bg-gray-800',
        )}
      >
        <MoreVertical size={20} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function OrdemDeProducaoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const modo: Modo = !id ? 'criar'
    : window.location.pathname.endsWith('/editar') ? 'editar'
      : 'visualizar';
  const readOnly = modo === 'visualizar';

  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const [produtos, setProdutos]           = useState<ProdutoOption[]>([]);
  const [tiposOrdem, setTiposOrdem]       = useState<TipoOrdemOption[]>([]);
  const [lotes, setLotes]                 = useState<LoteOption[]>([]);
  const [almoxarifados, setAlmoxarifados] = useState<AlmoxarifadoOption[]>([]);
  const [roteiros, setRoteiros]           = useState<RoteiroOption[]>([]);

  const [selectedProduto, setSelectedProduto] = useState<ProdutoOption | null>(null);
  const [variacoes, setVariacoes]       = useState<VariacaoOption[]>([]);
  const [loadingVar, setLoadingVar]     = useState(false);

  const [codigoOrdem, setCodigoOrdem]   = useState('');
  const [faseAtualNome, setFaseAtualNome] = useState('');
  const [dataInicio, setDataInicio]     = useState('');
  const [dataFim, setDataFim]           = useState('');

  const [form, setForm] = useState<FormState>({
    produtoId: '',
    produtoVariacaoId: '',
    tipoOrdemDeProducaoId: '',
    almoxarifadoId: '',
    roteiroProducaoId: '',
    loteId: '',
    quantidade: '1',
    status: 1,
    observacoes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = (f: keyof FormState, v: string | number) => {
    setForm(prev => ({ ...prev, [f]: v }));
    setErrors(prev => ({ ...prev, [f]: undefined }));
  };

  const loadRefs = useCallback(async () => {
    setLoadingRefs(true);
    try {
      const [resProdutos, resAlmox, resTipos, resLotes, resRoteiros] = await Promise.allSettled([
        fetchWithAuth('/api/produtos'),
        fetchWithAuth('/api/almoxarifados'),
        fetchWithAuth('/api/tipos-ordem-producao'),
        fetchWithAuth('/api/lotes'),
        fetchWithAuth('/api/roteiros-producao'),
      ]);

      if (resProdutos.status === 'fulfilled' && resProdutos.value.ok) {
        const data = await resProdutos.value.json();
        setProdutos(data.map((p: any) => ({
          id: p.id,
          codigo: p.codigo ?? '',
          nome: p.nome ?? '',
          unidadeSigla: p.unidadeMedidaSigla ?? '',
          ativo: p.ativo ?? true,
          controlaLote: p.controlarPorLote ?? false,
        })));
      }

      if (resAlmox.status === 'fulfilled' && resAlmox.value.ok) {
        const data = await resAlmox.value.json();
        setAlmoxarifados(data.filter((a: any) => a.ativo !== false).map((a: any) => ({
          id: a.id,
          nome: a.nome ?? '',
        })));
      }

      if (resTipos.status === 'fulfilled' && resTipos.value.ok) {
        const data = await resTipos.value.json();
        setTiposOrdem(data.map((t: any) => ({ id: t.id, nome: t.nome ?? '' })));
      }

      if (resLotes.status === 'fulfilled' && resLotes.value.ok) {
        const data = await resLotes.value.json();
        setLotes(data.map((l: any) => ({
          id: l.id,
          numero: l.codigoLote ?? '',
          produtoId: l.produtoId ?? undefined,
        })));
      }

      if (resRoteiros.status === 'fulfilled' && resRoteiros.value.ok) {
        const data = await resRoteiros.value.json();
        setRoteiros(data.filter((r: any) => r.ativo !== false).map((r: any) => ({
          id: r.id,
          label: r.versao ? `${r.codigo} — v${r.versao}` : r.codigo,
          produtoId: r.produtoId ?? '',
        })));
      }
    } finally {
      setLoadingRefs(false);
    }
  }, []);


  const loadVariacoes = useCallback(async (produtoId: string) => {
    setLoadingVar(true);
    setVariacoes([]);
    try {
      const res = await fetchWithAuth(`/api/produtos/${produtoId}`);
      if (!res.ok) return;
      const data = await res.json();
      const vars: VariacaoOption[] = (data.variacoes ?? []).map((v: any) => ({
        id: String(v.id),
        nome: v.nome ?? '',
        codigoHex: v.codigoHex ?? undefined,
      })).filter((v: VariacaoOption) => v.id && v.nome);
      setVariacoes(vars);
    } catch {
      setVariacoes([]);
    } finally {
      setLoadingVar(false);
    }
  }, []);

  const loadOrdem = useCallback(async (ordemId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/ordens-producao/${ordemId}`);
      if (!res.ok) throw new Error('Ordem não encontrada.');
      const data = await res.json();
      setForm({
        produtoId: data.produtoId ?? '',
        produtoVariacaoId: String(data.produtoVariacaoId ?? ''),
        tipoOrdemDeProducaoId: String(data.tipoOrdemDeProducaoId ?? ''),
        almoxarifadoId: String(data.almoxarifadoId ?? ''),
        roteiroProducaoId: String(data.roteiroProducaoId ?? ''),
        loteId: String(data.loteId ?? ''),
        quantidade: String(data.quantidade ?? 1),
        status: data.status ?? 1,
        observacoes: data.observacoes ?? '',
      });
      setCodigoOrdem(data.codigoOrdem ?? '');
      setFaseAtualNome(data.faseAtualNome ?? '');
      setDataInicio(data.dataInicio ? new Date(data.dataInicio).toLocaleDateString('pt-BR') : '');
      setDataFim(data.dataFim ? new Date(data.dataFim).toLocaleDateString('pt-BR') : '');
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar ordem.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRefs(); }, [loadRefs]);

  useEffect(() => {
    if (id && modo !== 'criar') loadOrdem(id);
  }, [id, modo, loadOrdem]);

  useEffect(() => {
    const p = produtos.find(x => x.id === form.produtoId) ?? null;
    setSelectedProduto(p);
    if (!form.produtoId) {
      setVariacoes([]);
    } else {
      loadVariacoes(form.produtoId);
    }
  }, [form.produtoId, produtos]);

  const lotesParaProduto = selectedProduto
    ? lotes.filter(l => !l.produtoId || l.produtoId === selectedProduto.id)
    : lotes;

  const roteirosDoProduto = selectedProduto
    ? roteiros.filter(r => r.produtoId === selectedProduto.id)
    : [];

  const mostrarLote = lotesParaProduto.length > 0;

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.produtoId) errs.produtoId = 'Selecione um produto.';
    if (variacoes.length > 0 && !form.produtoVariacaoId)
      errs.produtoVariacaoId = 'Selecione a cor/variação.';
    if (!form.tipoOrdemDeProducaoId) errs.tipoOrdemDeProducaoId = 'Selecione o tipo de ordem.';
    if (!form.almoxarifadoId) errs.almoxarifadoId = 'Selecione o almoxarifado.';
    if (mostrarLote && !form.loteId) errs.loteId = 'Produto exige lote.';
    const qtd = parseInt(form.quantidade, 10);
    if (!form.quantidade || isNaN(qtd) || qtd < 1) errs.quantidade = 'Informe uma quantidade válida.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvar = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      if (modo === 'criar') {
        const body = {
          produtoId: form.produtoId,
          quantidade: parseInt(form.quantidade, 10),
          tipoOrdemDeProducaoId: form.tipoOrdemDeProducaoId,
          almoxarifadoId: form.almoxarifadoId,
          roteiroProducaoId: form.roteiroProducaoId || undefined,
          loteId: form.loteId || undefined,
          observacoes: form.observacoes || undefined,
          produtoVariacaoId: form.produtoVariacaoId || undefined,
        };
        const res = await fetchWithAuth('/api/ordens-producao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.detail ?? err?.title ?? 'Erro ao criar ordem.');
        }
        const created = await res.json();
        showToast(`Ordem ${created.codigoOrdem} criada com sucesso.`);
        navigate('/producao/ordens');
      } else {
        const body = {
          id,
          quantidade: parseInt(form.quantidade, 10),
          status: form.status,
          almoxarifadoId: form.almoxarifadoId,
          loteId: form.loteId || undefined,
          observacoes: form.observacoes || undefined,
          produtoVariacaoId: form.produtoVariacaoId || undefined,
        };
        const res = await fetchWithAuth(`/api/ordens-producao/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.detail ?? err?.title ?? 'Erro ao atualizar ordem.');
        }
        showToast('Ordem atualizada com sucesso.');
        navigate('/producao/ordens');
      }
    } catch (e: any) {
      setError(e.message ?? 'Erro inesperado.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingRefs || (loading && !!id)) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Home size={11} /><ChevronRight size={11} />
            <span>Produção</span><ChevronRight size={11} />
            <span>Ordem de produção</span><ChevronRight size={11} />
            <span className="text-gray-600 font-medium">Dados da ordem de produção</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Loader2 size={16} className="animate-spin" /> Carregando…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Breadcrumb */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <button
            onClick={() => navigate('/producao/ordens')}
            className="hover:text-gray-600 transition-colors"
          >
            Ordem de produção
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Dados da ordem de produção</span>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="px-6 py-4 pb-24">

          {error && (
            <div className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
                <X size={13} />
              </button>
            </div>
          )}

          {/* Produto */}
          <ProdutoSelector
            value={form.produtoId}
            options={produtos}
            onChange={(pid) => {
              setForm(prev => ({ ...prev, produtoId: pid, produtoVariacaoId: '', loteId: '', roteiroProducaoId: '' }));
              setErrors(prev => ({ ...prev, produtoId: undefined, produtoVariacaoId: undefined, loteId: undefined }));
            }}
            error={errors.produtoId}
            readOnly={readOnly || modo === 'editar'}
          />

          {/* Cor / Variação — só aparece quando o produto tem variações cadastradas */}
          {(variacoes.length > 0 || loadingVar) && (
            <UField label="Cor / Variação" required={!readOnly} error={errors.produtoVariacaoId} readOnly={readOnly}>
              {loadingVar ? (
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={13} className="animate-spin" /> Carregando…
                </span>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {variacoes.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={readOnly}
                      onClick={() => {
                        setField('produtoVariacaoId', v.id === form.produtoVariacaoId ? '' : v.id);
                      }}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors',
                        form.produtoVariacaoId === v.id
                          ? 'border-gray-700 bg-gray-700 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400',
                        readOnly && 'cursor-default',
                      )}
                    >
                      {v.codigoHex && (
                        <span
                          className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: v.codigoHex }}
                        />
                      )}
                      {v.nome}
                      {form.produtoVariacaoId === v.id && <Check size={11} />}
                    </button>
                  ))}
                </div>
              )}
            </UField>
          )}

          {/* Tipo */}
          <UField label="Tipo" required={!readOnly} error={errors.tipoOrdemDeProducaoId} readOnly={readOnly}>
            <SelectDropdown
              value={form.tipoOrdemDeProducaoId}
              onChange={v => setField('tipoOrdemDeProducaoId', v)}
              options={tiposOrdem.map(t => ({ value: t.id, label: t.nome }))}
              placeholder="Selecionar tipo…"
              readOnly={readOnly || modo === 'editar'}
              searchable
            />
          </UField>

          {/* Almoxarifado */}
          <UField label="Almoxarifado" required={!readOnly} error={errors.almoxarifadoId} readOnly={readOnly}>
            <SelectDropdown
              value={form.almoxarifadoId}
              onChange={v => setField('almoxarifadoId', v)}
              options={almoxarifados.map(a => ({ value: a.id, label: a.nome }))}
              placeholder="Selecionar almoxarifado…"
              readOnly={readOnly}
              searchable
            />
          </UField>

          {/* Roteiro de produção — aparece quando o produto tem roteiros cadastrados */}
          {(roteirosDoProduto.length > 0 || (modo !== 'criar' && form.roteiroProducaoId)) && (
            <UField label="Roteiro de produção" readOnly={readOnly || modo === 'editar'}>
              {roteirosDoProduto.length === 0 && form.roteiroProducaoId ? (
                <span className="text-sm text-gray-500">
                  {roteiros.find(r => r.id === form.roteiroProducaoId)?.label ?? form.roteiroProducaoId}
                </span>
              ) : (
                <SelectDropdown
                  value={form.roteiroProducaoId}
                  onChange={v => setField('roteiroProducaoId', v)}
                  options={roteirosDoProduto.map(r => ({ value: r.id, label: r.label }))}
                  placeholder="Selecionar roteiro…"
                  readOnly={readOnly || modo === 'editar'}
                  searchable
                />
              )}
            </UField>
          )}

          {/* Código da ordem — somente leitura, exibido em editar/visualizar */}
          {modo !== 'criar' && codigoOrdem && (
            <UField label="Código da ordem" readOnly>
              <span className="text-sm font-medium text-gray-700">{codigoOrdem}</span>
            </UField>
          )}
          {modo === 'criar' && (
            <UField label="Código da ordem" readOnly>
              <span className="text-sm text-gray-400">Gerado automaticamente</span>
            </UField>
          )}

          {/* Quantidade */}
          <UField label="Quantidade" required={!readOnly} error={errors.quantidade} readOnly={readOnly}>
            <input
              type="number"
              min={1}
              value={form.quantidade}
              onChange={e => setField('quantidade', e.target.value)}
              readOnly={readOnly}
              placeholder="1"
              className={cn(uInput, 'text-gray-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none')}
            />
          </UField>

          {/* Status */}
          <UField label="Status" readOnly={readOnly || modo === 'criar'}>
            {readOnly || modo === 'criar' ? (
              (() => {
                const s = STATUS_MAP[form.status] ?? STATUS_MAP[1];
                return (
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', s.color)}>
                    {s.label}
                  </span>
                );
              })()
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(STATUS_MAP).map(([val, { label, color }]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setField('status', parseInt(val, 10))}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      form.status === parseInt(val, 10)
                        ? color + ' ring-1 ring-offset-1 ring-current'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400',
                    )}
                  >
                    {form.status === parseInt(val, 10) && <Check size={11} />}
                    {label}
                  </button>
                ))}
              </div>
            )}
          </UField>

          {/* Fase atual — somente leitura */}
          {modo !== 'criar' && faseAtualNome && (
            <UField label="Fase atual" readOnly>
              <span className="text-sm text-gray-700">{faseAtualNome}</span>
            </UField>
          )}

          {/* Lote de produção — só aparece quando o produto tem lotes cadastrados */}
          {(mostrarLote || (readOnly && form.loteId)) && (
            <UField label="Lote de produção" required={mostrarLote && !readOnly} error={errors.loteId} readOnly={readOnly}>
              <SelectDropdown
                value={form.loteId}
                onChange={v => setField('loteId', v)}
                options={lotesParaProduto.map(l => ({ value: l.id, label: l.numero }))}
                readOnly={readOnly}
                searchable
              />
            </UField>
          )}

          {/* Data de início — somente leitura */}
          {modo !== 'criar' && dataInicio && (
            <UField label="Data de início" readOnly>
              <span className="text-sm text-gray-700">{dataInicio}</span>
            </UField>
          )}

          {/* Data de conclusão — somente leitura, exibe só quando preenchida */}
          {dataFim && (
            <UField label="Data de conclusão" readOnly>
              <span className="text-sm text-gray-700">{dataFim}</span>
            </UField>
          )}

          {/* Observação */}
          <div className="border-b border-gray-200 py-3">
            <label className="block text-xs text-gray-500 mb-2">Observação</label>
            <textarea
              value={form.observacoes}
              onChange={e => setField('observacoes', e.target.value)}
              readOnly={readOnly}
              rows={4}
              maxLength={400}
              className={cn(
                'w-full text-sm text-gray-800 outline-none resize-none px-3 py-2.5',
                readOnly ? 'bg-transparent' : 'bg-[#f2f5f2]',
              )}
            />
            {!readOnly && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                {400 - form.observacoes.length} caracteres restantes
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Floating action button */}
      <FAB
        onSalvar={handleSalvar}
        onCancelar={() => navigate('/producao/ordens')}
        saving={saving}
        readOnly={readOnly}
      />
    </div>
  );
}
