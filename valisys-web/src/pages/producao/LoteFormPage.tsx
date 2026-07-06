import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

type Modo = 'criar' | 'editar' | 'visualizar';

type LoteReadData = {
  id: string;
  codigoLote: string;
  descricao?: string;
  observacoes?: string;
  dataAbertura: string;
  dataConclusao?: string;
  ativo: boolean;
  status: string;
  produtoId: string;
  produtoNome: string;
  almoxarifadoId: string;
  almoxarifadoNome: string;
  emUso: boolean;
};

type ProdutoOption = { id: string; nome: string };
type AlmoxarifadoOption = { id: string; nome: string };

const STATUS_LABEL: Record<string, string> = {
  Pendente:   'Pendente',
  EmProducao: 'Em Produção',
  Concluido:  'Concluído',
  Cancelado:  'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  Pendente:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  EmProducao: 'bg-blue-50 text-blue-700 border-blue-200',
  Concluido:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelado:  'bg-gray-100 text-gray-500 border-gray-200',
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

const toDateValue = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : '';

export function LoteFormPage() {
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
  const [almoxarifados, setAlmoxarifados] = useState<AlmoxarifadoOption[]>([]);

  const [codigoLote, setCodigoLote] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [almoxarifadoId, setAlmoxarifadoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [dataAbertura, setDataAbertura] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [status, setStatus] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [almoxarifadoNome, setAlmoxarifadoNome] = useState('');
  const [emUso, setEmUso] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchOpts = async () => {
      const [pr, ar] = await Promise.all([
        fetch('/api/produtos', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/almoxarifados', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (pr.ok) {
        const data = await pr.json();
        setProdutos(data.filter((p: any) => p.ativo !== false).map((p: any) => ({ id: p.id, nome: p.nome })));
      }
      if (ar.ok) {
        const data = await ar.json();
        setAlmoxarifados(data.filter((a: any) => a.ativo !== false).map((a: any) => ({ id: a.id, nome: a.nome })));
      }
    };
    fetchOpts();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchLote = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/lotes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data: LoteReadData = await res.json();
        setCodigoLote(data.codigoLote);
        setProdutoId(data.produtoId);
        setAlmoxarifadoId(data.almoxarifadoId);
        setDescricao(data.descricao ?? '');
        setObservacoes(data.observacoes ?? '');
        setDataAbertura(toDateValue(data.dataAbertura));
        setDataConclusao(toDateValue(data.dataConclusao));
        setAtivo(data.ativo);
        setStatus(data.status);
        setProdutoNome(data.produtoNome);
        setAlmoxarifadoNome(data.almoxarifadoNome);
        setEmUso(data.emUso);
      } catch {
        setError('Não foi possível carregar o lote.');
      } finally {
        setLoading(false);
      }
    };
    fetchLote();
  }, [id]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (modo !== 'criar' && !codigoLote.trim()) erros.codigoLote = 'O código do lote é obrigatório.';
    if (modo === 'criar') {
      if (!produtoId) erros.produtoId = 'Selecione um produto.';
      if (!almoxarifadoId) erros.almoxarifadoId = 'Selecione um almoxarifado.';
    }
    if (modo === 'editar' && !dataAbertura) erros.dataAbertura = 'A data de abertura é obrigatória.';
    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const execSave = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      let res: Response;
      if (modo === 'criar') {
        res = await fetch('/api/lotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            produtoId,
            almoxarifadoId,
            descricao: descricao.trim() || null,
            observacoes: observacoes.trim() || null,
          }),
        });
      } else {
        res = await fetch(`/api/lotes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            id,
            codigoLote: codigoLote.trim(),
            dataAbertura,
            dataConclusao: dataConclusao || null,
            descricao: descricao.trim() || null,
            observacoes: observacoes.trim() || null,
            ativo,
          }),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar lote.');
      }
      showToast();
      navigate('/lotes');
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
    criar:      'Novo Lote',
    editar:     'Editar Lote',
    visualizar: 'Dados do Lote',
  };

  const formatDate = (d?: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

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
          <button onClick={() => navigate('/lotes')} className="hover:text-gray-600 transition-colors">
            Lotes
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

          {/* Status badges (visualizar / editar) */}
          {modo !== 'criar' && status && (
            <div className="mb-5 flex items-center gap-2">
              <span className={cn('text-[11px] px-2.5 py-1 rounded-full font-medium border', STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500 border-gray-200')}>
                {STATUS_LABEL[status] ?? status}
              </span>
              {emUso && (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-medium border bg-orange-50 text-orange-700 border-orange-200">
                  Em Uso
                </span>
              )}
            </div>
          )}

          {/* Código do Lote (gerado automaticamente; não existe até salvar) */}
          {modo !== 'criar' && (
            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-1">
                Código do Lote {!readonly && <span className="text-red-400">*</span>}
              </label>
              {readonly ? (
                <p className="text-sm font-medium text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {codigoLote}
                </p>
              ) : (
                <input
                  value={codigoLote}
                  onChange={e => { setCodigoLote(e.target.value); clearErr('codigoLote'); }}
                  maxLength={50}
                  className={underline(fieldErrors.codigoLote)}
                />
              )}
              {fieldErrors.codigoLote && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.codigoLote}</p>
              )}
            </div>
          )}

          {/* Produto + Almoxarifado */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Produto {modo === 'criar' && <span className="text-red-400">*</span>}
              </label>
              {readonly || modo === 'editar' ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {produtoNome || '—'}
                </p>
              ) : (
                <select
                  value={produtoId}
                  onChange={e => { setProdutoId(e.target.value); clearErr('produtoId'); }}
                  className={underline(fieldErrors.produtoId)}
                >
                  <option value="">Selecione…</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              )}
              {fieldErrors.produtoId && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.produtoId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Almoxarifado {modo === 'criar' && <span className="text-red-400">*</span>}
              </label>
              {readonly || modo === 'editar' ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {almoxarifadoNome || '—'}
                </p>
              ) : (
                <select
                  value={almoxarifadoId}
                  onChange={e => { setAlmoxarifadoId(e.target.value); clearErr('almoxarifadoId'); }}
                  className={underline(fieldErrors.almoxarifadoId)}
                >
                  <option value="">Selecione…</option>
                  {almoxarifados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              )}
              {fieldErrors.almoxarifadoId && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.almoxarifadoId}</p>
              )}
            </div>
          </div>

          {/* Descrição + Observações */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">Descrição</label>
            {readonly ? (
              <p className="text-sm text-gray-700 border-b border-gray-200 min-h-9 py-2">
                {descricao || '—'}
              </p>
            ) : (
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Descrição do lote (opcional)"
                maxLength={500}
                rows={2}
                className="w-full text-sm border rounded-md px-3 py-2 border-gray-300 focus:border-[#1D4E89] focus:outline-none resize-none placeholder:text-gray-300 transition-colors"
              />
            )}
          </div>
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">Observações</label>
            {readonly ? (
              <p className="text-sm text-gray-700 border-b border-gray-200 min-h-9 py-2">
                {observacoes || '—'}
              </p>
            ) : (
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Observações (opcional)"
                maxLength={500}
                rows={2}
                className="w-full text-sm border rounded-md px-3 py-2 border-gray-300 focus:border-[#1D4E89] focus:outline-none resize-none placeholder:text-gray-300 transition-colors"
              />
            )}
          </div>

          {/* Data Abertura + Conclusão */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Data de Abertura {modo === 'editar' && <span className="text-red-400">*</span>}
              </label>
              {modo === 'editar' ? (
                <input
                  type="date"
                  value={dataAbertura}
                  onChange={e => { setDataAbertura(e.target.value); clearErr('dataAbertura'); }}
                  className={underline(fieldErrors.dataAbertura)}
                />
              ) : (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {modo === 'criar' ? new Date().toLocaleDateString('pt-BR') : formatDate(dataAbertura)}
                </p>
              )}
              {fieldErrors.dataAbertura && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.dataAbertura}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data de Conclusão</label>
              {modo === 'editar' ? (
                <input
                  type="date"
                  value={dataConclusao}
                  onChange={e => setDataConclusao(e.target.value)}
                  className={underline()}
                />
              ) : (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {modo === 'criar' ? '—' : (dataConclusao ? formatDate(dataConclusao) : '—')}
                </p>
              )}
            </div>
          </div>

          {/* Ativo toggle (editar) */}
          {modo === 'editar' && (
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">Ativo?</span>
              <Toggle checked={ativo} onChange={setAtivo} />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/lotes')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/lotes/${id}/editar`)}
              className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors"
            >
              Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving
                ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                : 'Salvar'}
            </button>
          )}
        </div>
      </form>

      <ModalMsg
        aberto={confirmOpen}
        variante="aviso"
        titulo="Salvar alterações?"
        descricao="Os dados do lote serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
