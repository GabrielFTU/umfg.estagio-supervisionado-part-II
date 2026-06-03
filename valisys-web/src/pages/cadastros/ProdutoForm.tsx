import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Home, ChevronRight, ChevronLeft, Save, X, Pencil,
  Loader2, Upload, Trash2, Plus, Search, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Modo = 'criar' | 'editar' | 'visualizar';
type Aba = 'geral' | 'fiscal' | 'fornecedores' | 'variacoes' | 'custos';
const TABS_ORDER: Aba[] = ['geral', 'fiscal', 'fornecedores', 'variacoes', 'custos'];
interface Option { id: string; nome: string; extra?: string }

// ─── Enums (fora do componente — não mudam) ───────────────────────────────────

const CLASSIFICACOES = [
  { value: 0, label: 'Matéria-prima',   color: 'amber'   },
  { value: 1, label: 'Componente',      color: 'blue'    },
  { value: 2, label: 'Semi-acabado',    color: 'violet'  },
  { value: 3, label: 'Produto Acabado', color: 'emerald' },
  { value: 4, label: 'Mat. Consumo',    color: 'gray'    },
] as const;

const CLASSIF_ACTIVE: Record<string, string> = {
  amber:   'bg-amber-500  border-amber-500  text-white',
  blue:    'bg-blue-500   border-blue-500   text-white',
  violet:  'bg-violet-500 border-violet-500 text-white',
  emerald: 'bg-emerald-500 border-emerald-500 text-white',
  gray:    'bg-gray-500   border-gray-500   text-white',
};

const TIPO_ITEM_OPTIONS = [
  { value: '',   label: 'Selecione o tipo de item…' },
  { value: '0',  label: '00 – Mercadoria para Revenda' },
  { value: '1',  label: '01 – Matéria-prima' },
  { value: '2',  label: '02 – Embalagem' },
  { value: '3',  label: '03 – Produto em Processo' },
  { value: '4',  label: '04 – Produto Acabado' },
  { value: '5',  label: '05 – Subproduto' },
  { value: '6',  label: '06 – Produto Intermediário' },
  { value: '7',  label: '07 – Material de Uso e Consumo' },
  { value: '8',  label: '08 – Ativo Imobilizado' },
  { value: '9',  label: '09 – Serviços' },
  { value: '10', label: '10 – Outros Insumos' },
  { value: '99', label: '99 – Outras' },
];

const ORIGEM_OPTIONS = [
  { value: 0, label: '0 – Nacional (exceto 3, 4, 5 e 8)' },
  { value: 1, label: '1 – Estrangeira – Importação direta' },
  { value: 2, label: '2 – Estrangeira – Mercado interno' },
  { value: 3, label: '3 – Nacional com conteúdo de importação > 40%' },
  { value: 4, label: '4 – Nacional – processos produtivos básicos' },
  { value: 5, label: '5 – Nacional com conteúdo de importação ≤ 40%' },
  { value: 6, label: '6 – Estrangeira – Importação direta, sem similar nacional' },
  { value: 7, label: '7 – Estrangeira – Mercado interno, sem similar nacional' },
  { value: 8, label: '8 – Nacional com conteúdo de importação > 70%' },
];

function maskNcm(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
}

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface FornecedorLocal {
  localId: string; id?: string; pessoaId: string; nome: string;
  principal: boolean; codigoFornecedor: string; precoUltimaCompra: string;
  unidadeMedidaCompraId: string;
  fatorConversao: string;
}
interface VariacaoLocal {
  localId: string; id?: string; nome: string;
  codigoHex: string; valor: string; estoqueAtual: number;
}

// ─── Componentes base (memo = não re-renderizam a menos que as props mudem) ───

const Label = memo(function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {children}{required && <span className="text-red-600 ml-0.5 font-bold">*</span>}
    </label>
  );
});

const FieldError = memo(function FieldError({ msg }: { msg?: string }) {
  return msg ? (
    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 inline-block" />{msg}
    </p>
  ) : null;
});

const inputCls = (err?: boolean, ro?: boolean) => cn(
  'w-full h-9 px-3 text-sm rounded-md border bg-white transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
  'placeholder:text-gray-300 text-gray-800',
  ro  ? 'bg-gray-50 border-gray-100 cursor-default text-gray-500' :
  err ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 hover:border-gray-300',
);

const Input = memo(function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { err?: boolean; ro?: boolean }) {
  const { err, ro, className, ...rest } = props;
  return <input readOnly={ro} className={cn(inputCls(err, ro), className)} {...rest} />;
});

const Textarea = memo(function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { ro?: boolean }) {
  const { ro, className, ...rest } = props;
  return (
    <textarea readOnly={ro} className={cn(
      'w-full px-3 py-2.5 text-sm rounded-md border bg-white transition-colors resize-none',
      'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
      'placeholder:text-gray-300 text-gray-800',
      ro ? 'bg-gray-50 border-gray-100 cursor-default text-gray-500' : 'border-gray-200 hover:border-gray-300',
      className,
    )} {...rest} />
  );
});

const Select = memo(function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { err?: boolean; ro?: boolean }) {
  const { err, ro, className, children, ...rest } = props;
  return (
    <div className="relative">
      <select disabled={ro} className={cn(inputCls(err, ro), 'appearance-none pr-8', !ro && 'cursor-pointer', className)} {...rest}>
        {children}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 12 12">
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

const Toggle = memo(function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30',
        checked ? 'bg-blue-500' : 'bg-gray-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}>
      <span className={cn(
        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      )} />
    </button>
  );
});

const Card = memo(function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200/60 shadow-sm', className)}>
      {title && <div className="px-5 pt-4 pb-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-800">{title}</h3></div>}
      <div className="p-5">{children}</div>
    </div>
  );
});

// ─── Upload de imagem (memo pois é pesado) ────────────────────────────────────

