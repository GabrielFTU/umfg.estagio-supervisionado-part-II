import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Modo = 'criar' | 'editar' | 'visualizar';
type AlmoxarifadoOption = { id: string; nome: string };

type FormatoLocal = {
  id: string;
  formato: string;
  prefixoLocal: string;
  ativo: boolean;
};

type DepositoData = {
  id: string;
  almoxarifadoId: string;
  codigoIdentificador: number;
  nome: string;
  depositoPadraoRequisicoes: boolean;
  controlaQualidade2a: boolean;
  controlaLote: boolean;
  controlaMultiplosLocais: boolean;
  ativo: boolean;
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
        'relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0',
        checked ? 'bg-[#3B82F6]' : 'bg-gray-200',
        disabled && 'opacity-60 cursor-default',
      )}
    >
      <span className={cn(
        'absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-[3px]',
      )} />
    </button>
  );
}

function ToggleRow({ label, checked, onChange, disabled }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <span className="text-sm text-gray-700">{label}</span>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

const underline = (error?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300',
  error ? 'border-red-400' : 'border-gray-300 focus:border-[#3B82F6]',
);

export function DepositoFormPage() {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const modo: Modo = !id
    ? 'criar'
    : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const readonly = modo === 'visualizar';

  const [loading, setLoading]       = useState(!!id);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [almoxarifados, setAlmoxarifados] = useState<AlmoxarifadoOption[]>([]);

  const [almoxarifadoId, setAlmoxarifadoId]           = useState('');
  const [codigoIdentificador, setCodigoIdentificador] = useState('');
  const [nome, setNome]                               = useState('');
  const [ativo, setAtivo]                             = useState(true);
  const [depositoPadraoRequisicoes, setDepositoPadraoRequisicoes] = useState(false);
  const [controlaQualidade2a, setControlaQualidade2a]             = useState(false);
  const [controlaLote, setControlaLote]                           = useState(false);
  const [controlaMultiplosLocais, setControlaMultiplosLocais]     = useState(false);

  const [formatos, setFormatos]       = useState<FormatoLocal[]>([]);
  const [adicionando, setAdicionando] = useState(false);
  const [novoFormato, setNovoFormato] = useState('');
  const [novoPrefixo, setNovoPrefixo] = useState('');

  useEffect(() => {
    const fetchAlmox = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/Almoxarifado', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setAlmoxarifados(data.filter((a: any) => a.ativo).map((a: any) => ({ id: a.id, nome: a.nome })));
        }
      } catch {}
    };
    fetchAlmox();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchDeposito = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/Deposito/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data: DepositoData = await res.json();
        setAlmoxarifadoId(data.almoxarifadoId);
        setCodigoIdentificador(String(data.codigoIdentificador));
        setNome(data.nome);
        setAtivo(data.ativo);
        setDepositoPadraoRequisicoes(data.depositoPadraoRequisicoes ?? false);
        setControlaQualidade2a(data.controlaQualidade2a ?? false);
        setControlaLote(data.controlaLote ?? false);
        setControlaMultiplosLocais(data.controlaMultiplosLocais ?? false);

        if (readonly) {
          const r2 = await fetch('/api/Almoxarifado', { headers: { Authorization: `Bearer ${token}` } });
          if (r2.ok) setAlmoxarifados((await r2.json()).map((a: any) => ({ id: a.id, nome: a.nome })));
        }
      } catch {
        setError('Não foi possível carregar o depósito.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeposito();
  }, [id, readonly]);

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!almoxarifadoId) erros.almoxarifadoId = 'Obrigatório.';
    if (!codigoIdentificador.trim() || isNaN(Number(codigoIdentificador)) || Number(codigoIdentificador) <= 0)
      erros.codigoIdentificador = 'Código inválido.';
    if (!nome.trim()) erros.nome = 'O nome é obrigatório.';
    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const body = {
        almoxarifadoId,
        codigoIdentificador: Number(codigoIdentificador),
        nome: nome.trim(),
        depositoPadraoRequisicoes,
        controlaQualidade2a,
        controlaLote,
        controlaMultiplosLocais,
      };
      const res = modo === 'criar'
        ? await fetch('/api/Deposito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/Deposito/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, ...body, ativo }),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Erro ao salvar depósito.');
      }
      navigate('/cadastros/depositos');
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const confirmarFormato = () => {
    if (!novoFormato.trim()) return;
    setFormatos(prev => [...prev, {
      id: crypto.randomUUID(),
      formato: novoFormato.trim(),
      prefixoLocal: novoPrefixo.trim(),
      ativo: true,
    }]);
    setNovoFormato('');
    setNovoPrefixo('');
    setAdicionando(false);
  };

  const cancelarFormato = () => {
    setAdicionando(false);
    setNovoFormato('');
    setNovoPrefixo('');
  };

  const almoxNome = almoxarifados.find(a => a.id === almoxarifadoId)?.nome ?? '—';

  const titulo: Record<Modo, string> = {
    criar:      'Novo Depósito',
    editar:     'Dados do depósito',
    visualizar: 'Dados do depósito',
  };

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
          <button onClick={() => navigate('/cadastros/depositos')} className="hover:text-gray-600 transition-colors">
            Depósito
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

          {/* Almoxarifado + Código */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Almoxarifado {!readonly && <span className="text-red-400">*</span>}
              </label>
              {readonly ? (
                <p className="text-sm text-gray-700 border-b border-gray-200 h-9 flex items-center">{almoxNome}</p>
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
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Código {!readonly && <span className="text-red-400">*</span>}
              </label>
              <input
                type="number" min={1} disabled={readonly}
                value={codigoIdentificador}
                onChange={e => { setCodigoIdentificador(e.target.value); clearErr('codigoIdentificador'); }}
                placeholder="Ex: 1"
                className={underline(fieldErrors.codigoIdentificador)}
              />
              {fieldErrors.codigoIdentificador && (
                <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.codigoIdentificador}</p>
              )}
            </div>
          </div>

          {/* Nome */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500 mb-1">
              Nome {!readonly && <span className="text-red-400">*</span>}
            </label>
            <input
              disabled={readonly}
              value={nome}
              onChange={e => { setNome(e.target.value); clearErr('nome'); }}
              placeholder="Nome do depósito"
              maxLength={100}
              className={underline(fieldErrors.nome)}
            />
            {fieldErrors.nome && (
              <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.nome}</p>
            )}
          </div>

          {/* 4 toggles */}
          <ToggleRow
            label="Depósito padrão para requisições?"
            checked={depositoPadraoRequisicoes}
            onChange={setDepositoPadraoRequisicoes}
            disabled={readonly}
          />
          <ToggleRow
            label="Controla produto acabado de 2ª qualidade?"
            checked={controlaQualidade2a}
            onChange={setControlaQualidade2a}
            disabled={readonly}
          />
          <ToggleRow
            label="Controla lote?"
            checked={controlaLote}
            onChange={setControlaLote}
            disabled={readonly}
          />
          <ToggleRow
            label="Controla múltiplos locais?"
            checked={controlaMultiplosLocais}
            onChange={setControlaMultiplosLocais}
            disabled={readonly}
          />

          {/* Status toggle — apenas no modo editar */}
          {modo === 'editar' && (
            <ToggleRow label="Ativo?" checked={ativo} onChange={setAtivo} />
          )}

          {/* Formato do local */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#3B82F6]">Formato do local</h2>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => setAdicionando(true)}
                  className="flex items-center gap-1 text-sm text-[#3B82F6] hover:text-[#2563eb] transition-colors"
                >
                  <Plus size={13} /> Adicionar
                </button>
              )}
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-600 py-2 pr-6 text-xs">Formato</th>
                  <th className="text-left font-semibold text-gray-600 py-2 pr-6 text-xs">Prefixo local</th>
                  <th className="text-left font-semibold text-gray-600 py-2 text-xs w-24">Status</th>
                  {!readonly && <th className="w-8" />}
                </tr>
              </thead>
              <tbody>
                {adicionando && (
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-6">
                      <input
                        autoFocus
                        value={novoFormato}
                        onChange={e => setNovoFormato(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); confirmarFormato(); }
                          if (e.key === 'Escape') cancelarFormato();
                        }}
                        placeholder="Ex: AAA"
                        className="w-full border-b border-gray-300 focus:border-[#3B82F6] focus:outline-none text-sm py-1 bg-transparent"
                      />
                    </td>
                    <td className="py-2 pr-6">
                      <input
                        value={novoPrefixo}
                        onChange={e => setNovoPrefixo(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); confirmarFormato(); }
                          if (e.key === 'Escape') cancelarFormato();
                        }}
                        placeholder="Ex: A"
                        className="w-full border-b border-gray-300 focus:border-[#3B82F6] focus:outline-none text-sm py-1 bg-transparent"
                      />
                    </td>
                    <td className="py-2 text-[11px] text-emerald-600">Ativo</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={confirmarFormato}
                          className="text-xs text-[#3B82F6] hover:underline">OK</button>
                        <button type="button" onClick={cancelarFormato}
                          className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                      </div>
                    </td>
                  </tr>
                )}

                {formatos.length === 0 && !adicionando ? (
                  <tr>
                    <td colSpan={readonly ? 3 : 4} className="py-8 text-center text-sm text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  formatos.map(f => (
                    <tr key={f.id} className="border-b border-gray-100">
                      <td className="py-2.5 pr-6 text-gray-700">{f.formato}</td>
                      <td className="py-2.5 pr-6 text-gray-500">{f.prefixoLocal || '—'}</td>
                      <td className="py-2.5">
                        <span className={cn(
                          'text-[11px] px-2 py-0.5 rounded-full font-medium',
                          f.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500',
                        )}>
                          {f.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      {!readonly && (
                        <td className="py-2.5">
                          <button
                            type="button"
                            onClick={() => setFormatos(prev => prev.filter(x => x.id !== f.id))}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/cadastros/depositos')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/cadastros/depositos/${id}/editar`)}
              className="h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors"
            >
              Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
