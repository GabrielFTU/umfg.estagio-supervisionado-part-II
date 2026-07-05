import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Save, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

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

function Toggle({ checked, onChange, disabled, color = '#1D4E89' }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0',
        disabled && 'opacity-60 cursor-default',
      )}
      style={{ backgroundColor: checked ? color : '#e5e7eb' }}
    >
      <span className={cn(
        'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-[17px]' : 'translate-x-0',
      )} />
    </button>
  );
}

const underline = (error?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
  error ? 'border-red-400' : 'border-gray-300 focus:border-[#1D4E89]',
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
  const [confirmOpen, setConfirmOpen]         = useState(false);

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

  const execSave = async () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (modo === 'editar') { setConfirmOpen(true); return; }
    execSave();
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
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/cadastros/unidades')} className="hover:text-gray-600 transition-colors">
            Unidades de Medida
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto px-6 py-6">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Nome + Sigla */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                Nome {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                disabled={readonly}
                value={nome}
                onChange={e => { setNome(e.target.value); clearFieldError('nome'); }}
                placeholder="Ex: Quilograma"
                maxLength={100}
                className={underline(fieldErrors.nome)}
              />
              {fieldErrors.nome && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.nome}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Sigla {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                disabled={readonly}
                value={sigla}
                onChange={e => { setSigla(e.target.value); clearFieldError('sigla'); }}
                placeholder="Ex: kg"
                maxLength={10}
                className={cn(underline(fieldErrors.sigla), 'font-mono')}
              />
              {fieldErrors.sigla && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.sigla}</p>
              )}
            </div>
          </div>

          {/* Grandeza + Fator de Conversão */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Grandeza {!readonly && <span className="text-red-400">*</span>}
              </label>
              {readonly ? (
                <p className="h-9 flex items-center text-sm text-gray-700">{grandezaLabel}</p>
              ) : (
                <select
                  value={grandeza}
                  onChange={e => setGrandeza(Number(e.target.value))}
                  className={underline()}
                >
                  {GRANDEZA_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Fator de Conversão {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                type="number"
                step="any"
                min="0.000001"
                disabled={readonly}
                value={fatorConversao}
                onChange={e => { setFatorConversao(e.target.value); clearFieldError('fatorConversao'); }}
                placeholder="Ex: 1"
                className={cn(underline(fieldErrors.fatorConversao), 'font-mono')}
              />
              {fieldErrors.fatorConversao && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.fatorConversao}</p>
              )}
            </div>
          </div>

          {/* É Unidade Base */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-700">Unidade Base</p>
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
              <Toggle checked={ehUnidadeBase} onChange={setEhUnidadeBase} color="#8B5CF6" />
            )}
          </div>

          {modo === 'editar' && (
            <div className="flex items-center gap-1.5 py-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">Ativo?</span>
              <Toggle checked={ativo} onChange={setAtivo} />
            </div>
          )}

          {/* Status read-only */}
          {modo === 'visualizar' && (
            <div className="flex items-center gap-2 py-2">
              <span className="text-xs text-gray-500">Status:</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                {ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/cadastros/unidades')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {readonly ? 'Voltar' : 'Cancelar'}
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/cadastros/unidades/${id}/editar`)}
              className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors"
            >
              <Pencil size={13} /> Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving
                ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                : <span className="flex items-center gap-1.5"><Save size={13} /> Salvar</span>
              }
            </button>
          )}
        </div>
      </form>

      <ModalMsg
        aberto={confirmOpen}
        variante="aviso"
        titulo="Salvar alterações?"
        descricao="Os dados da unidade de medida serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