const ImageUpload = memo(function ImageUpload({
  value, preview, loading, readOnly, onChange, onRemove,
}: {
  value: string | null; preview: string | null; loading: boolean;
  readOnly?: boolean; onChange: (file: File) => void; onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const src = preview ?? value;

  return (
    <div>
      <div
        onClick={() => !readOnly && !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!readOnly) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f && !readOnly && f.type.startsWith('image/')) onChange(f); }}
        className={cn(
          'relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-150 flex flex-col items-center justify-center',
          src ? 'border border-gray-200'
            : cn('border-2 border-dashed', dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50', !readOnly && 'hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'),
        )}
      >
        {src ? (
          <>
            <img src={src} alt="Produto" className="w-full h-full object-cover" />
            {loading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 size={24} className="text-blue-500 animate-spin" /></div>}
            {!readOnly && !loading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full">Alterar imagem</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center select-none">
            {loading ? <Loader2 size={28} className="text-blue-400 animate-spin" /> : <Upload size={28} className={dragging ? 'text-blue-400' : 'text-gray-300'} />}
            <div>
              <p className="text-xs font-medium text-gray-400">{loading ? 'Enviando…' : dragging ? 'Solte aqui' : 'Clique ou arraste a imagem'}</p>
              {!loading && !dragging && <p className="text-[11px] text-gray-300 mt-0.5">JPG · PNG · WebP · máx. 5 MB</p>}
            </div>
          </div>
        )}
      </div>
      {src && !readOnly && !loading && (
        <button type="button" onClick={onRemove}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 text-xs text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors">
          <Trash2 size={11} /> Remover imagem
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f && f.type.startsWith('image/')) onChange(f); e.target.value = ''; }} />
    </div>
  );
});

// ─── Form state ───────────────────────────────────────────────────────────────

const emptyForm = {
  nome: '', descricao: '', observacoes: '', classificacao: 0,
  categoriaId: '', unidadeMedidaId: '', estoqueMinimo: '',
  controlarPorLote: false, ativo: true, codigo: '',
  ncm: '', tipoItem: '', origemMercadoria: '0',
  custoPadrao: '', custoUltimaCompra: '', dataUltimaCompra: '',
};
type FormState = typeof emptyForm;

// ─── Página ───────────────────────────────────────────────────────────────────

