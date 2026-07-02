import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';
import { fetchWithAuth } from '@/services/api';

type Modo = 'criar' | 'editar' | 'visualizar';

interface BrasilAPIBank {
  ispb: string;
  name: string;
  code: number | null;
  fullName: string;
}

function hoje() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

export function CarteiraFormPage() {
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

  // Bancos BrasilAPI
  const [bancos, setBancos] = useState<BrasilAPIBank[]>([]);
  const [bancosLoading, setBancosLoading] = useState(false);
  const [bancoSearch, setBancoSearch] = useState('');
  const [bancoOpen, setBancoOpen] = useState(false);

  // Campos
  const [codigoBanco, setCodigoBanco] = useState('');
  const [nomeBanco, setNomeBanco] = useState('');
  const [titular, setTitular] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [dataHoraSaldoInicial, setDataHoraSaldoInicial] = useState(hoje());

  useEffect(() => {
    setBancosLoading(true);
    fetch('https://brasilapi.com.br/api/banks/v1')
      .then(r => r.ok ? r.json() : [])
      .then((data: BrasilAPIBank[]) => {
        const validos = data
          .filter(b => b.code !== null && b.name)
          .sort((a, b) => (a.code ?? 9999) - (b.code ?? 9999));
        setBancos(validos);
      })
      .catch(() => setBancos([]))
      .finally(() => setBancosLoading(false));
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/carteiras/${id}`);
        if (!res.ok) throw new Error();
        const d = await res.json();
        setCodigoBanco(d.codigoBanco ?? '');
        setNomeBanco(d.nomeBanco ?? '');
        setBancoSearch(d.codigoBanco && d.nomeBanco ? `${d.codigoBanco} - ${d.nomeBanco}` : '');
        setTitular(d.titular ?? '');
        setSaldoInicial(
          d.saldoInicial != null
            ? d.saldoInicial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
            : '',
        );
        if (d.dataHoraSaldoInicial) {
          const dt = new Date(d.dataHoraSaldoInicial);
          const pad = (n: number) => String(n).padStart(2, '0');
          setDataHoraSaldoInicial(
            `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
          );
        }
      } catch {
        setError('Não foi possível carregar a carteira.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!codigoBanco) e.banco = 'Selecione um banco.';
    if (!titular.trim()) e.titular = 'Obrigatório.';
    if (!dataHoraSaldoInicial) e.dataHora = 'Obrigatório.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const execSave = async () => {
    setSaving(true);
    setError('');
    try {
      const body = {
        codigoBanco,
        nomeBanco,
        titular: titular.trim(),
        saldoInicial: parseBRL(saldoInicial),
        dataHoraSaldoInicial: new Date(dataHoraSaldoInicial).toISOString(),
      };

      const res = modo === 'criar'
        ? await fetchWithAuth('/api/carteiras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetchWithAuth(`/api/carteiras/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...body }),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar.');
      }
      showToast();
      navigate('/financeiro/carteira');
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

  const bancosFiltrados = bancos.filter(b => {
    if (!bancoSearch || codigoBanco) return true;
    const q = bancoSearch.toLowerCase();
    return (
      (b.code?.toString() ?? '').includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.fullName.toLowerCase().includes(q)
    );
  });

  const handleBancoSelect = (b: BrasilAPIBank) => {
    setCodigoBanco(b.code?.toString() ?? b.ispb);
    setNomeBanco(b.name);
    setBancoSearch(`${b.code} - ${b.name}`);
    setBancoOpen(false);
    clearErr('banco');
  };

  const handleBancoInputChange = (v: string) => {
    setBancoSearch(v);
    setCodigoBanco('');
    setNomeBanco('');
    setBancoOpen(true);
    clearErr('banco');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  const titulo: Record<Modo, string> = {
    criar:      'Nova carteira',
    editar:     'Editar carteira',
    visualizar: 'Dados da carteira',
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/financeiro/carteira')} className="hover:text-gray-600 transition-colors">
            Gestão de carteiras
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

          {/* Dados principais */}
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">Dados principais</p>
          </div>

          {/* Banco */}
          <div className="mb-6 relative">
            <UField label="Banco" required={!readonly} error={fieldErrors.banco}>
              {readonly ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">
                  {codigoBanco} - {nomeBanco}
                </p>
              ) : (
                <div className="relative">
                  <input
                    value={bancoSearch}
                    onChange={e => handleBancoInputChange(e.target.value)}
                    onFocus={() => setBancoOpen(true)}
                    placeholder={bancosLoading ? 'Carregando bancos…' : 'Pesquise pelo nome ou código'}
                    className={cn(ul(fieldErrors.banco), 'pr-8')}
                    autoComplete="off"
                  />
                  <ChevronDown
                    size={14}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                  />
                  {bancoOpen && !codigoBanco && (
                    <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-auto">
                      {bancosLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                          <Loader2 size={13} className="animate-spin" /> Carregando…
                        </div>
                      ) : bancosFiltrados.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">Nenhum banco encontrado</p>
                      ) : (
                        bancosFiltrados.slice(0, 80).map(b => (
                          <button
                            key={b.ispb}
                            type="button"
                            onMouseDown={() => handleBancoSelect(b)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1D4E89] transition-colors text-left"
                          >
                            <span className="w-9 shrink-0 text-xs font-mono text-gray-400">{b.code}</span>
                            <span className="flex-1 truncate">{b.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </UField>
          </div>

          {/* Titular */}
          <div className="mb-6">
            <UField label="Titular" required={!readonly} error={fieldErrors.titular}>
              <input
                disabled={readonly}
                value={titular}
                onChange={e => { setTitular(e.target.value); clearErr('titular'); }}
                placeholder="Nome do titular da conta"
                maxLength={200}
                className={ul(fieldErrors.titular)}
              />
            </UField>
          </div>

          {/* Saldo inicial + Data/hora */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <UField label="Saldo inicial" required={!readonly}>
              <input
                disabled={readonly}
                value={saldoInicial ? `R$ ${saldoInicial}` : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/[^\d,]/g, '');
                  setSaldoInicial(maskBRL(raw.replace(',', '')));
                }}
                placeholder="R$ 0,00"
                className={ul()}
                inputMode="decimal"
              />
            </UField>

            <UField label="Data e hora do saldo inicial" required={!readonly} error={fieldErrors.dataHora}>
              <input
                type="datetime-local"
                disabled={readonly}
                value={dataHoraSaldoInicial}
                onChange={e => { setDataHoraSaldoInicial(e.target.value); clearErr('dataHora'); }}
                className={cn(ul(fieldErrors.dataHora), 'cursor-pointer')}
              />
            </UField>
          </div>

        </div>

        {/* Footer */}
        {!readonly && (
          <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
            <button
              type="button"
              onClick={() => navigate('/financeiro/carteira')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] disabled:opacity-60 transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        )}

        {readonly && (
          <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
            <button
              type="button"
              onClick={() => navigate('/financeiro/carteira')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => navigate(`/financeiro/carteira/${id}/editar`)}
              className="px-6 py-2 rounded-lg bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors"
            >
              Editar
            </button>
          </div>
        )}
      </form>

      <ModalMsg
        aberto={confirmOpen}
        titulo="Salvar alterações"
        descricao="Deseja salvar as alterações feitas nesta carteira?"
        variante="aviso"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />
    </div>
  );
}
