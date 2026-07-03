import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, ChevronDown, Pencil, Repeat, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { SelectField } from '@/components/ui/SelectField';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';
import { fetchWithAuth } from '@/services/api';

type Modo = 'criar' | 'editar' | 'visualizar';

type PessoaOpt = { id: string; nome: string };
type FormaPagOpt = { id: string; nome: string };
type CondicaoPagOpt = { id: string; nome: string; numeroParcelas: number };

const FREQUENCIAS = ['Semanal', 'Quinzenal', 'Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'] as const;
type Frequencia = typeof FREQUENCIAS[number];
interface Recorrencia { frequencia: Frequencia; numeroOcorrencias: number }

function hoje() {
  return new Date().toISOString().slice(0, 10);
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

const ul = (err?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
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

function RepetirMenu({ value, onChange, disabled }: {
  value: Recorrencia | null; onChange: (v: Recorrencia | null) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [frequencia, setFrequencia] = useState<Frequencia>(value?.frequencia ?? 'Mensal');
  const [numero, setNumero] = useState(value?.numeroOcorrencias ?? 12);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          value ? 'text-[#1D4E89] font-medium' : 'text-[#1D4E89] hover:text-[#163D6D]',
        )}
      >
        <Repeat size={14} />
        {value ? `Repete: ${value.frequencia} · ${value.numeroOcorrencias}x` : 'Repetir'}
      </button>

      {open && (
        <div className="absolute z-30 left-0 top-full mt-1.5 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Repetir lançamento</p>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500">
              <X size={13} />
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Frequência</label>
            <select
              value={frequencia}
              onChange={e => setFrequencia(e.target.value as Frequencia)}
              className="w-full h-9 text-sm border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none bg-transparent text-gray-700"
            >
              {FREQUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Número de repetições (2 a 60)</label>
            <input
              type="number"
              min={2}
              max={60}
              value={numero}
              onChange={e => setNumero(Math.min(60, Math.max(2, Number(e.target.value) || 2)))}
              className="w-full h-9 text-sm border-b border-gray-300 focus:border-[#1D4E89] focus:outline-none bg-transparent text-gray-700"
            />
          </div>

          <p className="text-[11px] text-gray-400">
            Serão geradas {numero} contas a partir do vencimento informado, repetindo a cada período {frequencia.toLowerCase()}.
          </p>

          <div className="flex items-center justify-between pt-1">
            {value ? (
              <button type="button" onClick={() => { onChange(null); setOpen(false); }}
                className="text-xs text-red-500 hover:text-red-600">
                Remover repetição
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => { onChange({ frequencia, numeroOcorrencias: numero }); setOpen(false); }}
              className="text-xs px-3 py-1.5 rounded-full bg-[#1D4E89] text-white hover:bg-[#163D6D] transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContaPagarFormPage() {
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const [pessoas, setPessoas]         = useState<PessoaOpt[]>([]);
  const [formasPag, setFormasPag]     = useState<FormaPagOpt[]>([]);
  const [condicoesPag, setCondicoesPag] = useState<CondicaoPagOpt[]>([]);
  const [maisOpcoes, setMaisOpcoes]   = useState(false);

  // Campos do formulário
  const [valor, setValor]               = useState('');
  const [vencimento, setVencimento]     = useState(hoje());
  const [competencia, setCompetencia]   = useState(hoje());
  const [descricao, setDescricao]       = useState('');
  const [tipo]                          = useState('Manual');
  const [previsao, setPrevisao]         = useState(false);
  const [numeroDocumento, setNumeroDoc] = useState('');
  const [emissao, setEmissao]           = useState(hoje());
  const [pessoaId, setPessoaId]         = useState('');
  const [formaPagamento, setFormaPag]   = useState('');
  const [observacao, setObs]            = useState('');
  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState('');
  const [recorrencia, setRecorrencia]   = useState<Recorrencia | null>(null);

  // Checkbox extras do footer
  const [baixar, setBaixar]         = useState(false);
  const [status, setStatus]         = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth('/api/Pessoas?papel=Fornecedor')
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setPessoas(d.map(p => ({ id: p.id, nome: p.nomeCompleto ?? p.nome ?? '—' }))));

    fetchWithAuth('/api/formas-pagamento')
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setFormasPag(d.filter((f: any) => f.ativo).map((f: any) => ({ id: f.id, nome: f.nome }))));

    fetchWithAuth('/api/condicoes-pagamento')
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setCondicoesPag(d.filter((c: any) => c.ativo).map((c: any) => ({ id: c.id, nome: c.nome, numeroParcelas: c.numeroParcelas }))));
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchConta = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/contas-pagar/${id}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        setDescricao(d.descricao ?? '');
        setValor(d.valorTotal != null ? Number(d.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
        setVencimento(d.dataVencimento?.slice(0, 10) ?? hoje());
        setNumeroDoc(d.numeroDocumento ?? '');
        setObs(d.observacoes ?? '');
        setPessoaId(d.fornecedorId ?? '');
        setFormaPag(d.formaPagamentoId ?? '');
        setEmissao(d.dataEmissao?.slice(0, 10) ?? hoje());
        setStatus(d.status ?? null);
      } catch {
        setError('Não foi possível carregar a conta a pagar.');
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
    if (!readonly && !pessoaId) e.pessoaId = 'Selecione a pessoa (fornecedor).';
    if (modo === 'criar' && !condicaoPagamentoId) e.condicaoPagamentoId = 'Selecione a condição de pagamento.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const execSave = async () => {
    setSaving(true);
    setError('');
    try {
      const body = {
        descricao: descricao.trim(),
        valorTotal: parseBRL(valor),
        dataVencimento: vencimento,
        observacoes: observacao.trim() || undefined,
        numeroDocumento: numeroDocumento.trim() || undefined,
        fornecedorId: pessoaId || undefined,
        condicaoPagamentoId: condicaoPagamentoId || undefined,
        formaPagamentoId: formaPagamento || undefined,
        recorrencia: modo === 'criar' && recorrencia ? recorrencia : undefined,
      };
      const res = modo === 'criar'
        ? await fetchWithAuth('/api/contas-pagar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetchWithAuth(`/api/contas-pagar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, descricao: body.descricao, dataVencimento: body.dataVencimento, observacoes: body.observacoes, numeroDocumento: body.numeroDocumento }),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar.');
      }
      showToast();
      navigate('/financeiro/contas-pagar');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  const titulo: Record<Modo, string> = {
    criar:      'Nova conta a pagar',
    editar:     'Dados da conta a pagar',
    visualizar: 'Dados da conta a pagar',
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/financeiro/contas-pagar')} className="hover:text-gray-600 transition-colors">
            Contas a pagar
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

          {/* Pessoa (fornecedor) */}
          <div className="mb-6 max-w-md">
            <SelectField
              label="Pessoa"
              required={!readonly}
              error={fieldErrors.pessoaId}
              value={pessoaId}
              onChange={v => { setPessoaId(v); clearErr('pessoaId'); }}
              options={pessoas.map(p => ({ value: p.id, label: p.nome }))}
              placeholder="Selecione uma pessoa…"
              readOnly={readonly}
            />
          </div>

          {/* Linha 1: Valor | Vencimento | Competência */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <UField label="Valor" required={!readonly} error={fieldErrors.valor}>
              <input
                disabled={readonly}
                value={valor ? `R$ ${valor}` : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/[^\d,]/g, '');
                  setValor(maskBRL(raw.replace(',', '')));
                  clearErr('valor');
                }}
                placeholder="R$ 0,00"
                inputMode="decimal"
                className={ul(fieldErrors.valor)}
              />
            </UField>
            <UField label="Vencimento" required={!readonly} error={fieldErrors.vencimento}>
              <DatePicker
                value={vencimento}
                onChange={v => { setVencimento(v); clearErr('vencimento'); }}
                disabled={readonly}
                error={!!fieldErrors.vencimento}
              />
            </UField>
            <UField label="Competência" required={!readonly}>
              <DatePicker
                value={competencia}
                onChange={setCompetencia}
                disabled={readonly}
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
          <div className="mb-6 max-w-xs">
            <UField label="Tipo">
              <p className="text-sm text-gray-500 border-b border-gray-200 bg-gray-50 h-9 px-2 flex items-center">{tipo}</p>
            </UField>
          </div>

          {/* Forma de pagamento + Condição de pagamento (apenas criar) */}
          {modo === 'criar' && (
            <div className="mb-6 grid grid-cols-2 gap-8 max-w-xl">
              <SelectField
                label="Forma de pagamento"
                value={formaPagamento}
                onChange={setFormaPag}
                options={formasPag.map(f => ({ value: f.id, label: f.nome }))}
                placeholder="Selecione…"
              />
              <SelectField
                label="Condição de pagamento"
                required
                value={condicaoPagamentoId}
                onChange={v => { setCondicaoPagamentoId(v); clearErr('condicaoPagamentoId'); }}
                options={condicoesPag.map(c => ({ value: c.id, label: `${c.nome} (${c.numeroParcelas}x)` }))}
                placeholder="Selecione…"
                error={fieldErrors.condicaoPagamentoId}
              />
            </div>
          )}

          {/* Toggle Previsão */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-2">
            <span className="text-sm text-gray-700">Previsão?</span>
            <button
              type="button"
              disabled={readonly}
              onClick={() => !readonly && setPrevisao(v => !v)}
              className={cn(
                'relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0',
                previsao ? 'bg-[#1D4E89]' : 'bg-gray-200',
                readonly && 'opacity-60 cursor-default',
              )}
            >
              <span className={cn(
                'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                previsao ? 'translate-x-[17px]' : 'translate-x-0',
              )} />
            </button>
          </div>

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
                {/* Número doc | Emissão | Repetir */}
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
                  <UField label="Emissão">
                    <DatePicker
                      value={emissao}
                      onChange={setEmissao}
                      disabled
                    />
                  </UField>
                  <div className="pb-1">
                    <RepetirMenu
                      value={recorrencia}
                      onChange={setRecorrencia}
                      disabled={readonly || modo !== 'criar'}
                    />
                  </div>
                </div>

                {/* Forma de pagamento (somente leitura fora do modo criar) */}
                {modo !== 'criar' && (
                  <UField label="Forma de pagamento">
                    <p className="text-sm text-gray-500 border-b border-gray-200 bg-gray-50 h-9 px-2 flex items-center">
                      {formasPag.find(f => f.id === formaPagamento)?.nome ?? '—'}
                    </p>
                  </UField>
                )}

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
                      'border-gray-300 focus:border-[#1D4E89]',
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

        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/financeiro/contas-pagar')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          >
            Cancelar
          </button>

          {readonly ? (
            status !== 'Pago' && status !== 'Cancelado' && (
              <button
                type="button"
                onClick={() => navigate(`/financeiro/contas-pagar/${id}/editar`)}
                className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
            )
          ) : (
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={baixar}
                  onChange={e => setBaixar(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Baixar
              </label>
              <button
                type="submit"
                disabled={saving}
                className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
              >
                {saving
                  ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                  : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </form>
      <ModalMsg
        aberto={confirmOpen}
        variante="aviso"
        titulo="Salvar alterações?"
        descricao="As informações do cliente serão atualizadas, e as antigas serão perdidas. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={execSave}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