export function ProdutoFormPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams<{ id?: string }>();

  const modo: Modo = !id ? 'criar' : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const ro = modo === 'visualizar';

  const [f, setF]             = useState<FormState>(emptyForm);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [activeTab, setActiveTab]     = useState<Aba>('geral');

  const [categorias, setCategorias] = useState<Option[]>([]);
  const [unidades, setUnidades]     = useState<Option[]>([]);

  const [imagemUrl, setImagemUrl]       = useState<string | null>(null);
  const [imagemLocal, setImagemLocal]   = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imgError, setImgError]         = useState('');

  const [fornecedores, setFornecedores]                 = useState<FornecedorLocal[]>([]);
  const [deletedFornecedorIds, setDeletedFornecedorIds] = useState<string[]>([]);
  const [pessoaQuery, setPessoaQuery]                   = useState('');
  const [pessoaResults, setPessoaResults]               = useState<Option[]>([]);
  const [loadingPessoas, setLoadingPessoas]             = useState(false);
  const [showPessoaSearch, setShowPessoaSearch]         = useState(false);

  const [variacoes, setVariacoes]                   = useState<VariacaoLocal[]>([]);
  const [deletedVariacaoIds, setDeletedVariacaoIds] = useState<string[]>([]);
  const [valorAplicarTodos, setValorAplicarTodos]   = useState('');

  const [ncmDesc, setNcmDesc]               = useState('');
  const [ncmMode, setNcmMode]               = useState<'code' | 'search'>('code');
  const [ncmSearchQuery, setNcmSearchQuery] = useState('');
  const [ncmResults, setNcmResults]         = useState<{ codigo: string; descricao: string }[]>([]);
  const [loadingNcm, setLoadingNcm]         = useState(false);

  // Wizard: controle de passos
  const [visitedTabs, setVisitedTabs] = useState<Set<Aba>>(new Set(['geral']));
  const currentStepIdx = TABS_ORDER.indexOf(activeTab);
  const isFirstStep    = currentStepIdx === 0;
  const isLastStep     = currentStepIdx === TABS_ORDER.length - 1;

  const goNext = useCallback(() => {
    const next = TABS_ORDER[currentStepIdx + 1];
    if (next) { setVisitedTabs(prev => new Set(prev).add(next)); setActiveTab(next); }
  }, [currentStepIdx]);

  const goPrev = useCallback(() => {
    const prev = TABS_ORDER[currentStepIdx - 1];
    if (prev) setActiveTab(prev);
  }, [currentStepIdx]);

  const goToTab = useCallback((tab: Aba) => {
    setVisitedTabs(prev => new Set(prev).add(tab));
    setActiveTab(tab);
  }, []);

  // ─── Handlers estáveis (useCallback evita re-render dos filhos memoizados) ──

  // Handler genérico para inputs de texto (usa name attribute)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setF(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handler para NCM (precisa aplicar máscara)
  const handleNcmChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setF(prev => ({ ...prev, ncm: maskNcm(e.target.value) }));
  }, []);

  // Handler para selects
  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setF(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handlers específicos para tipos não-string
  const handleAtivo = useCallback((v: boolean) => setF(prev => ({ ...prev, ativo: v })), []);
  const handleLote  = useCallback((v: boolean) => setF(prev => ({ ...prev, controlarPorLote: v })), []);

  // Classification via data-value (evita criar closure por item)
  const handleClassificacao = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const v = Number(e.currentTarget.dataset.value);
    setF(prev => ({ ...prev, classificacao: v }));
  }, []);

  // Imagem
  const handleRemoveImagem = useCallback(() => { setImagemUrl(null); setImagemLocal(null); }, []);

  // Fornecedor
  const handleAddFornecedor = useCallback((pessoa: Option) => {
    setFornecedores(prev => {
      if (prev.some(fn => fn.pessoaId === pessoa.id)) return prev;
      return [...prev, { localId: crypto.randomUUID(), pessoaId: pessoa.id, nome: pessoa.nome, principal: prev.length === 0, codigoFornecedor: '', precoUltimaCompra: '', unidadeMedidaCompraId: '', fatorConversao: '1' }];
    });
    setPessoaQuery(''); setPessoaResults([]); setShowPessoaSearch(false);
  }, []);

  const handleRemoveFornecedor = useCallback((localId: string) => {
    setFornecedores(prev => {
      const forn = prev.find(f => f.localId === localId);
      if (forn?.id) setDeletedFornecedorIds(d => [...d, forn.id!]);
      const updated = prev.filter(f => f.localId !== localId);
      if (forn?.principal && updated.length > 0) updated[0].principal = true;
      return updated;
    });
  }, []);

  const handleSetPrincipal = useCallback((localId: string) =>
    setFornecedores(prev => prev.map(f => ({ ...f, principal: f.localId === localId }))), []);

  const handleFornecedorField = useCallback((localId: string, field: keyof FornecedorLocal, value: string) =>
    setFornecedores(prev => prev.map(f => f.localId === localId ? { ...f, [field]: value } : f)), []);

  // Variações
  const handleAddVariacao = useCallback(() =>
    setVariacoes(prev => [...prev, { localId: crypto.randomUUID(), nome: '', codigoHex: '#3b82f6', valor: '', estoqueAtual: 0 }]), []);

  const handleRemoveVariacao = useCallback((localId: string) => {
    setVariacoes(prev => {
      const vari = prev.find(v => v.localId === localId);
      if (vari?.id) setDeletedVariacaoIds(d => [...d, vari.id!]);
      return prev.filter(v => v.localId !== localId);
    });
  }, []);

  const handleVariacaoField = useCallback((localId: string, field: keyof VariacaoLocal, value: string) =>
    setVariacoes(prev => prev.map(v => v.localId === localId ? { ...v, [field]: value } : v)), []);

  const handleAplicarTodos = useCallback(() => {
    if (!valorAplicarTodos) return;
    setVariacoes(prev => prev.map(v => ({ ...v, valor: valorAplicarTodos })));
  }, [valorAplicarTodos]);

  // NCM search toggle
  const toggleNcmMode = useCallback(() => {
    setNcmMode(m => m === 'code' ? 'search' : 'code');
    setNcmSearchQuery(''); setNcmResults([]);
  }, []);

  const selectNcm = useCallback((codigo: string, descricao: string) => {
    setF(prev => ({ ...prev, ncm: maskNcm(codigo) }));
    setNcmDesc(descricao);
    setNcmMode('code'); setNcmSearchQuery(''); setNcmResults([]);
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h: HeadersInit = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/CategoriasProduto', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/UnidadesMedida',    { headers: h }).then(r => r.json()).catch(() => []),
    ]).then(([cats, ums]) => {
      setCategorias(Array.isArray(cats) ? cats.map((c: { id: string; nome: string }) => ({ id: c.id, nome: c.nome })) : []);
      setUnidades(Array.isArray(ums) ? ums.map((u: { id: string; nome: string; sigla: string }) => ({ id: u.id, nome: u.nome, extra: u.sigla })) : []);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoadingData(true);
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/produtos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const d = await res.json();
        setF({
          nome: d.nome ?? '', descricao: d.descricao ?? '', observacoes: d.observacoes ?? '',
          classificacao: d.classificacaoId ?? 0, categoriaId: d.categoriaProdutoId ?? '',
          unidadeMedidaId: d.unidadeMedidaId ?? '', estoqueMinimo: String(d.estoqueMinimo ?? ''),
          controlarPorLote: d.controlarPorLote ?? false, ativo: d.ativo ?? true,
          codigo: d.codigo ?? '', ncm: d.ncm ? maskNcm(d.ncm) : '',
          tipoItem: d.tipoItemId != null ? String(d.tipoItemId) : '',
          origemMercadoria: String(d.origemMercadoriaId ?? 0),
          custoPadrao: d.custoPadrao ? String(d.custoPadrao) : '',
          custoUltimaCompra: d.custoUltimaCompra ? String(d.custoUltimaCompra) : '',
          dataUltimaCompra: d.dataUltimaCompra ? d.dataUltimaCompra.split('T')[0] : '',
        });
        setImagemUrl(d.imagemUrl ?? null);
        setFornecedores((d.fornecedores ?? []).map((fn: { id: string; pessoaId: string; fornecedorNome: string; principal: boolean; codigoFornecedor: string | null; precoUltimaCompra: number | null; unidadeMedidaCompraId: string | null; fatorConversao: number }) => ({
          localId: fn.id, id: fn.id, pessoaId: fn.pessoaId, nome: fn.fornecedorNome,
          principal: fn.principal, codigoFornecedor: fn.codigoFornecedor ?? '',
          precoUltimaCompra: fn.precoUltimaCompra != null ? String(fn.precoUltimaCompra) : '',
          unidadeMedidaCompraId: fn.unidadeMedidaCompraId ?? '',
          fatorConversao: fn.fatorConversao ? String(fn.fatorConversao) : '1',
        })));
        setVariacoes((d.variacoes ?? []).map((v: { id: string; nome: string; codigoHex: string | null; valor: number; estoqueAtual: number }) => ({
          localId: v.id, id: v.id, nome: v.nome, codigoHex: v.codigoHex ?? '#3b82f6',
          valor: String(v.valor), estoqueAtual: v.estoqueAtual ?? 0,
        })));
      } catch {
        setErrors({ _global: 'Não foi possível carregar os dados.' });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!pessoaQuery.trim()) { setPessoaResults([]); return; }
    const t = setTimeout(async () => {
      setLoadingPessoas(true);
      try {
        const token = localStorage.getItem('token');
        const h: HeadersInit = { Authorization: `Bearer ${token}` };

        const [resF, resJ] = await Promise.all([
          fetch('/api/PessoasFisicas',   { headers: h }),
          fetch('/api/PessoasJuridicas', { headers: h }),
        ]);

        const fisicas:   { id: string; nome: string; nomeFantasia?: string }[]       = resF.ok  ? await resF.json()  : [];
        const juridicas: { id: string; razaoSocial: string; nomeFantasia?: string }[] = resJ.ok  ? await resJ.json()  : [];

        const termo = pessoaQuery.trim().toLowerCase();

        const combinados: Option[] = [
          ...fisicas.map(p => ({ id: p.id, nome: p.nomeFantasia?.trim() || p.nome })),
          ...juridicas.map(p => ({ id: p.id, nome: p.nomeFantasia?.trim() || p.razaoSocial })),
        ]
          .filter(p => p.nome.toLowerCase().includes(termo))
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
          .slice(0, 25);

        setPessoaResults(combinados);
      } catch { setPessoaResults([]); } finally { setLoadingPessoas(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [pessoaQuery]);

  useEffect(() => {
    const digits = f.ncm.replace(/\D/g, '');
    if (digits.length !== 8) { setNcmDesc(''); return; }
    const t = setTimeout(async () => {
      setLoadingNcm(true);
      try {
        const res = await fetch(`https://brasilapi.com.br/api/ncm/v1/${digits}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setNcmDesc(data.descricao ?? '');
      } catch { setNcmDesc('NCM não encontrado'); } finally { setLoadingNcm(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [f.ncm]);

  useEffect(() => {
    if (ncmSearchQuery.trim().length < 3) { setNcmResults([]); return; }
    const t = setTimeout(async () => {
      setLoadingNcm(true);
      try {
        const res = await fetch(`https://brasilapi.com.br/api/ncm/v1?search=${encodeURIComponent(ncmSearchQuery)}`);
        const data = await res.json();
        setNcmResults(Array.isArray(data) ? data.slice(0, 12) : []);
      } catch { setNcmResults([]); } finally { setLoadingNcm(false); }
    }, 450);
    return () => clearTimeout(t);
  }, [ncmSearchQuery]);

  // ─── Upload imagem ────────────────────────────────────────────────────────

  const handleImagem = useCallback(async (file: File) => {
    setImgError('');
    setImagemLocal(URL.createObjectURL(file));
    setUploadingImg(true);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('arquivo', file);
      const res = await fetch('/api/produtos/imagem', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setImagemUrl(url);
    } catch { setImgError('Falha ao enviar. Tente novamente.'); setImagemLocal(null);
    } finally { setUploadingImg(false); }
  }, []);

  // ─── Validação ────────────────────────────────────────────────────────────

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!f.nome.trim())       e.nome = 'Campo obrigatório';
    if (!f.descricao.trim())  e.descricao = 'Campo obrigatório';
    if (!f.categoriaId)       e.categoriaId = 'Selecione uma categoria';
    if (!f.unidadeMedidaId)   e.unidadeMedidaId = 'Selecione uma unidade';
    setErrors(e);
    if (Object.keys(e).length > 0) setActiveTab('geral');
    return Object.keys(e).length === 0;
  }, [f.nome, f.descricao, f.categoriaId, f.unidadeMedidaId]);

  // ─── Salvar ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ro || !validate()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const h = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const body = {
        ...(id ? { id } : {}),
        nome: f.nome, descricao: f.descricao, observacoes: f.observacoes || null,
        classificacao: f.classificacao, categoriaProdutoId: f.categoriaId,
        unidadeMedidaId: f.unidadeMedidaId, estoqueMinimo: parseFloat(f.estoqueMinimo) || 0,
        controlarPorLote: f.controlarPorLote, ativo: f.ativo, imagemUrl: imagemUrl ?? null,
        ncm: f.ncm.replace(/\D/g, '') || null,
        tipoItem: f.tipoItem !== '' ? parseInt(f.tipoItem) : null,
        origemMercadoria: parseInt(f.origemMercadoria),
        custoPadrao: parseFloat(f.custoPadrao) || 0,
        custoUltimaCompra: parseFloat(f.custoUltimaCompra) || 0,
        dataUltimaCompra: null,
      };

      let produtoId = id;
      if (!id) {
        const res = await fetch('/api/produtos', { method: 'POST', headers: h, body: JSON.stringify(body) });
        if (!res.ok) throw new Error();
        produtoId = (await res.json()).id;
      } else {
        const res = await fetch(`/api/produtos/${id}`, { method: 'PUT', headers: h, body: JSON.stringify(body) });
        if (!res.ok) throw new Error();
      }

      for (const fId of deletedFornecedorIds)
        await fetch(`/api/produtos/${produtoId}/fornecedores/${fId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      for (const forn of fornecedores) {
        if (!forn.id)
          await fetch(`/api/produtos/${produtoId}/fornecedores`, { method: 'POST', headers: h, body: JSON.stringify({ pessoaId: forn.pessoaId, fornecedorNome: forn.nome, principal: forn.principal, codigoFornecedor: forn.codigoFornecedor || null, precoUltimaCompra: forn.precoUltimaCompra ? parseFloat(forn.precoUltimaCompra) : null, unidadeMedidaCompraId: forn.unidadeMedidaCompraId || null, fatorConversao: parseFloat(forn.fatorConversao) || 1 }) });
        else
          await fetch(`/api/produtos/${produtoId}/fornecedores/${forn.id}`, { method: 'PUT', headers: h, body: JSON.stringify({ codigoFornecedor: forn.codigoFornecedor || null, precoUltimaCompra: forn.precoUltimaCompra ? parseFloat(forn.precoUltimaCompra) : null, unidadeMedidaCompraId: forn.unidadeMedidaCompraId || null, fatorConversao: parseFloat(forn.fatorConversao) || 1 }) });
      }
      const principalSalvo = fornecedores.find(f => f.principal && f.id);
      if (principalSalvo?.id)
        await fetch(`/api/produtos/${produtoId}/fornecedores/${principalSalvo.id}/principal`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });

      for (const vId of deletedVariacaoIds)
        await fetch(`/api/produtos/${produtoId}/variacoes/${vId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      for (const vari of variacoes) {
        const vb = { nome: vari.nome, codigoHex: vari.codigoHex || null, valor: parseFloat(vari.valor) || 0 };
        if (!vari.id) await fetch(`/api/produtos/${produtoId}/variacoes`, { method: 'POST', headers: h, body: JSON.stringify(vb) });
        else          await fetch(`/api/produtos/${produtoId}/variacoes/${vari.id}`, { method: 'PUT', headers: h, body: JSON.stringify(vb) });
      }
      navigate('/cadastros/produtos');
    } catch {
      setErrors(prev => ({ ...prev, _global: 'Não foi possível salvar. Tente novamente.' }));
    } finally { setSaving(false); }
  };

  // ─── Memos ────────────────────────────────────────────────────────────────

  const estoqueTotal = useMemo(() => variacoes.reduce((s, v) => s + v.estoqueAtual, 0), [variacoes]);

  // Retorna true quando os campos principais daquela aba foram preenchidos
  const isTabFilled = useCallback((tab: Aba): boolean => {
    switch (tab) {
      case 'geral':        return !!f.nome.trim() && !!f.descricao.trim() && !!f.categoriaId && !!f.unidadeMedidaId;
      case 'fiscal':       return !!(f.ncm || f.tipoItem);
      case 'fornecedores': return fornecedores.length > 0;
      case 'variacoes':    return variacoes.length > 0;
      case 'custos':       return !!(f.custoPadrao || f.custoUltimaCompra);
      default:             return false;
    }
  }, [f.nome, f.descricao, f.categoriaId, f.unidadeMedidaId, f.ncm, f.tipoItem, fornecedores.length, variacoes.length, f.custoPadrao, f.custoUltimaCompra]);

  const tabs = useMemo<{ key: Aba; nome: string; count?: number }[]>(() => [
    { key: 'geral',        nome: 'Geral' },
    { key: 'fiscal',       nome: 'Fiscal' },
    { key: 'fornecedores', nome: 'Fornecedores', count: fornecedores.length || undefined },
    { key: 'variacoes',    nome: 'Variações',    count: variacoes.length || undefined },
    { key: 'custos',       nome: 'Custos' },
  ], [fornecedores.length, variacoes.length]);

  const titulo = modo === 'criar' ? 'Novo Produto' : modo === 'editar' ? 'Editar Produto' : 'Visualizar Produto';

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando produto…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Breadcrumb */}
      <div className="shrink-0 bg-white border-b border-gray-200/70 px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <a href="/cadastros/produtos" className="hover:text-blue-500 transition-colors">Produtos</a>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo}</span>
        </div>
      </div>

      {/* Subheader */}
      <div className="shrink-0 bg-white border-b border-gray-200/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-800 truncate">{f.nome || titulo}</p>
          {f.codigo && <p className="text-xs text-gray-400 mt-0.5">Código #{f.codigo}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <X size={13} /> {ro ? 'Fechar' : 'Cancelar'}
          </button>
          {ro ? (
            <button type="button" onClick={() => navigate(`/cadastros/produtos/${id}/editar`)}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 shadow-sm shadow-blue-200 transition-colors">
              <Pencil size={13} /> Editar
            </button>
          ) : (
            <>
              {!isFirstStep && (
                <button type="button" onClick={goPrev}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={13} /> Anterior
                </button>
              )}
              {/* Salvar sempre disponível — outline nos passos intermediários, sólido no último */}
              <button form="produto-form" type="submit" disabled={saving}
                className={cn(
                  'flex items-center gap-1.5 h-8 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-60',
                  isLastStep
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-200'
                    : 'border border-blue-300 text-blue-600 hover:bg-blue-50',
                )}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
              {!isLastStep && (
                <button type="button" onClick={goNext}
                  className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 shadow-sm shadow-blue-200 transition-colors">
                  Próximo <ChevronRight size={13} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Passos */}
      <div className="shrink-0 bg-white border-b border-gray-200/50 px-4 sm:px-6 flex items-center gap-0 overflow-x-auto">
        {tabs.map((tab, idx) => {
          const isActive  = activeTab === tab.key;
          const isFilled  = isTabFilled(tab.key);
          const isVisited = visitedTabs.has(tab.key);
          const isLast    = idx === tabs.length - 1;
          return (
            <div key={tab.key} className="flex items-center shrink-0">
              <button type="button" onClick={() => goToTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive  ? 'border-blue-500 text-blue-600'
                  : isFilled ? 'border-emerald-400 text-gray-700 hover:text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
                )}>
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-colors',
                  isActive   ? 'bg-blue-500 text-white'
                  : isFilled  ? 'bg-emerald-500 text-white'
                  : isVisited ? 'bg-gray-200 text-gray-500'
                  : 'bg-gray-100 text-gray-400',
                )}>
                  {isFilled && !isActive ? <Check size={10} strokeWidth={3} /> : idx + 1}
                </span>
                <span className="hidden sm:inline">{tab.nome}</span>
                {tab.count != null && (
                  <span className="hidden sm:inline text-[11px] text-gray-400 tabular-nums">({tab.count})</span>
                )}
              </button>
              {!isLast && <ChevronRight size={12} className="text-gray-300 shrink-0 mx-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-5">
        <form id="produto-form" onSubmit={handleSubmit}>

          {errors._global && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{errors._global}</div>
          )}

          {/* ═══ ABA: GERAL ═══════════════════════════════════════════════════ */}
          {activeTab === 'geral' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
              <div className="space-y-4">

                <Card title="Informações do produto">
                  <div className="space-y-4">
                    <div>
                      <Label required={!ro}>Nome do produto</Label>
                      <Input name="nome" value={f.nome} ro={ro} err={!!errors.nome}
                        placeholder="Ex: Chapa de Aço 1020" className="h-10 text-base font-medium"
                        onChange={handleChange} />
                      <FieldError msg={errors.nome} />
                    </div>
                  </div>
                </Card>

                <Card title="Controle de estoque">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label required={!ro}>Unidade de medida</Label>
                      <Select name="unidadeMedidaId" value={f.unidadeMedidaId} ro={ro} err={!!errors.unidadeMedidaId} onChange={handleSelectChange}>
                        <option value="">Selecione…</option>
                        {unidades.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.extra})</option>)}
                      </Select>
                      <FieldError msg={errors.unidadeMedidaId} />
                    </div>
                    <div>
                      <Label>Estoque mínimo</Label>
                      <Input name="estoqueMinimo" type="number" min="0" step="0.001" ro={ro}
                        value={f.estoqueMinimo} placeholder="0" onChange={handleChange} />
                    </div>
                    <div>
                      <Label>Controlar por lote</Label>
                      <div className="flex items-center gap-3 h-9">
                        <Toggle checked={f.controlarPorLote} onChange={handleLote} disabled={ro} />
                        <span className="text-sm text-gray-600">{f.controlarPorLote ? 'Sim' : 'Não'}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Descrição">
                  <div className="space-y-4">
                    <div>
                      <Label required={!ro}>Descrição do produto</Label>
                      <Textarea name="descricao" rows={4} ro={ro} value={f.descricao}
                        placeholder="Descreva o produto: características, aplicações, especificações técnicas…"
                        onChange={handleChange} className={errors.descricao ? 'border-red-300' : ''} />
                      <FieldError msg={errors.descricao} />
                    </div>
                    <div>
                      <Label>Observações internas</Label>
                      <Textarea name="observacoes" rows={2} ro={ro} value={f.observacoes}
                        placeholder="Notas internas, cuidados de armazenamento… (opcional)"
                        onChange={handleChange} />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4 lg:sticky lg:top-5">
                <Card title="Imagem">
                  <ImageUpload value={imagemUrl} preview={imagemLocal} loading={uploadingImg}
                    readOnly={ro} onChange={handleImagem} onRemove={handleRemoveImagem} />
                  {imgError && <p className="mt-2 text-[11px] text-red-500">{imgError}</p>}
                </Card>

                <Card title="Organização">
                  <div>
                    <Label required={!ro}>Categoria</Label>
                    <Select name="categoriaId" value={f.categoriaId} ro={ro} err={!!errors.categoriaId} onChange={handleSelectChange}>
                      <option value="">Selecione uma categoria…</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </Select>
                    <FieldError msg={errors.categoriaId} />
                  </div>
                </Card>

                <Card title="Status">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Produto ativo</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {f.ativo ? 'Visível e disponível para uso' : 'Desativado — não aparece nas listagens'}
                        </p>
                      </div>
                      <Toggle checked={f.ativo} onChange={handleAtivo} disabled={ro} />
                    </div>
                    {f.codigo && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">Código interno</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5 tabular-nums">#{f.codigo}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ═══ ABA: FISCAL ══════════════════════════════════════════════════ */}
          {activeTab === 'fiscal' && (
            <div className="max-w-2xl space-y-4">
              <Card title="Dados fiscais">
                <div className="space-y-5">

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Código NCM</Label>
                      {!ro && (
                        <button type="button" onClick={toggleNcmMode}
                          className="text-[11px] text-blue-500 hover:text-blue-600 transition-colors">
                          {ncmMode === 'code' ? 'Buscar por descrição' : '← Inserir código manualmente'}
                        </button>
                      )}
                    </div>

                    {ncmMode === 'code' || ro ? (
                      <div>
                        <div className="relative">
                          <Input value={f.ncm} placeholder="0000.00.00" ro={ro} onChange={handleNcmChange} />
                          {loadingNcm && <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />}
                        </div>
                        {ncmDesc && (
                          <p className={cn('mt-1.5 text-[11px] flex items-center gap-1',
                            ncmDesc === 'NCM não encontrado' ? 'text-red-400' : 'text-emerald-600 font-medium')}>
                            {ncmDesc !== 'NCM não encontrado' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />}
                            {ncmDesc}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-gray-400">Nomenclatura Comum do Mercosul — 8 dígitos</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input autoFocus value={ncmSearchQuery} onChange={e => setNcmSearchQuery(e.target.value)}
                            placeholder="Digite a descrição do produto…"
                            className="w-full h-9 pl-8 pr-8 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-300" />
                          {loadingNcm && <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                        </div>
                        {ncmResults.length > 0 && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                            {ncmResults.map(item => (
                              <button key={item.codigo} type="button"
                                onClick={() => selectNcm(item.codigo, item.descricao)}
                                className="w-full text-left px-3 py-2.5 text-xs hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 flex items-start gap-2">
                                <span className="font-mono text-gray-400 shrink-0 mt-0.5">{maskNcm(item.codigo)}</span>
                                <span className="text-gray-700 leading-tight">{item.descricao}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {ncmSearchQuery.length >= 3 && !loadingNcm && ncmResults.length === 0 && (
                          <p className="text-[11px] text-gray-400 text-center py-2">Nenhum NCM encontrado</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de item</Label>
                      <Select name="tipoItem" value={f.tipoItem} ro={ro} onChange={handleSelectChange}>
                        {TIPO_ITEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Classificação do item</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {CLASSIFICACOES.map(c => (
                          <button key={c.value} type="button" disabled={ro}
                            data-value={c.value} onClick={handleClassificacao}
                            className={cn(
                              'px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all',
                              f.classificacao === c.value ? CLASSIF_ACTIVE[c.color] : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300',
                              ro && 'cursor-default',
                            )}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Origem da mercadoria</Label>
                    <Select name="origemMercadoria" value={f.origemMercadoria} ro={ro} onChange={handleSelectChange}>
                      {ORIGEM_OPTIONS.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ═══ ABA: FORNECEDORES ════════════════════════════════════════════ */}
          {activeTab === 'fornecedores' && (
            <div className="max-w-3xl space-y-4">
              <Card title="Fornecedores do produto">
                <div className="space-y-4">
                  {fornecedores.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      Nenhum fornecedor vinculado
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fornecedores.map(forn => (
                        <FornecedorRow key={forn.localId} forn={forn} ro={ro}
                          unidades={unidades}
                          unidadeMedidaId={f.unidadeMedidaId}
                          onSetPrincipal={handleSetPrincipal}
                          onRemove={handleRemoveFornecedor}
                          onFieldChange={handleFornecedorField} />
                      ))}
                    </div>
                  )}
                  {!ro && (
                    showPessoaSearch ? (
                      <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                        <Label>Buscar fornecedor</Label>
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input autoFocus value={pessoaQuery} onChange={e => setPessoaQuery(e.target.value)}
                            placeholder="Digite o nome do fornecedor…"
                            className="w-full h-9 pl-8 pr-3 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                          {loadingPessoas && <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                        </div>
                        {pessoaResults.length > 0 && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {pessoaResults.map(p => (
                              <button key={p.id} type="button" onClick={() => handleAddFornecedor(p)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0">
                                {p.nome}
                              </button>
                            ))}
                          </div>
                        )}
                        {pessoaQuery && !loadingPessoas && pessoaResults.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-2">Nenhum resultado encontrado</p>
                        )}
                        <button type="button" onClick={() => { setShowPessoaSearch(false); setPessoaQuery(''); setPessoaResults([]); }}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          Cancelar busca
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowPessoaSearch(true)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors w-full justify-center">
                        <Plus size={13} /> Adicionar fornecedor
                      </button>
                    )
                  )}
                  <p className="text-[11px] text-gray-400">Apenas 1 fornecedor pode ser marcado como principal.</p>
                </div>
              </Card>
            </div>
          )}

          {/* ═══ ABA: VARIAÇÕES ═══════════════════════════════════════════════ */}
          {activeTab === 'variacoes' && (
            <div className="max-w-4xl space-y-4">
              {variacoes.length > 0 && id && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm">
                  <div className="text-blue-600 font-semibold tabular-nums text-base">{estoqueTotal}</div>
                  <div className="text-blue-500 text-xs">unidades em estoque (total de {variacoes.length} variações)</div>
                </div>
              )}
              <Card title="Variações de cor / SKU">
                <div className="space-y-4">
                  {!ro && variacoes.length > 1 && (
                    <div className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <Label>Aplicar valor a todas as variações (R$)</Label>
                        <Input type="number" min="0" step="0.01" placeholder="0,00"
                          value={valorAplicarTodos} onChange={e => setValorAplicarTodos(e.target.value)} />
                      </div>
                      <button type="button" onClick={handleAplicarTodos}
                        className="h-9 px-4 rounded-md bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors shrink-0">
                        Aplicar
                      </button>
                    </div>
                  )}
                  {variacoes.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      <p>Nenhuma variação cadastrada</p>
                      <p className="text-xs mt-1 text-gray-300">Use variações para produtos com diferentes cores — cada variação rastreia estoque individualmente</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className={cn('grid gap-2 px-1 pb-1 border-b border-gray-100', id ? 'grid-cols-[32px_1fr_130px_100px_32px]' : 'grid-cols-[32px_1fr_130px_32px]')}>
                        <div />
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Cor / Nome</span>
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Valor (R$)</span>
                        {id && <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide text-right">Estoque</span>}
                        <div />
                      </div>
                      {variacoes.map(vari => (
                        <VariacaoRow key={vari.localId} vari={vari} ro={ro} showEstoque={!!id}
                          onRemove={handleRemoveVariacao} onFieldChange={handleVariacaoField} />
                      ))}
                    </div>
                  )}
                  {!ro && (
                    <button type="button" onClick={handleAddVariacao}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors w-full justify-center">
                      <Plus size={13} /> Adicionar variação
                    </button>
                  )}
                  {variacoes.length > 0 && (
                    <p className="text-[11px] text-gray-400 pt-1">
                      O estoque de cada variação é atualizado automaticamente pelos pedidos de compra e ordens de produção.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ═══ ABA: CUSTOS ══════════════════════════════════════════════════ */}
          {activeTab === 'custos' && (
            <div className="max-w-2xl space-y-4">
              <Card title="Precificação e custos">
                <div className="space-y-4">
                  <div>
                    <Label>Custo padrão (R$)</Label>
                    <Input name="custoPadrao" ro={ro} type="number" min="0" step="0.01"
                      value={f.custoPadrao} placeholder="0,00" onChange={handleChange} />
                    <p className="mt-1 text-[11px] text-gray-400">Custo médio calculado a partir das entradas de estoque. Ajuste manual permitido.</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <Label>Custo da última compra (R$)</Label>
                    <Input name="custoUltimaCompra" ro={ro} type="number" min="0" step="0.01"
                      value={f.custoUltimaCompra} placeholder="0,00" onChange={handleChange} />
                  </div>
                  {f.dataUltimaCompra ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div>
                        <p className="text-[11px] text-gray-400">Data da última compra</p>
                        <p className="text-sm font-medium text-gray-700 mt-0.5">
                          {new Date(f.dataUltimaCompra + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">A data da última compra é preenchida automaticamente ao confirmar um pedido de compra.</p>
                  )}
                  {(f.custoPadrao || f.custoUltimaCompra) && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {f.custoPadrao && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <p className="text-[11px] text-blue-500 font-medium">Custo padrão (médio)</p>
                          <p className="text-lg font-bold text-blue-700 mt-0.5 tabular-nums">
                            R$ {parseFloat(f.custoPadrao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                      {f.custoUltimaCompra && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-[11px] text-gray-500 font-medium">Última compra</p>
                          <p className="text-lg font-bold text-gray-700 mt-0.5 tabular-nums">
                            R$ {parseFloat(f.custoUltimaCompra).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

// ─── Sub-componentes memoizados das listas ────────────────────────────────────

const FornecedorRow = memo(function FornecedorRow({
  forn, ro, unidades, unidadeMedidaId, onSetPrincipal, onRemove, onFieldChange,
}: {
  forn: FornecedorLocal; ro: boolean;
  unidades: Option[]; unidadeMedidaId: string;
  onSetPrincipal: (id: string) => void;
  onRemove: (id: string) => void;
  onFieldChange: (id: string, field: keyof FornecedorLocal, value: string) => void;
}) {
  const handlePrincipal = useCallback((_v: boolean) => onSetPrincipal(forn.localId), [forn.localId, onSetPrincipal]);
  const handleRemove    = useCallback(() => onRemove(forn.localId), [forn.localId, onRemove]);
  const handleCodigo    = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(forn.localId, 'codigoFornecedor', e.target.value), [forn.localId, onFieldChange]);
  const handlePreco     = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(forn.localId, 'precoUltimaCompra', e.target.value), [forn.localId, onFieldChange]);
  const handleUnidade   = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => onFieldChange(forn.localId, 'unidadeMedidaCompraId', e.target.value), [forn.localId, onFieldChange]);
  const handleFator     = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(forn.localId, 'fatorConversao', e.target.value), [forn.localId, onFieldChange]);

  const temConversao = !!forn.unidadeMedidaCompraId && forn.unidadeMedidaCompraId !== unidadeMedidaId;
  const ue = unidades.find(u => u.id === unidadeMedidaId);
  const uc = unidades.find(u => u.id === forn.unidadeMedidaCompraId);
  const fator = parseFloat(forn.fatorConversao) || 1;

  return (
    <div className={cn('rounded-lg border p-3 space-y-3 transition-colors', forn.principal ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white')}>

      {/* Cabeçalho: nome + principal + remover */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-800 truncate">{forn.nome}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">Principal</span>
          <Toggle checked={forn.principal} onChange={handlePrincipal} disabled={ro} />
          {!ro && (
            <button type="button" onClick={handleRemove} className="text-gray-300 hover:text-red-400 transition-colors ml-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Campos principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <Label>Código no fornecedor</Label>
          <Input ro={ro} value={forn.codigoFornecedor} placeholder="Opcional" onChange={handleCodigo} />
        </div>
        <div>
          <Label>Preço última compra (R$)</Label>
          <Input ro={ro} type="number" min="0" step="0.01" value={forn.precoUltimaCompra} placeholder="0,00" onChange={handlePreco} />
        </div>
      </div>

      {/* Conversão de unidades */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label>Unidade de compra deste fornecedor</Label>
            <div className="relative">
              <select
                disabled={ro}
                value={forn.unidadeMedidaCompraId}
                onChange={handleUnidade}
                className={cn(inputCls(false, ro), 'appearance-none pr-8', !ro && 'cursor-pointer')}
              >
                <option value="">Mesma que estoque{ue ? ` (${ue.extra})` : ''}</option>
                {unidades.filter(u => u.id !== unidadeMedidaId).map(u => (
                  <option key={u.id} value={u.id}>{u.nome} ({u.extra})</option>
                ))}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {temConversao && (
            <div className="w-32 shrink-0">
              <Label>Fator</Label>
              <Input ro={ro} type="number" min="0.0001" step="0.0001"
                value={forn.fatorConversao} placeholder="1" onChange={handleFator} />
            </div>
          )}
        </div>

        {/* Fórmula visual */}
        {temConversao && uc && ue && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700 font-medium w-fit">
            <span>1 {uc.extra}</span>
            <span className="text-blue-400 font-normal">=</span>
            <span>{fator % 1 === 0 ? fator : Number(fator.toFixed(6)).toString()} {ue.extra}</span>
          </div>
        )}
      </div>

    </div>
  );
});

const VariacaoRow = memo(function VariacaoRow({
  vari, ro, showEstoque, onRemove, onFieldChange,
}: {
  vari: VariacaoLocal; ro: boolean; showEstoque: boolean;
  onRemove: (id: string) => void;
  onFieldChange: (id: string, field: keyof VariacaoLocal, value: string) => void;
}) {
  const handleRemove = useCallback(() => onRemove(vari.localId), [vari.localId, onRemove]);
  const handleCor    = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(vari.localId, 'codigoHex', e.target.value), [vari.localId, onFieldChange]);
  const handleNome   = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(vari.localId, 'nome', e.target.value), [vari.localId, onFieldChange]);
  const handleValor  = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onFieldChange(vari.localId, 'valor', e.target.value), [vari.localId, onFieldChange]);

  return (
    <div className={cn('grid gap-2 items-center py-1.5', showEstoque ? 'grid-cols-[32px_1fr_130px_100px_32px]' : 'grid-cols-[32px_1fr_130px_32px]')}>
      <input type="color" disabled={ro} value={vari.codigoHex} onChange={handleCor}
        className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white disabled:cursor-default" title="Escolher cor" />
      <Input ro={ro} value={vari.nome} placeholder="Ex: Azul Royal" onChange={handleNome} />
      <Input ro={ro} type="number" min="0" step="0.01" value={vari.valor} placeholder="0,00" onChange={handleValor} />
      {showEstoque && (
        <div className="text-right">
          <span className={cn('text-sm font-semibold tabular-nums', vari.estoqueAtual === 0 ? 'text-gray-300' : 'text-gray-700')}>
            {vari.estoqueAtual}
          </span>
        </div>
      )}
      {!ro ? (
        <button type="button" onClick={handleRemove}
          className="flex items-center justify-center w-8 h-8 text-gray-300 hover:text-red-400 transition-colors rounded-md hover:bg-red-50">
          <Trash2 size={14} />
        </button>
      ) : <div />}
    </div>
  );
});
