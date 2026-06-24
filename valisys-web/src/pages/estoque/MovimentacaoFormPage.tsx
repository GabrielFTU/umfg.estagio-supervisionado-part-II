import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, Home, Loader2, Plus, Trash2,
  ArrowLeftRight, LogIn, LogOut, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlmoxarifadoOpt { id: string; nome: string }
interface DepositoOpt     { id: string; nome: string; almoxarifadoId: string; almoxarifadoNome: string }
interface ProdutoOpt      { id: string; nome: string; codigo: string; unidade: string }

interface ItemRow {
  tempId: string;
  produtoId: string;
  quantidade: string;
}

type TipoMovimentacao = 'Entrada' | 'Saida' | 'Transferencia' | 'Baixa' | null;

const TIPO_CFG: Record<NonNullable<TipoMovimentacao>, { label: string; badge: string; icon: React.ReactNode }> = {
  Entrada:       { label: 'Entrada',       badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <LogIn  size={12} /> },
  Saida:         { label: 'Saída',         badge: 'bg-orange-50  text-orange-700  border border-orange-200',  icon: <LogOut size={12} /> },
  Transferencia: { label: 'Transferência', badge: 'bg-blue-50    text-blue-700    border border-blue-200',    icon: <ArrowLeftRight size={12} /> },
  Baixa:         { label: 'Baixa',         badge: 'bg-red-50     text-red-700     border border-red-200',     icon: <Minus  size={12} /> },
};

function uid() { return Math.random().toString(36).slice(2); }

function detectTipo(
  almoxOrigemId: string, depositoOrigemId: string,
  almoxDestinoId: string, depositoDestinoId: string,
): TipoMovimentacao {
  const temOrigem  = !!(almoxOrigemId  || depositoOrigemId);
  const temDestino = !!(almoxDestinoId || depositoDestinoId);
  if (temOrigem && temDestino) return 'Transferencia';
  if (temDestino)              return 'Entrada';
  if (temOrigem)               return 'Saida';
  return null;
}

// ─── Field helpers ────────────────────────────────────────────────────────────

const selectCls = (err?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none',
  err ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
);

