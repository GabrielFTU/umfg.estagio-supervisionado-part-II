import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Modo = 'criar' | 'editar' | 'visualizar';

interface Parcela { numero: number; numeroDias: number; percentual: number }

interface FormState {
  nome: string;
  numeroParcelas: number;
  diasParaPrimeiroVencimento: number;
  diasEntreParcelas: number;
  vencimentoDiaFixo: boolean;
  ativo: boolean;
}

const uInput = 'w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300';

function UField({ label, required, error, small, children }: {
  label: string; required?: boolean; error?: string; small?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn('border-b py-3 transition-colors focus-within:border-[#3B82F6]',
      error ? 'border-red-400' : 'border-gray-200', small && 'py-2')}>
      <label className="block text-xs text-gray-400 mb-0.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function gerarParcelas(n: number, diasPrimeiro: number, diasEntre: number): Parcela[] {
  if (n <= 0) return [];
  const pct = n > 0 ? parseFloat((100 / n).toFixed(4)) : 0;
  const total = parseFloat((pct * (n - 1)).toFixed(4));
  const ultima = parseFloat((100 - total).toFixed(4));

  return Array.from({ length: n }, (_, i) => ({
    numero: i + 1,
    numeroDias: diasPrimeiro + i * diasEntre,
    percentual: i === n - 1 ? ultima : pct,
  }));
}

