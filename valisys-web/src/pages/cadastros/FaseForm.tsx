import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Layers, Save, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

type Modo = 'criar' | 'editar' | 'visualizar';

type FaseData = {
  id: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  tempoPadraoDias: number;
  ativo: boolean;
};

export function FaseFormPage() {
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

  const [nome, setNome]                 = useState('');
  const [descricao, setDescricao]       = useState('');
  const [ordem, setOrdem]               = useState<number | ''>(1);
  const [tempoDias, setTempoDias]       = useState<number | ''>(0);
  const [ativo, setAtivo]               = useState(true);
  const [confirmOpen, setConfirmOpen]   = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchFase = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/fases-producao/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: FaseData = await res.json();
        setNome(data.nome);
        setDescricao(data.descricao ?? '');
        setOrdem(data.ordem);
        setTempoDias(data.tempoPadraoDias ?? 0);
        setAtivo(data.ativo);
      } catch {
        setError('Não foi possível carregar a fase de produção.');
      } finally {
        setLoading(false);
      }
    };
    fetchFase();
  }, [id]);

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!nome.trim()) erros.nome = 'O nome é obrigatório.';
    else if (nome.trim().length > 100) erros.nome = 'Máximo de 100 caracteres.';
    if (ordem === '' || Number(ordem) < 1 || Number(ordem) > 100)
      erros.ordem = 'A ordem deve ser um número entre 1 e 100.';
    if (tempoDias !== '' && (Number(tempoDias) < 0 || Number(tempoDias) > 365))
      erros.tempoDias = 'O tempo deve ser entre 0 e 365 dias.';
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
      const res = modo === 'criar'
        ? await fetch('/api/fases-producao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              nome: nome.trim(),
              descricao: descricao.trim() || undefined,
              ordem: Number(ordem),
              tempoPadraoDias: Number(tempoDias) || 0,
            }),
          })
        : await fetch(`/api/fases-producao/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              id,
              nome: nome.trim(),
              descricao: descricao.trim() || undefined,
              ordem: Number(ordem),
              tempoPadraoDias: Number(tempoDias) || 0,
              ativo,
            }),
          });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? body.message ?? 'Erro ao salvar fase de produção.');
      }
      showToast();
      navigate('/cadastros/fases');
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
    criar:      'Nova Fase de Produção',
    editar:     'Editar Fase de Produção',
    visualizar: 'Fase de Produção',
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
            onClick={() => navigate('/cadastros/fases')}
            className="hover:text-gray-600 transition-colors"
          >
            Fases de Produção
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">
        <div className="max-w-xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Layers size={20} className="text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-800">{titulo[modo]}</h1>
              {modo !== 'criar' && ordem !== '' && (
                <p className="text-xs text-gray-400 mt-0.5">Sequência #{ordem}</p>
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
                    placeholder="Ex: Corte, Montagem, Acabamento…"
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

                {/* Ordem + Tempo lado a lado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Ordem {!readonly && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="number"
                      disabled={readonly}
                      min={1}
                      max={100}
                      value={ordem}
                      onChange={e => {
                        const v = e.target.value;
                        setOrdem(v === '' ? '' : Number(v));
                        clearFieldError('ordem');
                      }}
                      placeholder="1"
                      className={cn(
                        'w-full h-9 px-3 text-sm border rounded-md transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
                        'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
                        fieldErrors.ordem ? 'border-red-400' : 'border-gray-300',
                      )}
                    />
                    {fieldErrors.ordem && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.ordem}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Tempo Padrão (dias)</label>
                    <input
                      type="number"
                      disabled={readonly}
                      min={0}
                      max={365}
                      value={tempoDias}
                      onChange={e => {
                        const v = e.target.value;
                        setTempoDias(v === '' ? '' : Number(v));
                        clearFieldError('tempoDias');
                      }}
                      placeholder="0"
                      className={cn(
                        'w-full h-9 px-3 text-sm border rounded-md transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
                        'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
                        fieldErrors.tempoDias ? 'border-red-400' : 'border-gray-300',
                      )}
                    />
                    {fieldErrors.tempoDias && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.tempoDias}</p>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Descrição</label>
                  <textarea
                    disabled={readonly}
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder={readonly ? '—' : 'Descreva as atividades desta fase…'}
                    rows={3}
                    className={cn(
                      'w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-all resize-none',
                      'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
                      'placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-default',
                    )}
                  />
                </div>

                {/* Status toggle — modo editar */}
                {modo === 'editar' && (
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Status</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {ativo ? 'Fase ativa e disponível para uso' : 'Fase inativa'}
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
                      onClick={() => navigate('/cadastros/fases')}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/cadastros/fases/${id}/editar`)}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563eb] transition-colors"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/cadastros/fases')}
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

      <ModalMsg
        aberto={confirmOpen}
        variante="aviso"
        titulo="Salvar alterações?"
        descricao="Os dados da fase de produção serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