function Field({ label, required, error, children }: {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MovimentacaoFormPage() {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const [almoxarifados, setAlmoxarifados] = useState<AlmoxarifadoOpt[]>([]);
  const [depositos, setDepositos]         = useState<DepositoOpt[]>([]);
  const [produtos, setProdutos]           = useState<ProdutoOpt[]>([]);

  const [almoxOrigemId,    setAlmoxOrigemId]    = useState('');
  const [depositoOrigemId, setDepositoOrigemId] = useState('');
  const [almoxDestinoId,   setAlmoxDestinoId]   = useState('');
  const [depositoDestinoId, setDepositoDestinoId] = useState('');
  const [justificativa, setJustificativa]       = useState('');
  const [itens, setItens]                       = useState<ItemRow[]>([{ tempId: uid(), produtoId: '', quantidade: '' }]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };
    fetch('/api/almoxarifados', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setAlmoxarifados(d.map(a => ({ id: a.id, nome: a.nome }))));
    fetch('/api/depositos', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setDepositos(d.map(dep => ({
        id: dep.id, nome: dep.nome,
        almoxarifadoId: dep.almoxarifadoId ?? '',
        almoxarifadoNome: dep.almoxarifadoNome ?? '',
      }))));
    fetch('/api/Produtos', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setProdutos(d.map(p => ({
        id: p.id, nome: p.nome,
        codigo: p.codigo ?? '',
        unidade: p.unidadeMedidaSigla ?? p.unidade ?? '',
      }))));
  }, []);

  // When almox changes, clear the deposito if it doesn't belong to this almox anymore
  const handleAlmoxOrigemChange = (v: string) => {
    setAlmoxOrigemId(v);
    const dep = depositos.find(d => d.id === depositoOrigemId);
    if (dep && v && dep.almoxarifadoId !== v) setDepositoOrigemId('');
  };

  const handleAlmoxDestinoChange = (v: string) => {
    setAlmoxDestinoId(v);
    const dep = depositos.find(d => d.id === depositoDestinoId);
    if (dep && v && dep.almoxarifadoId !== v) setDepositoDestinoId('');
  };

  const depositosOrigem  = almoxOrigemId  ? depositos.filter(d => d.almoxarifadoId === almoxOrigemId)  : depositos;
  const depositosDestino = almoxDestinoId ? depositos.filter(d => d.almoxarifadoId === almoxDestinoId) : depositos;

  const tipo = detectTipo(almoxOrigemId, depositoOrigemId, almoxDestinoId, depositoDestinoId);

  const addItem = () => setItens(prev => [...prev, { tempId: uid(), produtoId: '', quantidade: '' }]);

  const removeItem = (tempId: string) =>
    setItens(prev => prev.length > 1 ? prev.filter(i => i.tempId !== tempId) : prev);

  const updateItem = (tempId: string, field: 'produtoId' | 'quantidade', value: string) =>
    setItens(prev => prev.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const temOrigem  = !!(almoxOrigemId  || depositoOrigemId);
    const temDestino = !!(almoxDestinoId || depositoDestinoId);

    if (!temOrigem && !temDestino)
      e.origemDestino = 'Informe ao menos uma origem ou destino.';

    if (depositoOrigemId && depositoDestinoId && depositoOrigemId === depositoDestinoId)
      e.origemDestino = 'Origem e destino não podem ser o mesmo depósito.';

    if (!justificativa.trim())
      e.justificativa = 'Justificativa é obrigatória.';

    itens.forEach((item, i) => {
      if (!item.produtoId) e[`item_produto_${i}`] = 'Selecione o produto.';
      const q = parseFloat(item.quantidade);
      if (!item.quantidade || isNaN(q) || q <= 0) e[`item_qtd_${i}`] = 'Informe a quantidade.';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const token = localStorage.getItem('token');
    const body = {
      almoxarifadoOrigemId:   almoxOrigemId    || null,
      depositoOrigemId:       depositoOrigemId || null,
      almoxarifadoDestinoId:  almoxDestinoId   || null,
      depositoDestinoId:      depositoDestinoId || null,
      justificativa,
      itens: itens.map(i => ({ produtoId: i.produtoId, quantidade: parseFloat(i.quantidade) })),
    };

    try {
      const res = await fetch('/api/movimentacoes/lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setErrors({ form: err?.detail ?? err?.title ?? 'Erro ao registrar movimentação.' });
        return;
      }

      showToast();
      navigate('/estoque/movimentacoes');
    } catch {
      setErrors({ form: 'Erro inesperado. Verifique a conexão.' });
    } finally {
      setSaving(false);
    }
  };

  const tipoCfg = tipo ? TIPO_CFG[tipo] : null;

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <Home size={11} /><ChevronRight size={11} />
          <span>Estoque</span><ChevronRight size={11} />
          <button onClick={() => navigate('/estoque/movimentacoes')}
            className="hover:text-gray-800 transition-colors">Movimentações</button>
          <ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Nova Movimentação</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Registrar Movimentação</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Informe origem, destino e os produtos envolvidos.
            </p>
          </div>
          {tipoCfg && (
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full', tipoCfg.badge)}>
              {tipoCfg.icon}
              {tipoCfg.label}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl space-y-6">

          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.form}
            </div>
          )}

          {errors.origemDestino && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              {errors.origemDestino}
            </div>
          )}

          {/* Origem / Destino */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">Localização</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Origem */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Origem</p>
                <Field label="Almoxarifado de origem">
                  <select value={almoxOrigemId} onChange={e => handleAlmoxOrigemChange(e.target.value)}
                    className={selectCls()}>
                    <option value="">— Nenhum —</option>
                    {almoxarifados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </Field>
                <Field label="Depósito de origem">
                  <select value={depositoOrigemId} onChange={e => setDepositoOrigemId(e.target.value)}
                    className={selectCls()}>
                    <option value="">— Nenhum —</option>
                    {depositosOrigem.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </Field>
              </div>

              {/* Destino */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destino</p>
                <Field label="Almoxarifado de destino">
                  <select value={almoxDestinoId} onChange={e => handleAlmoxDestinoChange(e.target.value)}
                    className={selectCls()}>
                    <option value="">— Nenhum —</option>
                    {almoxarifados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </Field>
                <Field label="Depósito de destino">
                  <select value={depositoDestinoId} onChange={e => setDepositoDestinoId(e.target.value)}
                    className={selectCls()}>
                    <option value="">— Nenhum —</option>
                    {depositosDestino.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* Justificativa */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <Field label="Justificativa" required error={errors.justificativa}>
              <textarea
                value={justificativa}
                onChange={e => setJustificativa(e.target.value)}
                rows={3}
                placeholder="Descreva o motivo da movimentação…"
                className={cn(
                  'w-full text-sm border-b pt-1 resize-none bg-transparent focus:outline-none placeholder:text-gray-300 transition-colors',
                  errors.justificativa ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
                )}
              />
            </Field>
          </div>

          {/* Produtos */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800">Produtos</p>
              <button onClick={addItem}
                className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-gray-300 text-xs font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors">
                <Plus size={12} /> Adicionar produto
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-600 pb-2 pr-3">Produto</th>
                    <th className="text-right text-xs font-semibold text-gray-600 pb-2 w-28">Quantidade</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, idx) => {
                    const prod = produtos.find(p => p.id === item.produtoId);
                    return (
                      <tr key={item.tempId} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-3">
                          <select
                            value={item.produtoId}
                            onChange={e => updateItem(item.tempId, 'produtoId', e.target.value)}
                            className={cn(
                              'w-full h-8 bg-transparent text-sm border-b transition-colors focus:outline-none',
                              errors[`item_produto_${idx}`] ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
                            )}
                          >
                            <option value="">Selecionar produto…</option>
                            {produtos.map(p => (
                              <option key={p.id} value={p.id}>{p.nome} {p.codigo ? `(${p.codigo})` : ''}</option>
                            ))}
                          </select>
                          {errors[`item_produto_${idx}`] && (
                            <p className="text-[11px] text-red-500 mt-0.5">{errors[`item_produto_${idx}`]}</p>
                          )}
                        </td>
                        <td className="py-2 pl-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0.0001"
                              step="0.0001"
                              value={item.quantidade}
                              onChange={e => updateItem(item.tempId, 'quantidade', e.target.value)}
                              placeholder="0"
                              className={cn(
                                'w-full h-8 bg-transparent text-sm border-b text-right transition-colors focus:outline-none tabular-nums',
                                errors[`item_qtd_${idx}`] ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
                              )}
                            />
                            {prod && (
                              <span className="text-xs text-gray-400 shrink-0 w-8">{prod.unidade}</span>
                            )}
                          </div>
                          {errors[`item_qtd_${idx}`] && (
                            <p className="text-[11px] text-red-500 mt-0.5 text-right">{errors[`item_qtd_${idx}`]}</p>
                          )}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <button
                            onClick={() => removeItem(item.tempId)}
                            disabled={itens.length === 1}
                            className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-0 transition-colors rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          onClick={() => navigate('/estoque/movimentacoes')}
          className="h-9 px-5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Registrar Movimentação
        </button>
      </div>
    </div>
  );
}
