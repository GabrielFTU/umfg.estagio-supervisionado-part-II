import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Clock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

type Modo = 'criar' | 'editar' | 'visualizar';

interface ProdutoOption {
  id: string;
  nome: string;
  codigo: string;
  classificacaoId: number;
}

interface FaseOption {
  id: string;
  nome: string;
  tempoPadraoDias: number;
}

interface EtapaLocal {
  localId: string;
  id?: string;
  faseProducaoId: string;
  faseNome: string;
  ordem: number;
  tempoDias: number;
  instrucoes: string;
}

interface RoteiroReadData {
  id: string;
  produtoId: string;
  produtoNome: string;
  codigo: string;
  versao: string;
  descricao: string | null;
  ativo: boolean;
  tempoTotal: number;
  etapas: {
    id: string;
    faseProducaoId: string;
    faseNome: string;
    ordem: number;
    tempoDias: number;
    instrucoes: string | null;
  }[];
}

const uid = () => Math.random().toString(36).slice(2);

const underline = (error?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
  error ? 'border-red-400' : 'border-gray-300 focus:border-[#1D4E89]',
);

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

export function RoteiroProducaoFormPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const readonly = modo === 'visualizar';

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [produtos, setProdutos] = useState<ProdutoOption[]>([]);
  const [fases, setFases] = useState<FaseOption[]>([]);

  const [produtoId, setProdutoId] = useState('');
  const [codigo, setCodigo] = useState(() => `RASCUNHO-${Date.now().toString().slice(-6)}`);
  const [versao, setVersao] = useState('1.0');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [etapas, setEtapas] = useState<EtapaLocal[]>([]);

  const tempoTotal = etapas.reduce((acc, e) => acc + (Number(e.tempoDias) || 0), 0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchOpts = async () => {
      const [pr, fr] = await Promise.all([
        fetch('/api/produtos', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/fases-producao', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (pr.ok) {
        const data: ProdutoOption[] = await pr.json();
        setProdutos(data.filter(p => p.classificacaoId === 2 || p.classificacaoId === 3));
      }
      if (fr.ok) setFases(await fr.json());
    };
    fetchOpts();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchRoteiro = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/roteiros-producao/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data: RoteiroReadData = await res.json();
        setProdutoId(data.produtoId);
        setCodigo(data.codigo);
        setVersao(data.versao);
        setDescricao(data.descricao ?? '');
        setAtivo(data.ativo);
        setEtapas(
          (data.etapas ?? [])
            .sort((a, b) => a.ordem - b.ordem)
            .map(e => ({
              localId: uid(),
              id: e.id,
              faseProducaoId: e.faseProducaoId,
              faseNome: e.faseNome,
              ordem: e.ordem,
              tempoDias: e.tempoDias,
              instrucoes: e.instrucoes ?? '',
            })),
        );
      } catch {
        setError('Não foi possível carregar o roteiro.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoteiro();
  }, [id]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!produtoId) erros.produtoId = 'Selecione o produto.';
    if (!versao.trim()) erros.versao = 'A versão é obrigatória.';
    if (etapas.length === 0) {
      erros.etapas = 'O roteiro deve conter pelo menos uma etapa.';
    } else if (etapas.some(e => !e.faseProducaoId)) {
      erros.etapas = 'Todas as etapas precisam ter uma fase selecionada.';
    }
    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const execSave = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const payload = {
        ...(id ? { id } : {}),
        produtoId,
        codigo,
        versao: versao.trim(),
        descricao: descricao.trim() || null,
        ativo,
        etapas: etapas.map((e, idx) => ({
          ...(e.id ? { id: e.id } : {}),
          faseProducaoId: e.faseProducaoId,
          ordem: idx + 1,
          tempoDias: Number(e.tempoDias) || 0,
          instrucoes: e.instrucoes.trim() || null,
        })),
      };

      const res = await fetch(
        id ? `/api/roteiros-producao/${id}` : '/api/roteiros-producao',
        {
          method: id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar roteiro.');
      }

      showToast();
      navigate('/producao/roteiros');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
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

  const addEtapa = () => {
    setEtapas(prev => [...prev, {
      localId: uid(),
      faseProducaoId: '',
      faseNome: '',
      ordem: prev.length + 1,
      tempoDias: 0,
      instrucoes: '',
    }]);
  };

  const removeEtapa = (localId: string) => {
    setEtapas(prev =>
      prev.filter(e => e.localId !== localId).map((e, idx) => ({ ...e, ordem: idx + 1 })),
    );
  };

  const moveEtapa = (localId: string, dir: -1 | 1) => {
    setEtapas(prev => {
      const idx = prev.findIndex(e => e.localId === localId);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next.map((e, i) => ({ ...e, ordem: i + 1 }));
    });
  };

  const updateEtapa = (localId: string, field: keyof EtapaLocal, value: string | number) => {
    setEtapas(prev => prev.map(e => {
      if (e.localId !== localId) return e;
      if (field === 'faseProducaoId') {
        const fase = fases.find(f => f.id === value);
        return { ...e, faseProducaoId: value as string, faseNome: fase?.nome ?? '', tempoDias: fase?.tempoPadraoDias ?? e.tempoDias };
      }
      return { ...e, [field]: value };
    }));
  };

  const titulo: Record<Modo, string> = {
    criar: 'Novo Roteiro de Produção',
    editar: 'Editar Roteiro de Produção',
    visualizar: 'Roteiro de Produção',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
      <Loader2 size={16} className="animate-spin" /> Carregando…
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/producao/roteiros')} className="hover:text-gray-600 transition-colors">
            Roteiros de Produção
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto px-6 py-6 space-y-8">

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Informações Gerais */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Informações Gerais
            </h2>
            <div className="grid grid-cols-4 gap-6">

              {/* Produto */}
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Produto Base {!readonly && <span className="text-red-400">*</span>}
                </label>
                {readonly || modo === 'editar' ? (
                  <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                    {produtos.find(p => p.id === produtoId)?.nome ?? '—'}
                  </p>
                ) : (
                  <select
                    value={produtoId}
                    onChange={e => { setProdutoId(e.target.value); clearErr('produtoId'); }}
                    className={underline(fieldErrors.produtoId)}
                  >
                    <option value="">Selecione o produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} ({p.codigo})</option>
                    ))}
                  </select>
                )}
                {fieldErrors.produtoId && (
                  <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.produtoId}</p>
                )}
              </div>

              {/* Código */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Código do Roteiro</label>
                <p className="text-sm text-gray-400 border-b border-gray-200 h-9 flex items-center italic">
                  {codigo}
                </p>
              </div>

              {/* Versão */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Versão {!readonly && <span className="text-red-400">*</span>}
                </label>
                {readonly ? (
                  <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">{versao}</p>
                ) : (
                  <input
                    value={versao}
                    onChange={e => { setVersao(e.target.value); clearErr('versao'); }}
                    placeholder="1.0"
                    className={underline(fieldErrors.versao)}
                  />
                )}
                {fieldErrors.versao && (
                  <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.versao}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="col-span-3">
                <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                {readonly ? (
                  <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                    {descricao || '—'}
                  </p>
                ) : (
                  <input
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Descrição detalhada do processo..."
                    className={underline()}
                  />
                )}
              </div>

              {/* Ativo (apenas editar/visualizar) */}
              {modo !== 'criar' && (
                <div className="flex items-center justify-between col-span-1 py-1">
                  <span className="text-sm text-gray-700">Ativo?</span>
                  <Toggle checked={ativo} onChange={setAtivo} disabled={readonly} />
                </div>
              )}
            </div>
          </section>

          {/* Sequência Operacional */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Sequência Operacional {!readonly && <span className="text-red-400">*</span>}
                </h2>
                {fieldErrors.etapas && (
                  <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.etapas}</p>
                )}
              </div>
              {!readonly && (
                <button
                  type="button"
                  onClick={addEtapa}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus size={13} /> Adicionar Etapa
                </button>
              )}
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!readonly && <th className="w-8" />}
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 px-4 w-16">Ord.</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-4">Fase de Produção</th>
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-4 w-28">Dias</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide py-2.5 pr-4">Instruções</th>
                    {!readonly && <th className="w-12 pr-3" />}
                  </tr>
                </thead>
                <tbody>
                  {etapas.length === 0 ? (
                    <tr>
                      <td colSpan={readonly ? 4 : 6} className="py-10 text-center text-sm text-gray-400">
                        {readonly
                          ? 'Nenhuma etapa cadastrada.'
                          : 'Clique em "Adicionar Etapa" para começar.'}
                      </td>
                    </tr>
                  ) : etapas.map((etapa, idx) => (
                    <tr key={etapa.localId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {!readonly && (
                        <td className="pl-3">
                          <div className="flex flex-col gap-0.5 py-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveEtapa(etapa.localId, -1)}
                              className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === etapas.length - 1}
                              onClick={() => moveEtapa(etapa.localId, 1)}
                              className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-2.5 px-4 text-center">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center mx-auto">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        {readonly ? (
                          <span className="text-gray-700 text-sm">{etapa.faseNome}</span>
                        ) : (
                          <select
                            value={etapa.faseProducaoId}
                            onChange={e => updateEtapa(etapa.localId, 'faseProducaoId', e.target.value)}
                            className="w-full h-7 text-xs border border-gray-300 rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                          >
                            <option value="">Selecione...</option>
                            {fases.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        {readonly ? (
                          <span className="inline-flex items-center gap-1 text-gray-600 text-xs">
                            <Clock size={11} className="text-gray-400" /> {etapa.tempoDias}d
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            value={etapa.tempoDias}
                            onChange={e => updateEtapa(etapa.localId, 'tempoDias', Number(e.target.value))}
                            className="w-full h-7 text-xs border border-gray-300 rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 text-center"
                          />
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {readonly ? (
                          <span className="text-gray-500 text-xs">{etapa.instrucoes || '—'}</span>
                        ) : (
                          <input
                            type="text"
                            value={etapa.instrucoes}
                            onChange={e => updateEtapa(etapa.localId, 'instrucoes', e.target.value)}
                            placeholder="Opcional..."
                            className="w-full h-7 text-xs border border-gray-300 rounded px-1.5 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                          />
                        )}
                      </td>
                      {!readonly && (
                        <td className="py-2.5 pr-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeEtapa(etapa.localId)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {etapas.length > 0 && (
              <div className="mt-3 flex items-center gap-6 text-xs text-gray-500 px-1">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-blue-400" />
                  Lead time total: <strong className="text-gray-700">{tempoTotal} dias</strong>
                </span>
                <span>
                  Total de etapas: <strong className="text-gray-700">{etapas.length}</strong>
                </span>
              </div>
            )}
          </section>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/producao/roteiros')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/producao/roteiros/${id}/editar`)}
              className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors"
            >
              Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Salvando…</>
                : <><Save size={14} /> Salvar Roteiro</>}
            </button>
          )}
        </div>
      </form>

      <ModalMsg
        aberto={confirmOpen}
        variante="aviso"
        titulo="Salvar alterações?"
        descricao="Os dados do roteiro de produção serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
