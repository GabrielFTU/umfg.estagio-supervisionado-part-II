import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, ChevronDown, Plus, Pencil, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Modo = 'criar' | 'editar' | 'visualizar';

type PessoaOpt = { id: string; nome: string };

const TIPOS = ['Manual', 'Automático', 'Importado'];

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function trintaDias() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

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
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export function ContaReceberFormPage() {
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

  const [pessoas, setPessoas]       = useState<PessoaOpt[]>([]);
  const [maisOpcoes, setMaisOpcoes] = useState(false);

  // Campos
  const [valor, setValor]               = useState('');
  const [emissao, setEmissao]           = useState(hoje());
  const [vencimento, setVencimento]     = useState(trintaDias());
  const [descricao, setDescricao]       = useState('');
  const [tipo, setTipo]                 = useState('Manual');
  const [numeroParcelas, setNumParcelas] = useState('1');
  const [numeroDocumento, setNumeroDoc] = useState('');
  const [pessoaId, setPessoaId]         = useState('');
  const [observacao, setObs]            = useState('');

  // Campos somente leitura para auto-geradas
  const [pedidoVendaId, setPedidoVendaId]       = useState<string | null>(null);
  const [pedidoVendaCodigo, setPedidoVendaCodigo] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };

    fetch('/api/Pessoas', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setPessoas(d.map(p => ({ id: p.id, nome: p.nomeCompleto ?? p.razaoSocial ?? p.nome ?? '—' }))));
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchConta = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/contas-receber/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const d = await res.json();
        setDescricao(d.descricao ?? '');
        setValor(String(d.valorTotal ?? ''));
        setVencimento(d.dataVencimento?.slice(0, 10) ?? trintaDias());
        setEmissao(d.dataEmissao?.slice(0, 10) ?? hoje());
        setNumeroDoc(d.numeroDocumento ?? '');
        setObs(d.observacoes ?? '');
        setPessoaId(d.pessoaId ?? '');
        setNumParcelas(String(d.parcelas?.length ?? 1));
        setPedidoVendaId(d.pedidoVendaId ?? null);
        setPedidoVendaCodigo(d.pedidoVendaCodigo ?? null);
        if (d.pedidoVendaId) setTipo('Automático');
      } catch {
        setError('Não foi possível carregar a conta a receber.');
      } finally {
        setLoading(false);
      }
    };
    fetchConta();
  }, [id]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!valor.trim() || isNaN(Number(valor.replace(',', '.'))) || Number(valor.replace(',', '.')) <= 0)
      e.valor = 'Valor inválido.';
    if (!vencimento) e.vencimento = 'Obrigatório.';
    if (!descricao.trim()) e.descricao = 'Obrigatório.';
    const n = parseInt(numeroParcelas);
    if (isNaN(n) || n < 1) e.numeroParcelas = 'Mínimo 1.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const valorNum = parseFloat(valor.replace(',', '.'));
      const body = {
        descricao: descricao.trim(),
        valorTotal: valorNum,
        dataVencimento: vencimento,
        observacoes: observacao.trim() || undefined,
        numeroDocumento: numeroDocumento.trim() || undefined,
        pessoaId: pessoaId || undefined,
        numeroParcelas: parseInt(numeroParcelas) || 1,
      };
      const res = modo === 'criar'
        ? await fetch('/api/contas-receber', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/contas-receber/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, descricao: body.descricao, dataVencimento: body.dataVencimento, observacoes: body.observacoes, numeroDocumento: body.numeroDocumento }),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar.');
      }
      navigate('/financeiro/contas-receber');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado.');
    } finally {
      setSaving(false);
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
    criar:      'Nova conta a receber',
    editar:     'Dados da conta a receber',
    visualizar: 'Dados da conta a receber',
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/financeiro/contas-receber')} className="hover:text-gray-600 transition-colors">
            Contas a receber
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

          {/* Banner: gerada automaticamente */}
          {pedidoVendaId && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-600">
              <Link2 size={14} className="shrink-0" />
              <span>
                Esta conta foi gerada automaticamente pelo{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/comercial/pedidos/${pedidoVendaId}`)}
                  className="font-medium underline hover:text-blue-800 transition-colors"
                >
                  Pedido de Venda #{pedidoVendaCodigo}
                </button>
              </span>
            </div>
          )}

          {/* Linha 1: Valor | Emissão | Vencimento */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <UField label="Valor" required={!readonly} error={fieldErrors.valor}>
              <input
                disabled={readonly}
                value={valor}
                onChange={e => { setValor(e.target.value); clearErr('valor'); }}
                placeholder="R$ 0,00"
                className={ul(fieldErrors.valor)}
              />
            </UField>
            <UField label="Emissão" required={!readonly}>
              <input
                type="date"
                disabled={readonly}
                value={emissao}
                onChange={e => setEmissao(e.target.value)}
                className={ul()}
              />
            </UField>
            <UField label="Vencimento" required={!readonly} error={fieldErrors.vencimento}>
              <input
                type="date"
                disabled={readonly}
                value={vencimento}
                onChange={e => { setVencimento(e.target.value); clearErr('vencimento'); }}
                className={ul(fieldErrors.vencimento)}
              />
            </UField>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <UField label="Descrição" required={!readonly} error={fieldErrors.descricao}>
              <input
                disabled={readonly}
                value={descricao}
                onChange={e => { setDescricao(e.target.value); clearErr('descricao'); }}
                placeholder="Descreva a conta"
                maxLength={200}
                className={ul(fieldErrors.descricao)}
              />
            </UField>
          </div>

          {/* Tipo */}
          <div className="mb-6">
            <UField label="Tipo" required={!readonly}>
              {readonly || pedidoVendaId ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">{tipo}</p>
              ) : (
                <select value={tipo} onChange={e => setTipo(e.target.value)} className={ul()}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </UField>
          </div>

          {/* Parcelas (apenas criar) */}
          {modo === 'criar' && (
            <div className="mb-6 max-w-xs">
              <UField label="Número de parcelas" error={fieldErrors.numeroParcelas}>
                <input
                  type="number" min={1} max={60}
                  value={numeroParcelas}
                  onChange={e => { setNumParcelas(e.target.value); clearErr('numeroParcelas'); }}
                  className={ul(fieldErrors.numeroParcelas)}
                />
              </UField>
            </div>
          )}

          {/* Mais opções */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setMaisOpcoes(v => !v)}
              className="flex items-center gap-1.5 text-sm text-[#3B82F6] hover:text-[#2563eb] transition-colors py-2"
            >
              <ChevronDown size={14} className={cn('transition-transform duration-150', maisOpcoes && 'rotate-180')} />
              Mais opções
            </button>

            {maisOpcoes && (
              <div className="mt-4 space-y-6">
                {/* Número doc | Emissão (campo) | Repetir */}
                <div className="grid grid-cols-3 gap-8 items-end">
                  <UField label="Número do documento">
                    <input
                      disabled={readonly}
                      value={numeroDocumento}
                      onChange={e => setNumeroDoc(e.target.value)}
                      placeholder="Nº do documento"
                      className={ul()}
                    />
                  </UField>
                  <div />
                  <div className="pb-1">
                    <button
                      type="button"
                      disabled={readonly}
                      className="flex items-center gap-1.5 text-sm text-[#3B82F6] hover:text-[#2563eb] transition-colors disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 4v6h6M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      Repetir
                    </button>
                  </div>
                </div>

                {/* Pessoa */}
                <UField label="Cliente / Pessoa">
                  {readonly ? (
                    <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                      {pessoas.find(p => p.id === pessoaId)?.nome ?? '—'}
                    </p>
                  ) : (
                    <select value={pessoaId} onChange={e => setPessoaId(e.target.value)} className={ul()}>
                      <option value="">Selecione uma pessoa…</option>
                      {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  )}
                </UField>

                {/* Observação */}
                <UField label="Observação">
                  <textarea
                    disabled={readonly}
                    value={observacao}
                    onChange={e => setObs(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder={readonly ? '—' : 'Observações sobre esta conta…'}
                    className={cn(
                      'w-full text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300 resize-none py-2 bg-transparent',
                      'border-gray-300 focus:border-[#3B82F6]',
                      readonly && 'cursor-default',
                    )}
                  />
                  {!readonly && (
                    <p className="text-[11px] text-gray-300 text-right">{500 - observacao.length} restantes</p>
                  )}
                </UField>
              </div>
            )}
          </div>

          {/* Seção de Apropriações */}
          <div className="mt-4">
            {!readonly && (
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-[#3B82F6] hover:text-[#2563eb] transition-colors mb-3"
              >
                <Plus size={13} /> Adicionar apropriação
              </button>
            )}

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-600 py-2 text-xs">Conta</th>
                  <th className="text-right font-semibold text-gray-600 py-2 text-xs w-36">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={2} className="py-5 text-center text-sm text-gray-400">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td className="py-2 text-xs text-gray-500 font-medium"></td>
                  <td className="py-2 text-right text-sm font-semibold text-gray-700">R$ 0,00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/financeiro/contas-receber')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          >
            Cancelar
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/financeiro/contas-receber/${id}/editar`)}
              className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors"
            >
              <Pencil size={13} /> Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {saving
                ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                : 'Salvar'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
