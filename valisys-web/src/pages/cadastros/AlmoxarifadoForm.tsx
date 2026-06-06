import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Warehouse, Save, X, Pencil, MapPin, User, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const inputCls = (error?: string, readonly?: boolean) => cn(
  'w-full h-9 px-3 text-sm border rounded-md transition-all',
  'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
  'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
  error ? 'border-red-400' : 'border-gray-300',
);

export function AlmoxarifadoFormPage() {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';

  const readonly = modo === 'visualizar';

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [nome, setNome]             = useState('');
  const [descricao, setDescricao]   = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [contato, setContato]       = useState('');
  const [email, setEmail]           = useState('');
  const [ativo, setAtivo]           = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAlmoxarifado = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/Almoxarifado/${id}`, {
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

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!nome.trim())        erros.nome        = 'O nome é obrigatório.';
    else if (nome.trim().length > 100) erros.nome = 'Máximo de 100 caracteres.';
    if (!descricao.trim())   erros.descricao   = 'A descrição é obrigatória.';
    else if (descricao.trim().length > 255) erros.descricao = 'Máximo de 255 caracteres.';
    if (!localizacao.trim()) erros.localizacao = 'A localização é obrigatória.';
    else if (localizacao.trim().length > 100) erros.localizacao = 'Máximo de 100 caracteres.';
    if (!responsavel.trim()) erros.responsavel = 'O responsável é obrigatório.';
    else if (responsavel.trim().length > 100) erros.responsavel = 'Máximo de 100 caracteres.';
    if (contato && contato.length > 20) erros.contato = 'Máximo de 20 caracteres.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = 'E-mail inválido.';
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
        nome:        nome.trim(),
        descricao:   descricao.trim(),
        localizacao: localizacao.trim(),
        responsavel: responsavel.trim(),
        contato:     contato.trim() || undefined,
        email:       email.trim() || undefined,
      };

      const res = modo === 'criar'
        ? await fetch('/api/Almoxarifado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/Almoxarifado/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, ...body, ativo }),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar almoxarifado.');
      }

      navigate('/cadastros/almoxarifados');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const titulo: Record<Modo, string> = {
    criar:      'Novo Almoxarifado',
    editar:     'Editar Almoxarifado',
    visualizar: 'Almoxarifado',
  };

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
            onClick={() => navigate('/cadastros/almoxarifados')}
            className="hover:text-gray-600 transition-colors"
          >
            Almoxarifados
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Warehouse size={20} className="text-[#3B82F6]" />
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

                {/* Nome */}
                <Field label="Nome" required={!readonly} error={fieldErrors.nome}>
                  <input
                    disabled={readonly}
                    value={nome}
                    onChange={e => { setNome(e.target.value); clearFieldError('nome'); }}
                    placeholder="Ex: Almoxarifado Central"
                    maxLength={100}
                    className={inputCls(fieldErrors.nome, readonly)}
                  />
                </Field>

                {/* Descrição */}
                <Field label="Descrição" required={!readonly} error={fieldErrors.descricao}>
                  <div className="relative">
                    <textarea
                      disabled={readonly}
                      value={descricao}
                      onChange={e => { setDescricao(e.target.value); clearFieldError('descricao'); }}
                      placeholder={readonly ? '—' : 'Descreva o propósito deste almoxarifado…'}
                      rows={3}
                      maxLength={255}
                      className={cn(
                        'w-full px-3 py-2 text-sm border rounded-md transition-all resize-none',
                        'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
                        'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
                        fieldErrors.descricao ? 'border-red-400' : 'border-gray-300',
                      )}
                    />
                    {!readonly && (
                      <span className="absolute bottom-2 right-2 text-[10px] text-gray-300 pointer-events-none">
                        {descricao.length}/255
                      </span>
                    )}
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Localização */}
                  <Field label="Localização" required={!readonly} error={fieldErrors.localizacao}>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        disabled={readonly}
                        value={localizacao}
                        onChange={e => { setLocalizacao(e.target.value); clearFieldError('localizacao'); }}
                        placeholder="Ex: Galpão A, Bloco 2"
                        maxLength={100}
                        className={cn(inputCls(fieldErrors.localizacao, readonly), 'pl-8')}
                      />
                    </div>
                  </Field>

                  {/* Responsável */}
                  <Field label="Responsável" required={!readonly} error={fieldErrors.responsavel}>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        disabled={readonly}
                        value={responsavel}
                        onChange={e => { setResponsavel(e.target.value); clearFieldError('responsavel'); }}
                        placeholder="Nome do responsável"
                        maxLength={100}
                        className={cn(inputCls(fieldErrors.responsavel, readonly), 'pl-8')}
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contato */}
                  <Field label="Contato" error={fieldErrors.contato}>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        disabled={readonly}
                        value={contato}
                        onChange={e => { setContato(e.target.value); clearFieldError('contato'); }}
                        placeholder="(11) 99999-0000"
                        maxLength={20}
                        className={cn(inputCls(fieldErrors.contato, readonly), 'pl-8')}
                      />
                    </div>
                  </Field>

                  {/* E-mail */}
                  <Field label="E-mail" error={fieldErrors.email}>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        type="email"
                        disabled={readonly}
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                        placeholder="almox@empresa.com"
                        maxLength={100}
                        className={cn(inputCls(fieldErrors.email, readonly), 'pl-8')}
                      />
                    </div>
                  </Field>
                </div>

                {/* Status toggle — modo editar */}
                {modo === 'editar' && (
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Status</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {ativo ? 'Almoxarifado ativo e disponível' : 'Almoxarifado inativo'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAtivo(v => !v)}
                      className={cn(
                        'relative w-10 h-[22px] rounded-full transition-colors duration-200',
                        ativo ? 'bg-[#3B82F6]' : 'bg-gray-200',
                      )}
                    >
                      <span className={cn(
                        'absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                        ativo ? 'translate-x-5' : 'translate-x-[3px]',
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
                      onClick={() => navigate('/cadastros/almoxarifados')}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/cadastros/almoxarifados/${id}/editar`)}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563eb] transition-colors"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/cadastros/almoxarifados')}
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
