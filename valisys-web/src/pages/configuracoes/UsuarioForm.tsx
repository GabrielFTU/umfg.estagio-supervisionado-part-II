import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home, Loader2, Save, Pencil, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

type Modo = 'criar' | 'editar' | 'visualizar';

type UsuarioData = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfilId: string;
  perfilNome: string;
};

type PerfilOption = { id: string; nome: string; ativo: boolean };

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
      )}>
      <span className={cn('absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-[17px]' : 'translate-x-0',
      )} />
    </button>
  );
}

const underline = (error?: string, disabled?: boolean) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
  error ? 'border-red-400' : 'border-gray-300 focus:border-[#1D4E89]',
  disabled && 'opacity-60 cursor-default',
);

function getCurrentUserId(): string | null {
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return user.id ?? null;
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UsuarioFormPage() {
  const { id }    = useParams<{ id: string }>();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { showToast } = useToast();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';

  const readonly = modo === 'visualizar';
  const souEu = !!id && id === getCurrentUserId();

  const [loading, setLoading]       = useState(!!id);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [nome, setNome]           = useState('');
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [perfilId, setPerfilId]   = useState('');
  const [perfilNome, setPerfilNome] = useState('');
  const [ativo, setAtivo]         = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [perfis, setPerfis] = useState<PerfilOption[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(true);

  useEffect(() => {
    const fetchPerfis = async () => {
      setLoadingPerfis(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/Perfis', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data: any[] = await res.json();
        const lista: PerfilOption[] = data
          .map(p => ({ id: p.id, nome: p.nome, ativo: p.ativo }))
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        setPerfis(lista);
      } catch {
        setPerfis([]);
      } finally {
        setLoadingPerfis(false);
      }
    };
    fetchPerfis();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchUsuario = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/Usuarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: UsuarioData = await res.json();
        setNome(data.nome);
        setEmail(data.email);
        setPerfilId(data.perfilId);
        setPerfilNome(data.perfilNome);
        setAtivo(data.ativo);
      } catch {
        setError('Não foi possível carregar o usuário.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!nome.trim()) erros.nome = 'O nome é obrigatório.';
    else if (nome.trim().length > 100) erros.nome = 'Máximo de 100 caracteres.';

    if (!email.trim()) erros.email = 'O e-mail é obrigatório.';
    else if (!EMAIL_RE.test(email.trim())) erros.email = 'Informe um e-mail válido.';

    if (!perfilId) erros.perfilId = 'Selecione um perfil.';

    if (modo === 'criar') {
      if (!senha) erros.senha = 'A senha é obrigatória.';
      else if (senha.length < 6 || senha.length > 50) erros.senha = 'A senha deve ter entre 6 e 50 caracteres.';
      if (confirmarSenha !== senha) erros.confirmarSenha = 'As senhas não coincidem.';
    }

    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const execSave = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = modo === 'criar'
        ? await fetch('/api/Usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha, perfilId, ativo: true }),
          })
        : await fetch(`/api/Usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, nome: nome.trim(), email: email.trim(), perfilId, ativo }),
          });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Erro ao salvar usuário.');
      }
      showToast();
      navigate('/configuracoes/usuarios');
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
    criar:      'Novo Usuário',
    editar:     'Editar Usuário',
    visualizar: 'Dados do Usuário',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  const perfilOptions = perfis.filter(p => p.ativo || p.id === perfilId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col h-full bg-white"
    >

      {/* Breadcrumb */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/configuracoes/usuarios')} className="hover:text-gray-600 transition-colors">
            Usuários
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {souEu && modo === 'editar' && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-[#1D4E89]">
              Você está editando o seu próprio usuário. Por segurança, não é possível desativar a própria conta.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-6 max-w-2xl">
            {/* Nome */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nome {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                disabled={readonly}
                value={nome}
                onChange={e => { setNome(e.target.value); clearErr('nome'); }}
                placeholder="Ex: Maria Souza"
                maxLength={100}
                className={underline(fieldErrors.nome)}
              />
              {fieldErrors.nome && <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                E-mail {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                type="email"
                disabled={readonly}
                value={email}
                onChange={e => { setEmail(e.target.value); clearErr('email'); }}
                placeholder="usuario@empresa.com"
                className={underline(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.email}</p>}
            </div>

            {/* Perfil */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Perfil {!readonly && <span className="text-red-400">*</span>}
              </label>
              {readonly ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">{perfilNome}</p>
              ) : (
                <select
                  disabled={loadingPerfis}
                  value={perfilId}
                  onChange={e => { setPerfilId(e.target.value); clearErr('perfilId'); }}
                  className={underline(fieldErrors.perfilId)}
                >
                  <option value="">{loadingPerfis ? 'Carregando…' : 'Selecione…'}</option>
                  {perfilOptions.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              )}
              {fieldErrors.perfilId && <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.perfilId}</p>}
            </div>

            {/* Status */}
            {modo === 'editar' && (
              <div className="flex items-center justify-between sm:justify-start sm:gap-4 py-1">
                <span className="text-sm text-gray-700">Ativo?</span>
                <Toggle checked={ativo} onChange={setAtivo} disabled={souEu} />
              </div>
            )}
            {modo === 'visualizar' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                  ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                  {ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            )}

            {/* Senha — somente na criação */}
            {modo === 'criar' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Senha <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={e => { setSenha(e.target.value); clearErr('senha'); }}
                      placeholder="Mínimo de 6 caracteres"
                      maxLength={50}
                      className={cn(underline(fieldErrors.senha), 'pr-8')}
                    />
                    <button type="button" onClick={() => setShowSenha(v => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.senha && <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.senha}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Confirmar senha <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => { setConfirmarSenha(e.target.value); clearErr('confirmarSenha'); }}
                    placeholder="Repita a senha"
                    maxLength={50}
                    className={underline(fieldErrors.confirmarSenha)}
                  />
                  {fieldErrors.confirmarSenha && <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.confirmarSenha}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/configuracoes/usuarios')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {readonly ? 'Voltar' : 'Cancelar'}
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/configuracoes/usuarios/${id}/editar`)}
              className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] active:scale-95 transition-all"
            >
              <Pencil size={13} /> Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
        descricao="Os dados do usuário serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
}
