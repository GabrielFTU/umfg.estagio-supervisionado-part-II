import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Tag, Save, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

type Modo = 'criar' | 'editar' | 'visualizar';

type CategoriaData = {
  id: string;
  codigo: string | null;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export function CategoriaFormPage() {
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

  useEffect(() => {
    if (!id) return;
    const fetchCategoria = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/CategoriasProduto/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: CategoriaData = await res.json();
        setNome(data.nome);
        setDescricao(data.descricao ?? '');
        setCodigo(data.codigo ?? '');
        setAtivo(data.ativo);
      } catch {
        setError('Não foi possível carregar a categoria.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategoria();
  }, [id]);

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!nome.trim()) erros.nome = 'O nome é obrigatório.';
    else if (nome.trim().length > 100) erros.nome = 'Máximo de 100 caracteres.';
    if (descricao.length > 500) erros.descricao = 'Máximo de 500 caracteres.';
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
      const res = modo === 'criar'
        ? await fetch('/api/CategoriasProduto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              nome: nome.trim(),
              descricao: descricao.trim() || undefined,
            }),
          })
        : await fetch(`/api/CategoriasProduto/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              id,
              nome: nome.trim(),
              codigo,
              ativo,
            }),
          });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'Erro ao salvar categoria.');
      }

      showToast();
      navigate('/cadastros/categorias');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const titulo: Record<Modo, string> = {
    criar:      'Nova Categoria',
    editar:     'Editar Categoria',
    visualizar: 'Categoria',
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
            onClick={() => navigate('/cadastros/categorias')}
            className="hover:text-gray-600 transition-colors"
          >
            Categorias de Produto
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">
        <div className="max-w-xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Tag size={20} className="text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-800">{titulo[modo]}</h1>
              {codigo && (
                <p className="text-xs text-gray-400 mt-0.5">Código #{codigo}</p>
              )}
            </div>
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
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Nome {!readonly && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    disabled={readonly}
                    value={nome}
                    onChange={e => { setNome(e.target.value); clearFieldError('nome'); }}
                    placeholder="Ex: Matéria-Prima"
                    maxLength={100}
                    className={cn(
                      'w-full h-9 px-3 text-sm border rounded-md transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
                      'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
                      fieldErrors.nome ? 'border-red-400' : 'border-gray-300',
                    )}
                  />
                  {fieldErrors.nome && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.nome}</p>
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Descrição</label>
                  <textarea
                    disabled={readonly}
                    value={descricao}
                    onChange={e => { setDescricao(e.target.value); clearFieldError('descricao'); }}
                    placeholder={readonly ? '—' : 'Descreva a finalidade desta categoria…'}
                    rows={3}
                    maxLength={500}
                    className={cn(
                      'w-full px-3 py-2 text-sm border rounded-md transition-all resize-none',
                      'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
                      'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
                      fieldErrors.descricao ? 'border-red-400' : 'border-gray-300',
                    )}
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.descricao
                      ? <p className="text-xs text-red-500">{fieldErrors.descricao}</p>
                      : <span />}
                    {!readonly && (
                      <span className="text-[10px] text-gray-400">{descricao.length}/500</span>
                    )}
                  </div>
                </div>

                {/* Status — apenas no modo editar */}
                {modo === 'editar' && (
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Status</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {ativo ? 'Categoria ativa e visível no sistema' : 'Categoria inativa'}
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

                {/* Status read-only no modo visualizar */}
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
                      onClick={() => navigate('/cadastros/categorias')}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/cadastros/categorias/${id}/editar`)}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563eb] transition-colors"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/cadastros/categorias')}
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
