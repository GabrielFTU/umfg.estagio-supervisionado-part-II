import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Save, X, Pencil } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

type Modo = 'criar' | 'editar' | 'visualizar';

type AlmoxarifadoData = {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string;
  responsavel: string;
  contato: string | null;
  email: string | null;
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
        checked ? 'bg-[#1D4E89]' : 'bg-gray-200',
        disabled && 'opacity-60 cursor-default',
      )}
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

export function AlmoxarifadoFormPage() {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';

  const readonly = modo === 'visualizar';

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [nome, setNome]               = useState('');
  const [descricao, setDescricao]     = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [contato, setContato]         = useState('');
  const [email, setEmail]             = useState('');
  const [ativo, setAtivo]             = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAlmoxarifado = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/almoxarifados/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: AlmoxarifadoData = await res.json();
        setNome(data.nome);
        setDescricao(data.descricao ?? '');
        setLocalizacao(data.localizacao);
        setResponsavel(data.responsavel);
        setContato(data.contato ?? '');
        setEmail(data.email ?? '');
        setAtivo(data.ativo);
      } catch {
        setError('Não foi possível carregar o almoxarifado.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlmoxarifado();
  }, [id]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!nome.trim())        erros.nome        = 'O nome é obrigatório.';
    else if (nome.trim().length > 100) erros.nome = 'Máximo de 100 caracteres.';
    if (!localizacao.trim()) erros.localizacao = 'A localização é obrigatória.';
    else if (localizacao.trim().length > 100) erros.localizacao = 'Máximo de 100 caracteres.';
    if (!descricao.trim()) erros.descricao = 'A Descrição é obrigatória.';
    else if (descricao.trim().length > 255) erros.descricao = 'Máximo de 255 caracteres.';
    if (!responsavel.trim()) erros.responsavel = 'O responsável é obrigatório.';
    else if (responsavel.trim().length > 100) erros.responsavel = 'Máximo de 100 caracteres.';
    if (contato && contato.length > 20) erros.contato = 'Máximo de 20 caracteres.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = 'E-mail inválido.';
    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const execSave = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const body = {
        nome:        nome.trim(),
        descricao:   descricao.trim(),
        localizacao: localizacao.trim(),
        responsavel: responsavel.trim(),
        contato:     contato.trim() || undefined,
        email:       email.trim() || undefined,
      };
      const res = modo === 'criar'
        ? await fetch('/api/almoxarifados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/almoxarifados/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, ...body, ativo }),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar almoxarifado.');
      }
      showToast();
      navigate('/cadastros/almoxarifados');
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
    criar:      'Novo Almoxarifado',
    editar:     'Dados do almoxarifado',
    visualizar: 'Dados do almoxarifado',
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
          <button onClick={() => navigate('/cadastros/almoxarifados')} className="hover:text-gray-600 transition-colors">
            Almoxarifados
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

          {/* Localização + Responsável */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Localização {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                disabled={readonly}
                value={localizacao}
                onChange={e => { setLocalizacao(e.target.value); clearErr('localizacao'); }}
                placeholder="Ex: Matriz, Unidade 2"
                maxLength={100}
                className={underline(fieldErrors.localizacao)}
              />
              {fieldErrors.localizacao && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.localizacao}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Responsável {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                disabled={readonly}
                value={responsavel}
                onChange={e => { setResponsavel(e.target.value); clearErr('responsavel'); }}
                placeholder="Nome do responsável"
                maxLength={100}
                className={underline(fieldErrors.responsavel)}
              />
              {fieldErrors.responsavel && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.responsavel}</p>
              )}
            </div>
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
              maxLength={100}
              className={underline(fieldErrors.nome)}
            />
            {fieldErrors.nome && (
              <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">Descrição<span className="text-red-400">*</span></label>
            <textarea
              disabled={readonly}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder={readonly ? '—' : 'Descreva brevemente o proposito deste almoxarifado…'}
              rows={3}
              maxLength={255}
              className={cn(
                'w-full bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300 resize-none pt-1',
                'border-gray-300 focus:border-[#1D4E89]',
                readonly && 'opacity-60 cursor-default',
              )}/>
          </div>

          {/* Contato + E-mail */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contato</label>
              <IMaskInput
                mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
                value={contato}
                onAccept={(v: string) => { setContato(v); clearErr('contato'); }}
                placeholder="(11) 99999-0000"
                readOnly={readonly}
                className={underline(fieldErrors.contato)}
              />
              {fieldErrors.contato && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.contato}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">E-mail</label>
              <input
                type="email"
                disabled={readonly}
                value={email}
                onChange={e => { setEmail(e.target.value); clearErr('email'); }}
                placeholder="almox@empresa.com"
                maxLength={100}
                className={underline(fieldErrors.email)}/>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {modo === 'editar' && (
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
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
            onClick={() => navigate('/cadastros/almoxarifados')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {readonly ? 'Voltar' : 'Cancelar'}
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/cadastros/almoxarifados/${id}/editar`)}
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
        descricao="Os dados do almoxarifado serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
