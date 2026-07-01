import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Home, ChevronRight, Save, X, ChevronDown,
  ChevronUp, User, Building2, Check, Pencil, Loader2,
} from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';
import { DatePicker } from '@/components/ui/DatePicker';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tipo  = 'fisica' | 'juridica';
type Papel = 'Cliente' | 'Fornecedor' | 'Colaborador' | 'Vendedor';
type Sexo  = 'NaoInformado' | 'Masculino' | 'Feminino' | 'Outro';
type Modo  = 'criar' | 'editar' | 'visualizar';

const PAPEIS: Papel[] = ['Cliente', 'Fornecedor', 'Colaborador', 'Vendedor'];

// [Flags]: Cliente=1, Colaborador=2, Fornecedor=4, Vendedor=8
const PAPEL_ENUM: Record<Papel, number> = {
  Cliente: 1, Colaborador: 2, Fornecedor: 4, Vendedor: 8,
};

function decodePapeis(flags: number): Papel[] {
  return (Object.entries(PAPEL_ENUM) as [Papel, number][])
    .filter(([, bit]) => flags & bit)
    .map(([papel]) => papel);
}

const SEXO_ENUM = ['NaoInformado', 'Masculino', 'Feminino', 'Outro'] as const;

// ─── CPF — validação Módulo 11 ────────────────────────────────────────────────

function validarCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +d[i] * (10 - i);
  let r = 11 - (s % 11);
  if (r >= 10) r = 0;
  if (r !== +d[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +d[i] * (11 - i);
  r = 11 - (s % 11);
  if (r >= 10) r = 0;
  return r === +d[10];
}

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
             'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

// ─── Estilos base ─────────────────────────────────────────────────────────────

const inputCls = (err?: boolean, ro?: boolean) => cn(
  'w-full h-8 px-3 text-sm text-gray-800 rounded-md border bg-white transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/25 focus:border-[#1D4E89]',
  'placeholder:text-gray-300',
  ro  ? 'bg-gray-50 cursor-default border-gray-100' :
  err ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 hover:border-gray-300',
);

// ─── Field wrapper ────────────────────────────────────────────────────────────

// span = colunas em lg (grid de 12). Padrão = 3 (25%).
const SPAN_CLS: Record<number, string> = {
  2:  'col-span-full sm:col-span-1 lg:col-span-2',
  3:  'col-span-full sm:col-span-1 lg:col-span-3',
  4:  'col-span-full sm:col-span-2 lg:col-span-4',
  5:  'col-span-full sm:col-span-2 lg:col-span-5',
  6:  'col-span-full sm:col-span-2 lg:col-span-6',
  12: 'col-span-full',
};

function Field({ label, required, error, span, children }: {
  label: string; required?: boolean; error?: string;
  span?: 2 | 3 | 4 | 5 | 6 | 12; children: React.ReactNode;
}) {
  return (
    <div className={span ? SPAN_CLS[span] : 'col-span-full sm:col-span-1 lg:col-span-3'}>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5 font-bold" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

function Sel({ error, readOnly, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string; readOnly?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(inputCls(!!error, readOnly), 'appearance-none pr-8', !readOnly && 'cursor-pointer')}
        disabled={readOnly}
        {...p}
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ─── Multi-select Papéis ──────────────────────────────────────────────────────

function PapelMultiSelect({ value, onChange, error, readOnly }: {
  value: Papel[]; onChange: (v: Papel[]) => void; error?: string; readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const toggle = (p: Papel) =>
    onChange(value.includes(p) ? value.filter(v => v !== p) : [...value, p]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && setOpen(v => !v)}
        className={cn(
          'w-full min-h-8 px-3 py-1 text-sm rounded-md border bg-white text-left',
          'flex items-center flex-wrap gap-1.5 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/25',
          readOnly ? 'bg-gray-50 border-gray-100 cursor-default' :
          open ? 'border-[#1D4E89]' : error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300',
        )}
      >
        {value.length === 0
          ? <span className="text-gray-300 text-sm">Selecione…</span>
          : value.map(p => (
              <span key={p} className="flex items-center gap-1 text-xs bg-[#EAF1FB] text-[#1D4E89] font-medium px-2 py-0.5 rounded-md">
                {p}
                {!readOnly && (
                  <span role="button" tabIndex={-1}
                    onClick={e => { e.stopPropagation(); toggle(p); }}
                    className="ml-0.5 cursor-pointer hover:text-red-400 transition-colors">
                    <X size={10} />
                  </span>
                )}
              </span>
            ))}
        {!readOnly && (
          <ChevronDown size={13} className={cn('ml-auto text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
        )}
      </button>

      {open && !readOnly && (
        <div className="absolute z-30 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1">
          {PAPEIS.map(p => {
            const checked = value.includes(p);
            return (
              <button key={p} type="button" onClick={() => toggle(p)}
                className={cn('w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors',
                  checked ? 'bg-[#EAF1FB] text-[#1D4E89]' : 'text-gray-700 hover:bg-gray-50')}>
                <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                  checked ? 'bg-[#1D4E89] border-[#1D4E89]' : 'border-gray-300')}>
                  {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                {p}
              </button>
            );
          })}
        </div>
      )}

      {error && !readOnly && (
        <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Section colapsável ───────────────────────────────────────────────────────

function Section({ title, open: defaultOpen = true, children }: {
  title: string; open?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-100 first:border-t-0 pt-1">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-2 text-left">
        <span className="flex items-center gap-2.5">
          <span className="w-[3px] h-4 rounded-full bg-[#1D4E89]" />
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </span>
        {open ? <ChevronUp size={14} className="text-gray-400" />
               : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && (
        <div className="pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Form state vazio ─────────────────────────────────────────────────────────

const emptyForm = {
  nome: '', nomeFantasia: '',
  email: '', telefone: '', celular: '', observacoes: '',
  cep: '', logradouro: '', numero: '', complemento: '',
  bairro: '', cidade: '', uf: '',
  cpf: '', rg: '', orgaoExpedidor: '', dataNascimento: '', sexo: 'NaoInformado' as Sexo,
  cnpj: '', inscricaoEstadual: '', inscricaoMunicipal: '',
  responsavelNome: '', responsavelCpf: '',
};

// ─── Página ───────────────────────────────────────────────────────────────────

export function PessoaFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();
  const { tipo: tipoParam, id } = useParams<{ tipo?: string; id?: string }>();

  const modo: Modo = !id ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar'
    : 'visualizar';

  const ro   = modo === 'visualizar';
  const roId = ro || modo === 'editar'; // CPF / RG / CNPJ imutáveis após criação

  const [tipo, setTipo]       = useState<Tipo>(tipoParam === 'juridica' ? 'juridica' : 'fisica');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!id);
  const [loadingCep, setLoadingCep]   = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [papeis, setPapeis]   = useState<Papel[]>([]);
  const [f, setF]             = useState(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  // Carrega dados existentes quando há id
  useEffect(() => {
    if (!id || !tipoParam) return;
    const load = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem('token');
        const url = tipoParam === 'fisica'
          ? `/api/PessoasFisicas/${id}`
          : `/api/PessoasJuridicas/${id}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const d = await res.json();

        setTipo(tipoParam as Tipo);
        setPapeis(decodePapeis(d.papelPessoa));

        const end = d.endereco ?? {};
        if (tipoParam === 'fisica') {
          setF({
            nome: d.nome ?? '', nomeFantasia: d.nomeFantasia ?? '',
            email: d.email ?? '', telefone: d.telefone ?? '', celular: d.celular ?? '',
            observacoes: d.observacoes ?? '',
            cep: end.cep ?? '', logradouro: end.logradouro ?? '',
            numero: end.numero ?? '', complemento: end.complemento ?? '',
            bairro: end.bairro ?? '', cidade: end.cidade ?? '', uf: end.uf ?? '',
            cpf: d.cpf ?? '', rg: d.rg ?? '', orgaoExpedidor: d.orgaoExpedidor ?? '',
            dataNascimento: d.dataNascimento ?? '',
            sexo: (SEXO_ENUM[d.sexo] ?? 'NaoInformado') as Sexo,
            cnpj: '', inscricaoEstadual: '', inscricaoMunicipal: '',
            responsavelNome: '', responsavelCpf: '',
          });
        } else {
          setF({
            nome: d.razaoSocial ?? '', nomeFantasia: d.nomeFantasia ?? '',
            email: d.email ?? '', telefone: d.telefone ?? '', celular: d.celular ?? '',
            observacoes: d.observacoes ?? '',
            cep: end.cep ?? '', logradouro: end.logradouro ?? '',
            numero: end.numero ?? '', complemento: end.complemento ?? '',
            bairro: end.bairro ?? '', cidade: end.cidade ?? '', uf: end.uf ?? '',
            cpf: '', rg: '', orgaoExpedidor: '', dataNascimento: '', sexo: 'NaoInformado',
            cnpj: d.cnpj ?? '',
            inscricaoEstadual: d.inscricaoEstadual ?? '',
            inscricaoMunicipal: d.inscricaoMunicipal ?? '',
            responsavelNome: d.responsavelNome ?? '',
            responsavelCpf: d.responsavelCpf ?? '',
          });
        }
      } catch {
        setErrors({ _global: 'Não foi possível carregar os dados.' });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id, tipoParam]);

  // ── ViaCEP ───────────────────────────────────────────────────────────────────
  const handleCepBlur = async () => {
    const digits = f.cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setF(prev => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro:     data.bairro     || prev.bairro,
        cidade:     data.localidade || prev.cidade,
        uf:         data.uf         || prev.uf,
      }));
    } catch { /* silencia erros de rede */ }
    finally { setLoadingCep(false); }
  };

  // ── CPF em tempo real ────────────────────────────────────────────────────────
  const handleCpfAccept = (v: string) => {
    set('cpf', v);
    const digits = v.replace(/\D/g, '');
    if (digits.length === 0) {
      setErrors(prev => { const e = { ...prev }; delete e.cpf; return e; });
    } else if (digits.length === 11) {
      if (!validarCpf(v)) {
        setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      } else {
        setErrors(prev => { const e = { ...prev }; delete e.cpf; return e; });
      }
    }
  };

  const handleCpfBlur = () => {
    const digits = f.cpf.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 11) {
      setErrors(prev => ({ ...prev, cpf: 'CPF incompleto' }));
    } else if (digits.length === 11 && !validarCpf(f.cpf)) {
      setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
    }
  };

  // ── BrasilAPI — CNPJ ──────────────────────────────────────────────────────────
  const handleCnpjBlur = async () => {
    const digits = f.cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return;
    setLoadingCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
      if (!res.ok) {
        setErrors(prev => ({ ...prev, cnpj: 'CNPJ não encontrado na Receita Federal' }));
        return;
      }
      const data = await res.json();
      setErrors(prev => { const e = { ...prev }; delete e.cnpj; return e; });
      setF(prev => ({
        ...prev,
        nome:         prev.nome         || data.razao_social  || prev.nome,
        nomeFantasia: prev.nomeFantasia  || data.nome_fantasia || prev.nomeFantasia,
      }));
    } catch { /* silencia erros de rede */ }
    finally { setLoadingCnpj(false); }
  };

  // ── Validação ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.nome.trim()) e.nome = 'Campo obrigatório';
    if (!papeis.length) e.papel = 'Selecione ao menos um papel';
    if (tipo === 'fisica') {
      if (!f.cpf) e.cpf = 'Campo obrigatório';
      else if (!validarCpf(f.cpf)) e.cpf = 'CPF inválido';
    } else {
      if (!f.cnpj) e.cnpj = 'Campo obrigatório';
      else if (f.cnpj.replace(/\D/g, '').length !== 14) e.cnpj = 'CNPJ inválido';
    }
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'E-mail inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const execSave = async () => {
    setLoading(true);
    try {
      const papelEnum = papeis.reduce((acc, p) => acc | PAPEL_ENUM[p], 0);
      const end = f.cep ? {
        cep: f.cep.replace(/\D/g, ''), logradouro: f.logradouro || null,
        numero: f.numero || null, complemento: f.complemento || null,
        bairro: f.bairro || null, cidade: f.cidade || null, uf: f.uf || null, codigoIbge: null,
      } : null;
      const body = tipo === 'fisica'
        ? { nome: f.nome, cpf: f.cpf.replace(/\D/g, ''), papelPessoa: papelEnum,
            nomeFantasia: f.nomeFantasia || null, email: f.email || null,
            telefone: f.telefone.replace(/\D/g, '') || null,
            celular: f.celular.replace(/\D/g, '') || null,
            rg: f.rg || null, orgaoExpedidor: f.orgaoExpedidor || null,
            dataNascimento: f.dataNascimento || null,
            sexo: SEXO_ENUM.indexOf(f.sexo),
            observacoes: f.observacoes || null, endereco: end }
        : { razaoSocial: f.nome, cnpj: f.cnpj.replace(/\D/g, ''), papelPessoa: papelEnum,
            nomeFantasia: f.nomeFantasia || null, email: f.email || null,
            telefone: f.telefone.replace(/\D/g, '') || null,
            celular: f.celular.replace(/\D/g, '') || null,
            inscricaoEstadual: f.inscricaoEstadual || null,
            inscricaoMunicipal: f.inscricaoMunicipal || null,
            responsavelNome: f.responsavelNome || null,
            responsavelCpf: f.responsavelCpf.replace(/\D/g, '') || null,
            observacoes: f.observacoes || null, endereco: end };
      const isEdit = modo === 'editar';
      const url = tipo === 'fisica'
        ? `/api/PessoasFisicas${isEdit ? `/${id}` : ''}`
        : `/api/PessoasJuridicas${isEdit ? `/${id}` : ''}`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showToast();
      navigate('/cadastros/pessoas');
    } catch {
      setErrors(prev => ({ ...prev, _global: 'Não foi possível salvar. Tente novamente.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ro || !validate()) return;
    if (modo === 'editar') { setConfirmOpen(true); return; }
    execSave();
  };

  const tituloModo = modo === 'criar' ? 'Nova Pessoa'
    : modo === 'editar' ? 'Editar Pessoa'
    : 'Visualizar Pessoa';

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Breadcrumb ── */}
      <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <a href="/cadastros/pessoas" className="hover:text-[#1D4E89] transition-colors">Pessoas</a>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{tituloModo}</span>
        </div>
      </div>

      {/* ── Subheader: seletor de tipo + ações ── */}
      <div className="shrink-0 border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Seletor de tipo — bloqueado em editar/visualizar */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {([
              { v: 'fisica',   Icon: User,      label: 'Pessoa Física' },
              { v: 'juridica', Icon: Building2, label: 'Pessoa Jurídica' },
            ] as const).map(({ v, Icon, label }) => (
              <button
                key={v}
                type="button"
                disabled={modo !== 'criar'}
                onClick={() => { setTipo(v); setErrors({}); }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  tipo === v ? 'bg-white text-[#1D4E89] shadow-sm' : 'text-gray-500',
                  modo === 'criar' && tipo !== v && 'hover:text-gray-700',
                )}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-md border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <X size={14} /> {ro ? 'Fechar' : 'Cancelar'}
            </button>

            {ro ? (
              <button
                type="button"
                onClick={() => navigate(`/cadastros/pessoas/${tipoParam}/${id}/editar`)}
                className="flex items-center gap-1.5 h-9 px-5 rounded-md bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] shadow-sm transition-colors"
              >
                <Pencil size={14} /> Editar
              </button>
            ) : (
              <button
                form="pessoa-form"
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 h-9 px-5 rounded-md bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] disabled:opacity-60 shadow-sm transition-colors"
              >
                <Save size={14} />
                {loading ? 'Salvando…' : 'Salvar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Formulário ── */}
      <div className="flex-1 overflow-auto px-3 sm:px-6 py-5">

        {loadingData ? (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando dados…
          </div>
        ) : (
          <form id="pessoa-form" onSubmit={handleSubmit}>
            <div className="space-y-3">
              {errors._global && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                  {errors._global}
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm divide-y divide-gray-100 px-4 sm:px-6">

                {/* Dados Principais */}
                <Section title="Dados Principais">
                  <Field label={tipo === 'fisica' ? 'Nome Completo' : 'Razão Social'} required={!ro} error={errors.nome} span={5}>
                    <input className={inputCls(!!errors.nome, ro)} value={f.nome} readOnly={ro}
                      placeholder={tipo === 'fisica' ? 'João da Silva' : 'Empresa Ltda'}
                      onChange={e => set('nome', e.target.value)} />
                  </Field>

                  <Field label={tipo === 'fisica' ? 'Apelido' : 'Nome Fantasia'} span={3}>
                    <input className={inputCls(false, ro)} value={f.nomeFantasia} readOnly={ro}
                      placeholder="Opcional" onChange={e => set('nomeFantasia', e.target.value)} />
                  </Field>

                  <Field label="Papel" required={!ro} error={errors.papel} span={4}>
                    <PapelMultiSelect value={papeis} onChange={setPapeis} error={errors.papel} readOnly={ro} />
                  </Field>
                </Section>

                {/* Identificação PF */}
                {tipo === 'fisica' ? (
                  <Section title="Identificação · Pessoa Física">
                    <Field label="CPF" required={!roId} error={errors.cpf} span={3}>
                      <IMaskInput mask="000.000.000-00" value={f.cpf}
                        onAccept={!roId ? handleCpfAccept : (v: string) => set('cpf', v)}
                        onBlur={!roId ? handleCpfBlur : undefined}
                        placeholder="000.000.000-00" readOnly={roId}
                        className={inputCls(!!errors.cpf, roId)} />
                    </Field>

                    <Field label="RG" span={3}>
                      <IMaskInput mask="00.000.000-[*]" value={f.rg}
                        onAccept={(v: string) => set('rg', v)}
                        placeholder="00.000.000-0" readOnly={ro}
                        className={inputCls(false, ro)} />
                    </Field>

                    <Field label="Órgão Expedidor" span={2}>
                      <input className={inputCls(false, ro)} value={f.orgaoExpedidor}
                        readOnly={ro} placeholder="SSP/SP" maxLength={20}
                        onChange={e => set('orgaoExpedidor', e.target.value)} />
                    </Field>

                    <Field label="Data de Nascimento" span={2}>
                      <DatePicker value={f.dataNascimento} onChange={v => set('dataNascimento', v)} disabled={ro} />
                    </Field>

                    <Field label="Sexo" span={2}>
                      <Sel value={f.sexo} readOnly={ro} onChange={e => set('sexo', e.target.value)}>
                        <option value="NaoInformado">Não informado</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </Sel>
                    </Field>
                  </Section>
                ) : (
                  <Section title="Identificação · Pessoa Jurídica">
                    <Field label="CNPJ" required={!roId} error={errors.cnpj} span={4}>
                      <div className="relative">
                        <IMaskInput mask="00.000.000/0000-00" value={f.cnpj}
                          onAccept={(v: string) => set('cnpj', v)}
                          onBlur={!roId ? handleCnpjBlur : undefined}
                          placeholder="00.000.000/0000-00" readOnly={roId}
                          className={cn(inputCls(!!errors.cnpj, roId), loadingCnpj && 'pr-8')} />
                        {loadingCnpj && (
                          <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
                        )}
                      </div>
                      {loadingCnpj && (
                        <p className="mt-1 text-[11px] text-gray-400">Consultando Receita Federal…</p>
                      )}
                    </Field>

                    <Field label="Inscrição Estadual" span={4}>
                      <input className={inputCls(false, ro)} value={f.inscricaoEstadual}
                        readOnly={ro} placeholder="Opcional" maxLength={30}
                        onChange={e => set('inscricaoEstadual', e.target.value)} />
                    </Field>

                    <Field label="Inscrição Municipal" span={4}>
                      <input className={inputCls(false, ro)} value={f.inscricaoMunicipal}
                        readOnly={ro} placeholder="Opcional" maxLength={30}
                        onChange={e => set('inscricaoMunicipal', e.target.value)} />
                    </Field>

                    <Field label="Nome do Responsável" span={6}>
                      <input className={inputCls(false, ro)} value={f.responsavelNome}
                        readOnly={ro} placeholder="Nome completo" maxLength={150}
                        onChange={e => set('responsavelNome', e.target.value)} />
                    </Field>

                    <Field label="CPF do Responsável" span={3}>
                      <IMaskInput mask="000.000.000-00" value={f.responsavelCpf}
                        onAccept={(v: string) => set('responsavelCpf', v)}
                        placeholder="000.000.000-00" readOnly={ro}
                        className={inputCls(false, ro)} />
                    </Field>
                  </Section>
                )}

                {/* Contato */}
                <Section title="Contato">
                  <Field label="E-mail" error={errors.email} span={5}>
                    <input type="email" className={inputCls(!!errors.email, ro)} value={f.email}
                      readOnly={ro} placeholder="email@exemplo.com"
                      onChange={e => set('email', e.target.value)} />
                  </Field>

                  <Field label="Telefone" span={4}>
                    <IMaskInput mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
                      value={f.telefone} onAccept={(v: string) => set('telefone', v)}
                      placeholder="(00) 00000-0000" readOnly={ro}
                      className={inputCls(false, ro)} />
                  </Field>

                  <Field label="Celular / WhatsApp" span={3}>
                    <IMaskInput mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
                      value={f.celular} onAccept={(v: string) => set('celular', v)}
                      placeholder="(00) 00000-0000" readOnly={ro}
                      className={inputCls(false, ro)} />
                  </Field>
                </Section>

                {/* Endereço */}
                <Section title="Endereço" open={false}>
                  <Field label="CEP">
                    <div className="relative">
                      <IMaskInput mask="00000-000" value={f.cep}
                        onAccept={(v: string) => set('cep', v)}
                        onBlur={!ro ? handleCepBlur : undefined}
                        placeholder="00000-000" readOnly={ro}
                        className={cn(inputCls(false, ro), loadingCep && 'pr-8')} />
                      {loadingCep && (
                        <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
                      )}
                    </div>
                    {loadingCep && (
                      <p className="mt-1 text-[11px] text-gray-400">Consultando ViaCEP…</p>
                    )}
                  </Field>

                  <Field label="Logradouro" span={6}>
                    <input className={inputCls(false, ro)} value={f.logradouro} readOnly={ro}
                      placeholder="Rua / Av / Travessa…" onChange={e => set('logradouro', e.target.value)} />
                  </Field>

                  <Field label="Número" span={2}>
                    <input className={inputCls(false, ro)} value={f.numero} readOnly={ro}
                      placeholder="Nº" maxLength={10} onChange={e => set('numero', e.target.value)} />
                  </Field>

                  <Field label="Complemento" span={4}>
                    <input className={inputCls(false, ro)} value={f.complemento} readOnly={ro}
                      placeholder="Apto, Bloco, Sala…" onChange={e => set('complemento', e.target.value)} />
                  </Field>

                  <Field label="Bairro" span={4}>
                    <input className={inputCls(false, ro)} value={f.bairro} readOnly={ro}
                      placeholder="Bairro" onChange={e => set('bairro', e.target.value)} />
                  </Field>

                  <Field label="Cidade" span={4}>
                    <input className={inputCls(false, ro)} value={f.cidade} readOnly={ro}
                      placeholder="Cidade" onChange={e => set('cidade', e.target.value)} />
                  </Field>

                  <Field label="UF" span={2}>
                    <Sel value={f.uf} readOnly={ro} onChange={e => set('uf', e.target.value)}>
                      <option value="">—</option>
                      {UFS.map(u => <option key={u} value={u}>{u}</option>)}
                    </Sel>
                  </Field>
                </Section>

                {/* Observações */}
                <Section title="Observações" open={false}>
                  <Field label="Anotações internas" span={12}>
                    <textarea rows={4} readOnly={ro}
                      className={cn(
                        'w-full px-3 py-2.5 text-sm text-gray-800 rounded-md border transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/25 focus:border-[#1D4E89]',
                        'resize-none placeholder:text-gray-300',
                        ro ? 'bg-gray-50 border-gray-100 cursor-default'
                           : 'border-gray-200 hover:border-gray-300',
                      )}
                      placeholder="Informações complementares (opcional)…"
                      value={f.observacoes}
                      onChange={e => set('observacoes', e.target.value)}
                    />
                  </Field>
                </Section>

              </div>
            </div>
          </form>
        )}
      </div>

      <ModalMsg
        aberto={confirmOpen}
        variante="aviso"
        titulo="Salvar alterações?"
        descricao="Os dados da pessoa serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