export function CondicaoPagamentoFormPage() {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const modo: Modo = !id ? 'criar' : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const readOnly   = modo === 'visualizar';

  const [loading, setLoading]   = useState(!!id);
  const [saving, setSaving]     = useState(false);
  const [erros, setErros]       = useState<Record<string, string>>({});
  const [globalErr, setGlobalErr] = useState('');

  const [form, setForm] = useState<FormState>({
    nome: '', numeroParcelas: 1, diasParaPrimeiroVencimento: 30,
    diasEntreParcelas: 30, vencimentoDiaFixo: false, ativo: true,
  });
  const [parcelas, setParcelas] = useState<Parcela[]>(() =>
    gerarParcelas(1, 30, 30)
  );

  const setF = <K extends keyof FormState>(key: K) => (val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const recalcularParcelas = useCallback((n: number, diasP: number, diasE: number) => {
    setParcelas(gerarParcelas(n, diasP, diasE));
  }, []);

  useEffect(() => {
    if (!id) return;
    const fn = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/condicoes-pagamento/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { navigate('/cadastros/condicoes-pagamento'); return; }
      const data = await res.json();
      setForm({
        nome: data.nome, numeroParcelas: data.numeroParcelas,
        diasParaPrimeiroVencimento: data.diasParaPrimeiroVencimento,
        diasEntreParcelas: data.diastEntreParcelas ?? data.diasEntreParcelas ?? 30,
        vencimentoDiaFixo: data.vencimentoDiaFixo, ativo: data.ativo,
      });
      setParcelas(data.parcelas.map((p: any) => ({
        numero: p.numero, numeroDias: p.numeroDias, percentual: Number(p.percentual),
      })));
      setLoading(false);
    };
    fn();
  }, [id, navigate]);

  const handleNumeroParcelasChange = (val: number) => {
    const n = Math.max(1, Math.min(360, val || 1));
    setF('numeroParcelas')(n);
    recalcularParcelas(n, form.diasParaPrimeiroVencimento, form.diasEntreParcelas);
  };

  const handleDiasPrimeiroChange = (val: number) => {
    const v = Math.max(0, val || 0);
    setF('diasParaPrimeiroVencimento')(v);
    recalcularParcelas(form.numeroParcelas, v, form.diasEntreParcelas);
  };

  const handleDiasEntreChange = (val: number) => {
    const v = Math.max(0, val || 0);
    setF('diasEntreParcelas')(v);
    recalcularParcelas(form.numeroParcelas, form.diasParaPrimeiroVencimento, v);
  };

  const setParcelaDias = (idx: number, dias: number) => {
    setParcelas(prev => prev.map((p, i) => i === idx ? { ...p, numeroDias: Math.max(0, dias) } : p));
  };

  const setParcelaPercentual = (idx: number, val: number) => {
    setParcelas(prev => prev.map((p, i) => i === idx ? { ...p, percentual: val } : p));
  };

  const totalPercentual = parcelas.reduce((s, p) => s + (Number(p.percentual) || 0), 0);

  const handleSalvar = async () => {
    const novosErros: Record<string, string> = {};
    if (!form.nome.trim()) novosErros.nome = 'O nome é obrigatório.';
    if (form.numeroParcelas < 1) novosErros.numeroParcelas = 'Mínimo 1 parcela.';
    if (Math.abs(totalPercentual - 100) > 0.01) novosErros.percentual = 'A soma dos percentuais deve ser 100%.';
    if (Object.keys(novosErros).length) { setErros(novosErros); return; }

    setSaving(true); setGlobalErr('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const body = {
      id, nome: form.nome.trim(), numeroParcelas: form.numeroParcelas,
      diasParaPrimeiroVencimento: form.diasParaPrimeiroVencimento,
      diastEntreParcelas: form.diasEntreParcelas,
      vencimentoDiaFixo: form.vencimentoDiaFixo, ativo: form.ativo,
      parcelas: parcelas.map(p => ({ numero: p.numero, numeroDias: p.numeroDias, percentual: p.percentual })),
    };
    try {
      const res = modo === 'criar'
        ? await fetch('/api/condicoes-pagamento', { method: 'POST', headers, body: JSON.stringify(body) })
        : await fetch(`/api/condicoes-pagamento/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Erro ao salvar.');
      }
      navigate('/cadastros/condicoes-pagamento');
    } catch (err: any) {
      setGlobalErr(err.message);
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  const titulo = modo === 'criar' ? 'Nova Condição' : modo === 'editar' ? 'Editar Condição' : form.nome;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Topo ── */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate('/cadastros/condicoes-pagamento')}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
          <ChevronLeft size={17} />
        </button>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <button onClick={() => navigate('/cadastros/condicoes-pagamento')} className="hover:text-gray-600">
            Condição de pagamento
          </button>
          <span>›</span>
          <span className="text-gray-600">{titulo}</span>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 pb-24">

          {globalErr && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{globalErr}</div>
          )}

          {/* Campos principais */}
          <div className="mt-1 max-w-2xl">
            <UField label="Nome" required error={erros.nome}>
              {readOnly
                ? <p className="text-sm text-gray-700">{form.nome}</p>
                : <input className={uInput} value={form.nome} placeholder="Ex: 30/60/90" maxLength={100}
                    onChange={e => { setF('nome')(e.target.value); setErros(p => ({ ...p, nome: '' })); }} />
              }
            </UField>

            <div className="grid grid-cols-3 gap-6">
              <UField label="Parcelas" required error={erros.numeroParcelas}>
                {readOnly
                  ? <p className="text-sm text-gray-700">{form.numeroParcelas}</p>
                  : <input type="number" min={1} max={360} className={uInput} value={form.numeroParcelas}
                      onChange={e => handleNumeroParcelasChange(parseInt(e.target.value) || 1)} />
                }
              </UField>

              <UField label="Número de dias para primeiro vencimento" required>
                {readOnly
                  ? <p className="text-sm text-gray-700">{form.diasParaPrimeiroVencimento}</p>
                  : <input type="number" min={0} className={uInput} value={form.diasParaPrimeiroVencimento}
                      onChange={e => handleDiasPrimeiroChange(parseInt(e.target.value) || 0)} />
                }
              </UField>

              <UField label="Número de dias entre parcelas" required>
                {readOnly
                  ? <p className="text-sm text-gray-700">{form.diasEntreParcelas}</p>
                  : <input type="number" min={0} className={uInput} value={form.diasEntreParcelas}
                      onChange={e => handleDiasEntreChange(parseInt(e.target.value) || 0)} />
                }
              </UField>
            </div>

            {/* Toggle vencimento em dia fixo */}
            <div className="py-4 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">Vencimento em dia fixo ?</p>
              <button type="button" disabled={readOnly}
                onClick={() => !readOnly && setF('vencimentoDiaFixo')(!form.vencimentoDiaFixo)}
                className={cn(
                  'relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200',
                  form.vencimentoDiaFixo ? 'bg-[#3B82F6]' : 'bg-gray-200',
                  readOnly && 'cursor-default opacity-70',
                )}>
                <span className={cn(
                  'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                  form.vencimentoDiaFixo ? 'translate-x-[17px]' : 'translate-x-0',
                )} />
              </button>
            </div>

            {/* Toggle ativo (somente editar) */}
            {modo === 'editar' && (
              <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Status</p>
                  <p className="text-xs text-gray-400 mt-0.5">{form.ativo ? 'Ativo' : 'Inativo'}</p>
                </div>
                <button type="button" onClick={() => setF('ativo')(!form.ativo)}
                  className={cn('relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200',
                    form.ativo ? 'bg-[#3B82F6]' : 'bg-gray-200')}>
                  <span className={cn('absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    form.ativo ? 'translate-x-[17px]' : 'translate-x-0')} />
                </button>
              </div>
            )}
          </div>

          {/* Tabela de parcelas */}
          {parcelas.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-[#3B82F6] text-center mb-4">
                Distribuição percentual da(s) parcela(s)
              </p>

              {erros.percentual && (
                <p className="text-[12px] text-red-500 mb-2 text-center">{erros.percentual}</p>
              )}

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-semibold text-gray-700 py-2 w-24">Parcela</th>
                    <th className="text-left text-sm font-semibold text-gray-700 py-2">Número de dias</th>
                    <th className="text-right text-sm font-semibold text-gray-700 py-2 pr-2">Percentual (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.map((p, i) => (
                    <tr key={p.numero} className="border-b border-gray-100">
                      <td className="py-2 text-sm text-gray-700">{p.numero}</td>
                      <td className="py-2">
                        {readOnly
                          ? <span className="text-sm text-gray-500">{p.numeroDias}</span>
                          : (
                            <input type="number" min={0}
                              className="w-28 bg-transparent text-sm text-gray-500 border-b border-gray-200 outline-none focus:border-[#3B82F6] py-0.5 px-1"
                              value={p.numeroDias}
                              onChange={e => setParcelaDias(i, parseInt(e.target.value) || 0)} />
                          )
                        }
                      </td>
                      <td className="py-2 text-right pr-2">
                        {readOnly
                          ? <span className="text-sm text-gray-500">{Number(p.percentual).toFixed(2)} %</span>
                          : (
                            <div className="flex items-center justify-end gap-1">
                              <input type="number" min={0} max={100} step={0.01}
                                className="w-24 bg-transparent text-sm text-gray-500 border-b border-gray-200 outline-none focus:border-[#3B82F6] py-0.5 px-1 text-right"
                                value={p.percentual}
                                onChange={e => setParcelaPercentual(i, parseFloat(e.target.value) || 0)} />
                              <span className="text-sm text-gray-400">%</span>
                            </div>
                          )
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} />
                    <td className={cn(
                      'text-right pr-2 pt-2 text-sm font-semibold',
                      Math.abs(totalPercentual - 100) > 0.01 ? 'text-red-500' : 'text-gray-700',
                    )}>
                      {totalPercentual.toFixed(2)} %
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
        {readOnly ? (
          <>
            <button onClick={() => navigate('/cadastros/condicoes-pagamento')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Voltar</button>
            <button onClick={() => navigate(`/cadastros/condicoes-pagamento/${id}/editar`)}
              className="h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors">
              Editar
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/cadastros/condicoes-pagamento')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
            <button onClick={handleSalvar} disabled={saving}
              className="flex items-center gap-2 h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
