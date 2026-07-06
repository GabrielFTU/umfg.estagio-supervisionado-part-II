import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, ChevronDown, Pencil, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';
import { fetchWithAuth } from '@/services/api';

type Modo = 'criar' | 'editar' | 'visualizar';

type PessoaOpt = { id: string; nome: string };
type CondicaoPagOpt = { id: string; nome: string; numeroParcelas: number };
type FormaPagOpt = { id: string; nome: string };

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function trintaDias() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseBRL(masked: string): number {
  return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0;
}

const ul = (err?: boolean, ro?: boolean) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
  ro  ? 'bg-gray-50 cursor-default border-gray-200' :
  err ? 'border-red-400' : 'border-gray-300 focus:border-[#1D4E89]',
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
  const { showToast } = useToast();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const readonly = modo === 'visualizar';
  const roId = readonly || modo === 'editar'; 

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmSalvarOpen, setConfirmSalvarOpen]   = useState(false);
  const [confirmCancelarOpen, setConfirmCancelarOpen] = useState(false);

  const [pessoas, setPessoas]       = useState<PessoaOpt[]>([]);
  const [condicoesPag, setCondicoesPag] = useState<CondicaoPagOpt[]>([]);
  const [formasPag, setFormasPag]   = useState<FormaPagOpt[]>([]);
  const [maisOpcoes, setMaisOpcoes] = useState(false);

  // Campos
  const [valor, setValor]               = useState('');
  const [emissao, setEmissao]           = useState(hoje());
  const [vencimento, setVencimento]     = useState(trintaDias());
  const [descricao, setDescricao]       = useState('');
  const [tipo, setTipo]                 = useState('Manual');
  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState('');
  const [formaPagamentoId, setFormaPagamentoId] = useState('');
  const [formaPagamentoNome, setFormaPagamentoNome] = useState<string | null>(null);
  const [numeroDocumento, setNumeroDoc] = useState('');
  const [pessoaId, setPessoaId]         = useState('');
  const [observacao, setObs]            = useState('');

  // Campos somente leitura para auto-geradas
  const [pedidoVendaId, setPedidoVendaId]       = useState<string | null>(null);
  const [pedidoVendaCodigo, setPedidoVendaCodigo] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth('/api/Pessoas?papel=Cliente')
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setPessoas(d.map(p => ({ id: p.id, nome: p.nomeCompleto ?? p.razaoSocial ?? p.nome ?? '—' }))));

    fetchWithAuth('/api/condicoes-pagamento')
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setCondicoesPag(d.filter((c: any) => c.ativo).map((c: any) => ({ id: c.id, nome: c.nome, numeroParcelas: c.numeroParcelas }))));

    fetchWithAuth('/api/formas-pagamento')
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setFormasPag(d.filter((f: any) => f.ativo).map((f: any) => ({ id: f.id, nome: f.nome }))));
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchConta = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/contas-receber/${id}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        setDescricao(d.descricao ?? '');
        setValor(d.valorTotal != null ? Number(d.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
        setVencimento(d.dataVencimento?.slice(0, 10) ?? trintaDias());
        setEmissao(d.dataEmissao?.slice(0, 10) ?? hoje());
        setNumeroDoc(d.numeroDocumento ?? '');
        setObs(d.observacoes ?? '');
        setPessoaId(d.pessoaId ?? '');
        setFormaPagamentoId(d.formaPagamentoId ?? '');
        setFormaPagamentoNome(d.formaPagamentoNome ?? null);
        setPedidoVendaId(d.pedidoVendaId ?? null);
        setPedidoVendaCodigo(d.pedidoVendaCodigo ?? null);
        setStatus(d.status ?? null);
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
    if (!valor.trim() || parseBRL(valor) <= 0)
      e.valor = 'Valor inválido.';
    if (!vencimento) e.vencimento = 'Obrigatório.';
    if (!descricao.trim()) e.descricao = 'Obrigatório.';
    if (modo === 'criar' && !condicaoPagamentoId) e.condicaoPagamentoId = 'Selecione a condição de pagamento.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmSalvarOpen(true);
  };

  const salvar = async () => {
    setConfirmSalvarOpen(false);
    setSaving(true);
    setError('');
    try {
      const body = {
        descricao: descricao.trim(),
        valorTotal: parseBRL(valor),
        dataVencimento: vencimento,
        observacoes: observacao.trim() || undefined,
        numeroDocumento: numeroDocumento.trim() || undefined,
        pessoaId: pessoaId || undefined,
        condicaoPagamentoId: condicaoPagamentoId || undefined,
        formaPagamentoId: formaPagamentoId || undefined,
      };
      const res = modo === 'criar'
        ? await fetchWithAuth('/api/contas-receber', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetchWithAuth(`/api/contas-receber/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, descricao: body.descricao, dataVencimento: body.dataVencimento, observacoes: body.observacoes, numeroDocumento: body.numeroDocumento }),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar.');
      }
      showToast();
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
            <UField label="Valor" required={!roId} error={fieldErrors.valor}>
              <input
                disabled={roId}
                value={valor ? `R$ ${valor}` : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/[^\d,]/g, '');
                  setValor(maskBRL(raw.replace(',', '')));
                  clearErr('valor');
                }}
                placeholder="R$ 0,00"
                readOnly={roId}
                inputMode="decimal"
                className={ul(!!fieldErrors.valor, roId)}
              />
            </UField>
            <UField label="Emissão">
              <DatePicker
                value={emissao}
                onChange={setEmissao}
                disabled
              />
            </UField>
            <UField label="Vencimento" required={!roId} error={fieldErrors.vencimento}>
              <DatePicker
                value={vencimento}
                onChange={v => { setVencimento(v); clearErr('vencimento'); }}
                disabled={roId}
                error={!!fieldErrors.vencimento}
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
                className={ul(!!fieldErrors.descricao)}
              />
            </UField>
          </div>

          {/* Tipo */}
          <div className="mb-6 max-w-xs">
            <UField label="Tipo">
              <p className="text-sm text-gray-500 border-b border-gray-200 bg-gray-50 h-9 px-2 flex items-center">{tipo}</p>
            </UField>
          </div>

          {/* Condição de pagamento + Forma de pagamento (apenas criar) */}
          {modo === 'criar' && (
            <div className="mb-6 grid grid-cols-2 gap-8 max-w-xl">
              <UField label="Condição de pagamento" required error={fieldErrors.condicaoPagamentoId}>
                <select
                  value={condicaoPagamentoId}
                  onChange={e => { setCondicaoPagamentoId(e.target.value); clearErr('condicaoPagamentoId'); }}
                  className={ul(!!fieldErrors.condicaoPagamentoId)}
                >
                  <option value="">Selecione…</option>
                  {condicoesPag.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.numeroParcelas}x)</option>
                  ))}
                </select>
              </UField>
              <UField label="Forma de pagamento">
                <select
                  value={formaPagamentoId}
                  onChange={e => setFormaPagamentoId(e.target.value)}
                  className={ul()}
                >
                  <option value="">Selecione…</option>
                  {formasPag.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </UField>
            </div>
          )}

          {/* Mais opções */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setMaisOpcoes(v => !v)}
              className="flex items-center gap-1.5 text-sm text-[#1D4E89] hover:text-[#163D6D] transition-colors py-2"
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
                  {modo !== 'criar' ? (
                    <UField label="Forma de pagamento">
                      <p className="text-sm text-gray-500 border-b border-gray-200 bg-gray-50 h-9 px-2 flex items-center">
                        {formaPagamentoNome ?? '—'}
                      </p>
                    </UField>
                  ) : <div />}
                  <div className="pb-1">
                    <button
                      type="button"
                      disabled={readonly}
                      className="flex items-center gap-1.5 text-sm text-[#1D4E89] hover:text-[#163D6D] transition-colors disabled:opacity-50"
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
                      'w-full text-sm border rounded-md px-3 py-2 transition-colors focus:outline-none placeholder:text-gray-300 resize-none',
                      'border-gray-300 focus:border-[#1D4E89]',
                      readonly && 'cursor-default bg-gray-50',
                    )}
                  />
                  {!readonly && (
                    <p className="text-[11px] text-gray-300 text-right">{500 - observacao.length} restantes</p>
                  )}
                </UField>
              </div>
            )}
          </div>

        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => modo !== 'visualizar' ? setConfirmCancelarOpen(true) : navigate('/financeiro/contas-receber')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          >
            Cancelar
          </button>

          {readonly ? (
            status !== 'Pago' && status !== 'Cancelado' && (
              <button
                type="button"
                onClick={() => navigate(`/financeiro/contas-receber/${id}/editar`)}
                className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
            )
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {saving
                ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                : 'Salvar'}
            </button>
          )}
        </div>
      </form>

      <ModalMsg
        aberto={confirmSalvarOpen}
        variante="aviso"
        titulo={modo === 'criar' ? 'Criar conta a receber?' : 'Salvar alterações?'}
        descricao={modo === 'criar' ? 'A conta a receber será registrada. Deseja continuar?' : 'Os dados da conta a receber serão atualizados. Deseja continuar?'}
        labelConfirmar="Salvar"
        onConfirmar={salvar}
        onCancelar={() => setConfirmSalvarOpen(false)}
      />

      <ModalMsg
        aberto={confirmCancelarOpen}
        variante="perigo"
        titulo="Descartar alterações?"
        descricao="As informações preenchidas serão perdidas. Deseja sair assim mesmo?"
        labelConfirmar="Sair"
        onConfirmar={() => navigate('/financeiro/contas-receber')}
        onCancelar={() => setConfirmCancelarOpen(false)}
      />
    </div>
  );
}
