import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ChevronRight, Home, Loader2, Save, Pencil,
  Plus, Trash2, Search, Users, Lock, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Modo = 'criar' | 'editar' | 'visualizar';

interface VendedorVinculo {
  id: string;
  vendedorId: string;
  vendedorNome: string;
}

interface VendedorOption {
  id: string;
  nome: string;
  doc: string;
}

// ─── Componentes base ─────────────────────────────────────────────────────────

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

const textareaCls = (disabled?: boolean) => cn(
  'w-full text-sm border rounded-md px-3 py-2 transition-colors focus:outline-none placeholder:text-gray-300 resize-none',
  'border-gray-300 focus:border-[#1D4E89]',
  disabled && 'opacity-60 cursor-default bg-gray-50',
);

// input com borda usado apenas na busca de vendedores (autocomplete)
const searchInputCls = () => cn(
  'w-full h-9 px-3 text-sm border rounded-md transition-all',
  'focus:outline-none focus:ring-2 focus:ring-[#1D4E89]/25 focus:border-[#1D4E89]',
  'placeholder:text-gray-400 border-gray-300',
);

// ─── Busca de vendedores ──────────────────────────────────────────────────────

function VendedorSearch({ onSelect, existingIds }: {
  onSelect: (v: VendedorOption) => void;
  existingIds: string[];
}) {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState<VendedorOption[]>([]);
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = { Authorization: `Bearer ${token}` };
        const [rF, rJ] = await Promise.all([
          fetch('/api/PessoasFisicas', { headers }),
          fetch('/api/PessoasJuridicas', { headers }),
        ]);
        const [fisicas, juridicas]: [any[], any[]] = await Promise.all([rF.json(), rJ.json()]);
        const vendedores: VendedorOption[] = [
          ...fisicas.filter(p => p.ativo && (p.papelPessoa & 8)).map(p => ({ id: p.id, nome: p.nome, doc: p.cpf })),
          ...juridicas.filter(p => p.ativo && (p.papelPessoa & 8)).map(p => ({ id: p.id, nome: p.razaoSocial, doc: p.cnpj })),
        ];
        const q = query.toLowerCase();
        setResults(
          vendedores
            .filter(v => !existingIds.includes(v.id) &&
              (!q || v.nome.toLowerCase().includes(q) || v.doc.includes(query)))
            .slice(0, 8)
        );
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, open, existingIds]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className={cn(searchInputCls(), 'pl-8')}
          placeholder="Buscar vendedor por nome ou documento…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
        />
        {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {results.map(v => (
            <button key={v.id} type="button"
              onClick={() => { onSelect(v); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <p className="text-sm font-medium text-gray-700">{v.nome}</p>
              <p className="text-[11px] text-gray-400">{v.doc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function FormaPagamentoFormPage() {
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
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // campos do formulário
  const [nome, setNome]           = useState('');
  const [descricao, setDescricao] = useState('');
  const [ativo, setAtivo]         = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removerVendedorTarget, setRemoverVendedorTarget] = useState<VendedorVinculo | null>(null);

  // vendedores vinculados
  const [vendedores, setVendedores] = useState<VendedorVinculo[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ─── Carregar ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    const fn = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/formas-pagamento/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { navigate('/cadastros/formas-pagamento'); return; }
      const data: any = await res.json();
      setNome(data.nome);
      setDescricao(data.descricao ?? '');
      setAtivo(data.ativo);
      setVendedores((data.vendedores ?? []).map((v: any) => ({
        id:           v.id,
        vendedorId:   v.vendedorId,
        vendedorNome: v.vendedorNome,
      })));
      setLoading(false);
    };
    fn();
  }, [id, navigate]);

  // ─── Validação ───────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'O nome é obrigatório.';
    if (nome.trim().length > 100) e.nome = 'Máximo 100 caracteres.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  // ─── Salvar ──────────────────────────────────────────────────────────────────

  const execSave = async () => {
    setSaving(true);
    setGlobalError('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const body = {
      nome:      nome.trim(),
      descricao: descricao.trim() || undefined,
    };
    try {
      const res = modo === 'criar'
        ? await fetch('/api/formas-pagamento', { method: 'POST', headers, body: JSON.stringify(body) })
        : await fetch(`/api/formas-pagamento/${id}`, {
            method: 'PUT', headers,
            body: JSON.stringify({ id, ...body, ativo }),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Erro ao salvar.');
      }
      showToast();
      navigate('/cadastros/formas-pagamento');
    } catch (err: any) {
      setGlobalError(err.message ?? 'Erro inesperado. Tente novamente.');
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

  // ─── Vínculo de vendedores ───────────────────────────────────────────────────

  const handleAdicionarVendedor = async (v: VendedorOption) => {
    if (!id) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/formas-pagamento/${id}/vendedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ vendedorId: v.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.message ?? 'Erro ao vincular vendedor.');
      return;
    }
    setVendedores(prev => [...prev, { id: crypto.randomUUID(), vendedorId: v.id, vendedorNome: v.nome }]);
  };

  const handleRemoverVendedor = (vinculo: VendedorVinculo) => {
    if (!id) return;
    setRemoverVendedorTarget(vinculo);
  };

  const execRemoverVendedor = async () => {
    if (!removerVendedorTarget) return;
    const vinculo = removerVendedorTarget;
    setRemoverVendedorTarget(null);
    setRemovingId(vinculo.vendedorId);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/formas-pagamento/${id}/vendedores/${vinculo.vendedorId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast(data.message ?? 'Erro ao remover vendedor.');
      setRemovingId(null);
      return;
    }
    setVendedores(prev => prev.filter(v => v.vendedorId !== vinculo.vendedorId));
    setRemovingId(null);
  };

  // ─── Renderização ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  const titulo: Record<Modo, string> = {
    criar:      'Nova Forma de Pagamento',
    editar:     'Editar Forma de Pagamento',
    visualizar: 'Forma de Pagamento',
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} />
          <ChevronRight size={11} />
          <button onClick={() => navigate('/cadastros/formas-pagamento')} className="hover:text-gray-600 transition-colors">
            Formas de Pagamento
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto px-6 py-6">

          {globalError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {globalError}
            </div>
          )}

          {/* Nome */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">
              Nome {!readonly && <span className="text-red-400">*</span>}
            </label>
            <input
              disabled={readonly}
              value={nome}
              onChange={e => { setNome(e.target.value); clearError('nome'); }}
              placeholder="Ex: Boleto, PIX, Cartão de Crédito…"
              maxLength={100}
              className={underline(fieldErrors.nome)}
            />
            {fieldErrors.nome && (
              <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">Descrição</label>
            <textarea
              disabled={readonly}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder={readonly ? '—' : 'Condições, observações, restrições…'}
              rows={2}
              maxLength={500}
              className={textareaCls(readonly)}
            />
            <p className="text-[11px] text-gray-400 mt-0.5">Detalhes adicionais visíveis internamente</p>
          </div>

          {modo === 'editar' && (
            <div className="flex items-center gap-1.5 py-4 border-b border-gray-100">
              <span className="text-sm text-gray-700">Ativo?</span>
              <Toggle checked={ativo} onChange={setAtivo} />
            </div>
          )}

          {modo === 'visualizar' && (
            <div className="flex items-center gap-2 py-2">
              <span className="text-xs text-gray-500">Status:</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                {ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          )}

          {/* Vendedores autorizados (só aparece no modo visualizar/editar) */}
          {id && (
            <div className="mt-6 rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Vendedores autorizados</h2>
                  {vendedores.length > 0 && (
                    <span className="text-[11px] bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
                      {vendedores.length}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Aviso explicativo */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-700">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  <span>
                    {vendedores.length === 0
                      ? 'Sem restrição — todos os vendedores podem usar esta forma de pagamento.'
                      : `Restrita a ${vendedores.length} ${vendedores.length === 1 ? 'vendedor' : 'vendedores'}. Apenas eles poderão usar esta forma nos pedidos.`}
                  </span>
                </div>

                {/* Lista de vendedores */}
                {vendedores.length > 0 && (
                  <ul className="space-y-1">
                    {vendedores.map(v => (
                      <li key={v.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Lock size={11} className="text-amber-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{v.vendedorNome}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverVendedor(v)}
                          disabled={removingId === v.vendedorId}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          {removingId === v.vendedorId
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Busca de vendedores */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                    <Plus size={12} /> Adicionar vendedor
                  </p>
                  <VendedorSearch
                    onSelect={handleAdicionarVendedor}
                    existingIds={vendedores.map(v => v.vendedorId)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/cadastros/formas-pagamento')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {readonly ? 'Voltar' : 'Cancelar'}
          </button>

          {readonly ? (
            <button
              type="button"
              onClick={() => navigate(`/cadastros/formas-pagamento/${id}/editar`)}
              className="flex items-center gap-1.5 h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors"
            >
              <Pencil size={13} /> Editar
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving
                ? <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                : <span className="flex items-center gap-1.5"><Save size={13} /> Salvar</span>
              }
            </button>
          )}
        </div>
      </form>

      <ModalMsg
        aberto={confirmOpen}
        variante="aviso"
        titulo="Salvar alterações?"
        descricao="Os dados da forma de pagamento serão atualizados. Deseja continuar?"
        labelConfirmar="Salvar"
        onConfirmar={() => { setConfirmOpen(false); execSave(); }}
        onCancelar={() => setConfirmOpen(false)}
      />

      <ModalMsg
        aberto={removerVendedorTarget !== null}
        titulo="Remover vendedor"
        descricao={removerVendedorTarget ? `Remover "${removerVendedorTarget.vendedorNome}" desta forma de pagamento?` : ''}
        variante="perigo"
        labelConfirmar="Remover"
        onConfirmar={execRemoverVendedor}
        onCancelar={() => setRemoverVendedorTarget(null)}
      />
    </div>
  );
}
