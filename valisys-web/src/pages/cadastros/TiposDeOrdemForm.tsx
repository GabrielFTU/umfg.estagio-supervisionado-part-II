import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Save, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

type Modo = 'criar' | 'editar' | 'visualizar';

type TipoDeOrdemData = {
  id: string;
  codigo: string | null;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

function Toggle({ checked, onChange, disabled }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0',
        checked ? 'bg-[#3B82F6]' : 'bg-gray-200',
        disabled && 'opacity-60 cursor-default',
      )}>
      <span className={cn('absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-[17px]' : 'translate-x-0',
      )} />
    </button>
  );
}

const underline = (error?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
  error ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
);

export function TiposDeOrdemFormPage() {
  const { id }    = useParams<{ id: string }>();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { showToast } = useToast();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';

  const readonly = modo === 'visualizar';

  const [loading, setLoading]       = useState(!!id);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [nome, setNome]           = useState('');
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo]       = useState('');
  const [ativo, setAtivo]         = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTipoDeOrdem = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/tipos-ordem-producao/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: TipoDeOrdemData = await res.json();
        setNome(data.nome);
        setDescricao(data.descricao ?? '');
        setCodigo(data.codigo ?? '');
        setAtivo(data.ativo);
      } catch {
        setError('Não foi possível carregar o tipo de ordem.');
      } finally {
        setLoading(false);
      }
    };
    fetchTipoDeOrdem();
  }, [id]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!codigo.trim()) erros.codigo = 'O código é obrigatório.';
    else if (codigo.trim().length > 10) erros.codigo = 'Máximo de 10 caracteres.';
    if (!nome.trim()) erros.nome = 'O nome é obrigatório.';
    else if (nome.trim().length > 100) erros.nome = 'Máximo de 100 caracteres.';
    if (descricao.length > 500) erros.descricao = 'Máximo de 500 caracteres.';
    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const execSave = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = modo === 'criar'
        ? await fetch('/api/tipos-ordem-producao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              codigo: codigo.trim(),
              nome: nome.trim(),
              descricao: descricao.trim() || undefined,
            }),
          })
        : await fetch(`/api/tipos-ordem-producao/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, nome: nome.trim(), descricao: descricao.trim() || undefined, codigo, ativo }),
          });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Erro ao salvar tipo de ordem.');
      }
      showToast();
      navigate('/cadastros/tipos-ordem');
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
    criar:      'Novo Tipo de Ordem',
    editar:     'Editar Tipo de Ordem',
    visualizar: 'Dados do Tipo de Ordem',
  };

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
          <button onClick={() => navigate('/cadastros/tipos-ordem')} className="hover:text-gray-600 transition-colors">
            Tipos de Ordem
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

          {/* Código */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">
              Código {!readonly && <span className="text-red-400">*</span>}
            </label>
            <input
              disabled={readonly}
              value={codigo}
              onChange={e => { setCodigo(e.target.value); clearErr('codigo'); }}
              placeholder="Ex: TP01"
              maxLength={10}
              className={underline(fieldErrors.codigo)}
            />
            {fieldErrors.codigo && (
              <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.codigo}</p>
            )}
          </div>

          {/* Nome */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">
              Nome {!readonly && <span className="text-red-400">*</span>}
            </label>
            <input
              disabled={readonly}
              value={nome}
              onChange={e => { setNome(e.target.value); clearErr('nome'); }}
              placeholder="Ex: Produção Normal"
              maxLength={100}
              className={underline(fieldErrors.nome)}
            />
            {fieldErrors.nome && (
              <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">Descrição</label>
            <textarea
              disabled={readonly}
              value={descricao}
              onChange={e => { setDescricao(e.target.value); clearErr('descricao'); }}
              placeholder={readonly ? '—' : 'Descreva a finalidade deste tipo de ordem…'}
              rows={3}
              maxLength={500}
              className={cn(
                'w-full bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300 resize-none pt-1',
                fieldErrors.descricao ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
                readonly && 'opacity-60 cursor-default',
              )}
            />
            {fieldErrors.descricao && (
              <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.descricao}</p>
            )}
          </div>

          {/* Status — modo editar */}
          {modo === 'editar' && (
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">Ativo?</span>
              <Toggle checked={ativo} onChange={setAtivo} />
            </div>
          )}

          {/* Status — modo visualizar */}
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
            onClick={() => navigate('/cadastros/tipos-ordem')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {readonly ? 'Voltar' : 'Cancelar'}
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/cadastros/tipos-ordem/${id}/editar`)}
              className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors"
            >
              <Pencil size={13} /> Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
        descricao="Os dados do tipo de ordem serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
