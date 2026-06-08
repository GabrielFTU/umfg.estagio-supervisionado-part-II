import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Ruler, Save, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

type Modo = 'criar' | 'editar' | 'visualizar';

const GRANDEZA_OPTIONS = [
  { value: 0, label: 'Unidade' },
  { value: 1, label: 'Massa' },
  { value: 2, label: 'Comprimento' },
  { value: 3, label: 'Volume' },
  { value: 4, label: 'Tempo' },
  { value: 5, label: 'Área' },
];

type UnidadeData = {
  id: string;
  nome: string;
  sigla: string;
  grandeza: number;
  fatorConversao: number;
  ehUnidadeBase: boolean;
  ativo: boolean;
};

function Field({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (error?: string) => cn(
  'w-full h-9 px-3 text-sm border rounded-md transition-all',
  'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
  'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
  error ? 'border-red-400' : 'border-gray-300',
);

export function UnidadeMedidaFormPage() {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';

  const readonly = modo === 'visualizar';

  const [loading, setLoading]             = useState(!!id);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [fieldErrors, setFieldErrors]     = useState<Record<string, string>>({});

  const [nome, setNome]                       = useState('');
  const [sigla, setSigla]                     = useState('');
  const [grandeza, setGrandeza]               = useState(0);
  const [fatorConversao, setFatorConversao]   = useState('1');
  const [ehUnidadeBase, setEhUnidadeBase]     = useState(false);
  const [ativo, setAtivo]                     = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/UnidadesMedida/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: UnidadeData = await res.json();
        setNome(data.nome);
        setSigla(data.sigla);
        setGrandeza(data.grandeza);
        setFatorConversao(String(data.fatorConversao));
        setEhUnidadeBase(data.ehUnidadeBase);
        setAtivo(data.ativo);
      } catch {
        setError('Não foi possível carregar a unidade de medida.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!nome.trim()) erros.nome = 'O nome é obrigatório.';
    else if (nome.trim().length > 100) erros.nome = 'Máximo de 100 caracteres.';
    if (!sigla.trim()) erros.sigla = 'A sigla é obrigatória.';
    else if (sigla.trim().length > 10) erros.sigla = 'Máximo de 10 caracteres.';
    const fator = parseFloat(fatorConversao);
    if (!fatorConversao.trim() || isNaN(fator) || fator <= 0)
      erros.fatorConversao = 'O fator deve ser um número positivo.';
    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const clearFieldError = (field: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const body = {
        nome:            nome.trim(),
        sigla:           sigla.trim(),
        grandeza,
        fatorConversao:  parseFloat(fatorConversao),
        ehUnidadeBase,
      };

      const res = modo === 'criar'
        ? await fetch('/api/UnidadesMedida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/UnidadesMedida/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, ...body, ativo }),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar unidade de medida.');
      }

      showToast();
      navigate('/cadastros/unidades');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const titulo: Record<Modo, string> = {
    criar:      'Nova Unidade de Medida',
    editar:     'Editar Unidade de Medida',
    visualizar: 'Unidade de Medida',
  };

  const grandezaLabel = GRANDEZA_OPTIONS.find(o => o.value === grandeza)?.label ?? '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <button
            onClick={() => navigate('/cadastros/unidades')}
            className="hover:text-gray-600 transition-colors"
          >
            Unidades de Medida
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Ruler size={20} className="text-[#3B82F6]" />
            </div>
            <h1 className="text-base font-semibold text-gray-800">{titulo[modo]}</h1>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-xl border border-gray-200/70 shadow-sm overflow-hidden">
              <div className="p-5 space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <Field label="Nome" required={!readonly} error={fieldErrors.nome}>
                      <input
                        disabled={readonly}
                        value={nome}
                        onChange={e => { setNome(e.target.value); clearFieldError('nome'); }}
                        placeholder="Ex: Quilograma"
                        maxLength={100}
                        className={inputCls(fieldErrors.nome)}
                      />
                    </Field>
                  </div>

                  {/* Sigla */}
                  <Field label="Sigla" required={!readonly} error={fieldErrors.sigla}>
                    <input
                      disabled={readonly}
                      value={sigla}
                      onChange={e => { setSigla(e.target.value); clearFieldError('sigla'); }}
                      placeholder="Ex: kg"
                      maxLength={10}
                      className={cn(inputCls(fieldErrors.sigla), 'font-mono')}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Grandeza */}
                  <Field label="Grandeza" required={!readonly}>
                    {readonly ? (
                      <div className={cn(inputCls(), 'flex items-center')}>
                        <span className="text-gray-600">{grandezaLabel}</span>
                      </div>
                    ) : (
                      <select
                        value={grandeza}
                        onChange={e => setGrandeza(Number(e.target.value))}
                        className={cn(inputCls(), 'appearance-none')}
                      >
                        {GRANDEZA_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    )}
                  </Field>

                  {/* Fator de Conversão */}
                  <Field label="Fator de Conversão" required={!readonly} error={fieldErrors.fatorConversao}>
                    <input
                      type="number"
                      step="any"
                      min="0.000001"
                      disabled={readonly}
                      value={fatorConversao}
                      onChange={e => { setFatorConversao(e.target.value); clearFieldError('fatorConversao'); }}
                      placeholder="Ex: 1"
                      className={cn(inputCls(fieldErrors.fatorConversao), 'font-mono')}
                    />
                  </Field>
                </div>

                {/* É Unidade Base */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Unidade Base</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Unidade de referência para esta grandeza (fator = 1)
                    </p>
                  </div>
                  {readonly ? (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      ehUnidadeBase ? 'bg-violet-50 text-violet-600' : 'bg-gray-100 text-gray-500')}>
                      {ehUnidadeBase ? 'Sim' : 'Não'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEhUnidadeBase(v => !v)}
                      className={cn(
                        'relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200',
                        ehUnidadeBase ? 'bg-violet-500' : 'bg-gray-200',
                      )}
                    >
                      <span className={cn(
                        'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                        ehUnidadeBase ? 'translate-x-[17px]' : 'translate-x-0',
                      )} />
                    </button>
                  )}
                </div>

                {/* Status toggle — modo editar */}
                {modo === 'editar' && (
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Status</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {ativo ? 'Unidade ativa e disponível' : 'Unidade inativa'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAtivo(v => !v)}
                      className={cn(
                        'relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200',
                        ativo ? 'bg-[#3B82F6]' : 'bg-gray-200',
                      )}
                    >
                      <span className={cn(
                        'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                        ativo ? 'translate-x-[17px]' : 'translate-x-0',
                      )} />
                    </button>
                  </div>
                )}

                {/* Status read-only */}
                {modo === 'visualizar' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">Status:</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                      {ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                {readonly ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/cadastros/unidades')}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/cadastros/unidades/${id}/editar`)}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563eb] transition-colors"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/cadastros/unidades')}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X size={13} /> Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      {saving ? 'Salvando…' : 'Salvar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
