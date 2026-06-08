import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

type Modo = 'criar' | 'editar' | 'visualizar';

const TIPOS_CONTAGEM = ['CICLICO', 'GERAL'] as const;
type TipoContagem = typeof TIPOS_CONTAGEM[number];
const TIPOS_LABEL: Record<TipoContagem, string> = { CICLICO: 'Cíclico', GERAL: 'Geral' };

interface ProdutoOpt  { id: string; nome: string; sku: string }
interface DepositoOpt { id: string; nome: string }

interface InventarioItem {
  tempId: string;
  produtoId: string;
  produtoNome: string;
  sku: string;
  quantidadeContada: number;
}

function uid() { return Math.random().toString(36).slice(2); }

const ul = (err?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
  err ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
);

function UField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className={cn('block text-xs mb-1', error ? 'text-red-500' : 'text-gray-500')}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export function InventarioFormPage() {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const readonly = modo === 'visualizar';

  const [loading, setLoading]       = useState(!!id);
  const [saving, setSaving]         = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [depositos, setDepositos] = useState<DepositoOpt[]>([]);
  const [produtos, setProdutos]   = useState<ProdutoOpt[]>([]);

  const [tipoContagem, setTipoContagem] = useState<TipoContagem>('CICLICO');
  const [depositoId, setDepositoId]     = useState('');
  const [observacao, setObs]            = useState('');
  const [itens, setItens]               = useState<InventarioItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };
    fetch('/api/depositos', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setDepositos(d.map(dep => ({ id: dep.id, nome: dep.nome }))));
    fetch('/api/Produtos', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setProdutos(d.map(p => ({ id: p.id, nome: p.nome, sku: p.sku ?? p.codigo ?? '—' }))));
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/inventarios/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const d = await res.json();
        setTipoContagem(d.tipoContagem ?? 'CICLICO');
        setDepositoId(d.depositoId ?? '');
        setObs(d.observacao ?? '');
        setItens((d.itens ?? []).map((it: any) => ({
          tempId: uid(),
          produtoId: it.produtoId,
          produtoNome: it.produtoNome ?? '',
          sku: it.sku ?? '',
          quantidadeContada: it.quantidadeContada ?? 0,
        })));
      } catch {
        setError('Não foi possível carregar o inventário.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addItem = () => setItens(prev => [
    ...prev,
    { tempId: uid(), produtoId: '', produtoNome: '', sku: '', quantidadeContada: 0 },
  ]);

  const removeItem = (tempId: string) => setItens(prev => prev.filter(it => it.tempId !== tempId));

  const updateItem = (tempId: string, field: keyof InventarioItem, value: string | number) => {
    setItens(prev => prev.map(it => {
      if (it.tempId !== tempId) return it;
      if (field === 'produtoId') {
        const prod = produtos.find(p => p.id === value);
        return { ...it, produtoId: String(value), produtoNome: prod?.nome ?? '', sku: prod?.sku ?? '' };
      }
      return { ...it, [field]: value };
    }));
  };

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!depositoId) e.depositoId = 'Selecione um depósito.';
    if (itens.length === 0) e.itens = 'Adicione ao menos um produto.';
    else if (itens.some(it => !it.produtoId)) e.itens = 'Selecione o produto em todas as linhas.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildBody = () => ({
    depositoId,
    tipoContagem,
    observacao: observacao.trim() || undefined,
    itens: itens.map(it => ({ produtoId: it.produtoId, quantidadeContada: it.quantidadeContada })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    try {
      const res = modo === 'criar'
        ? await fetch('/api/inventarios', { method: 'POST', headers, body: JSON.stringify(buildBody()) })
        : await fetch(`/api/inventarios/${id}`, { method: 'PUT', headers, body: JSON.stringify({ id, ...buildBody() }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar.');
      }
      showToast();
      navigate('/estoque/inventario');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizar = async () => {
    if (!validate()) return;
    if (!confirm('Finalizar o inventário? Esta ação não pode ser desfeita.')) return;
    setFinalizing(true);
    setError('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    try {
      let targetId = id;

      // Salva primeiro se necessário
      const saveRes = modo === 'criar'
        ? await fetch('/api/inventarios', { method: 'POST', headers, body: JSON.stringify(buildBody()) })
        : await fetch(`/api/inventarios/${id}`, { method: 'PUT', headers, body: JSON.stringify({ id, ...buildBody() }) });
      if (!saveRes.ok) throw new Error('Erro ao salvar.');
      if (modo === 'criar') {
        const created = await saveRes.json();
        targetId = created.id;
      }

      const finRes = await fetch(`/api/inventarios/${targetId}/finalizar`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!finRes.ok) throw new Error('Erro ao finalizar.');
      showToast();
      navigate('/estoque/inventario');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado.');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  const titulo: Record<Modo, string> = {
    criar:      'Nova contagem',
    editar:     'Editar contagem',
    visualizar: 'Detalhes do inventário',
  };

  const totalContado = itens.reduce((s, it) => s + it.quantidadeContada, 0);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/estoque/inventario')} className="hover:text-gray-600 transition-colors">
            Inventário
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto px-6 py-6">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          {/* Campos principais */}
          <div className="grid grid-cols-2 gap-8 mb-8 max-w-2xl">
            <UField label="Tipo de contagem" required={!readonly} error={fieldErrors.tipoContagem}>
              {readonly ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {TIPOS_LABEL[tipoContagem]}
                </p>
              ) : (
                <select
                  value={tipoContagem}
                  onChange={e => { setTipoContagem(e.target.value as TipoContagem); clearErr('tipoContagem'); }}
                  className={ul(fieldErrors.tipoContagem)}
                >
                  {TIPOS_CONTAGEM.map(t => (
                    <option key={t} value={t}>{TIPOS_LABEL[t]}</option>
                  ))}
                </select>
              )}
            </UField>

            <UField label="Depósito" required={!readonly} error={fieldErrors.depositoId}>
              {readonly ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {depositos.find(d => d.id === depositoId)?.nome ?? '—'}
                </p>
              ) : (
                <select
                  value={depositoId}
                  onChange={e => { setDepositoId(e.target.value); clearErr('depositoId'); }}
                  className={ul(fieldErrors.depositoId)}
                >
                  <option value="">Selecione um depósito…</option>
                  {depositos.map(d => (
                    <option key={d.id} value={d.id}>{d.nome}</option>
                  ))}
                </select>
              )}
            </UField>
          </div>

          {/* Observação */}
          <div className="mb-8 max-w-2xl">
            <UField label="Observação">
              <textarea
                disabled={readonly}
                value={observacao}
                onChange={e => setObs(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder={readonly ? '—' : 'Observações sobre esta contagem…'}
                className={cn(
                  'w-full text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300 resize-none py-2 bg-transparent',
                  'border-gray-300 focus:border-[#3B82F6]',
                  readonly && 'cursor-default',
                )}
              />
            </UField>
          </div>

          {/* Tabela de produtos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Produtos</h3>
              {!readonly && (
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-sm text-[#3B82F6] hover:text-[#2563eb] transition-colors"
                >
                  <Plus size={13} /> Adicionar produto
                </button>
              )}
            </div>

            {fieldErrors.itens && (
              <p className="text-[11px] text-red-500 mb-2">{fieldErrors.itens}</p>
            )}

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-600 py-2.5 pr-4">Produto</th>
                  <th className="text-left text-xs font-semibold text-gray-600 py-2.5 pr-4 w-36">SKU</th>
                  <th className="text-right text-xs font-semibold text-gray-600 py-2.5 w-36">Qtd. Contada</th>
                  {!readonly && <th className="w-10" />}
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 ? (
                  <tr>
                    <td colSpan={readonly ? 3 : 4} className="py-10 text-center text-sm text-gray-400">
                      Nenhum produto adicionado.{!readonly && (
                        <button
                          type="button"
                          onClick={addItem}
                          className="ml-1 text-[#3B82F6] hover:underline"
                        >
                          Adicionar produto
                        </button>
                      )}
                    </td>
                  </tr>
                ) : itens.map((item, idx) => (
                  <tr key={item.tempId} className={cn('border-b border-gray-100', idx % 2 === 0 ? '' : 'bg-gray-50/40')}>
                    <td className="py-2 pr-4">
                      {readonly ? (
                        <span className="text-sm text-gray-700">{item.produtoNome || '—'}</span>
                      ) : (
                        <select
                          value={item.produtoId}
                          onChange={e => updateItem(item.tempId, 'produtoId', e.target.value)}
                          className={cn(
                            'w-full h-8 bg-transparent text-sm border-b focus:outline-none transition-colors',
                            item.produtoId
                              ? 'border-gray-300 focus:border-[#3B82F6] text-gray-700'
                              : 'border-gray-300 focus:border-[#3B82F6] text-gray-400',
                          )}
                        >
                          <option value="">Selecione um produto…</option>
                          {produtos.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="text-sm text-gray-400 font-mono">{item.sku || '—'}</span>
                    </td>
                    <td className="py-2 text-right">
                      {readonly ? (
                        <span className="text-sm text-gray-700 font-medium">{item.quantidadeContada}</span>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          value={item.quantidadeContada}
                          onChange={e => updateItem(item.tempId, 'quantidadeContada', Math.max(0, Number(e.target.value)))}
                          className="w-28 h-8 text-right bg-transparent text-sm border-b border-gray-300 focus:border-[#3B82F6] focus:outline-none transition-colors"
                        />
                      )}
                    </td>
                    {!readonly && (
                      <td className="py-2 pl-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.tempId)}
                          className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {itens.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td className="py-2.5 text-xs font-semibold text-gray-500">
                      {itens.length} produto{itens.length !== 1 ? 's' : ''}
                    </td>
                    <td />
                    <td className="py-2.5 text-right text-sm font-bold text-gray-700">{totalContado}</td>
                    {!readonly && <td />}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/estoque/inventario')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            {readonly ? (
              <button
                type="button"
                onClick={() => navigate(`/estoque/inventario/${id}/editar`)}
                className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={saving || finalizing}
                  className="h-9 px-6 rounded-full border border-[#3B82F6] text-[#3B82F6] text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving
                    ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                    : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={handleFinalizar}
                  disabled={saving || finalizing}
                  className="h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {finalizing
                    ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Finalizando…</span>
                    : 'Finalizar'}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
