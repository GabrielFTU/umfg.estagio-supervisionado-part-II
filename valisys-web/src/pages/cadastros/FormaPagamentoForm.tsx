import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ChevronRight, Home, Loader2, CreditCard, Save, X, Pencil,
  Plus, Trash2, Search, Users, Lock, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (error?: string, disabled?: boolean) => cn(
  'w-full h-9 px-3 text-sm border rounded-md transition-all',
  'focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]',
  'placeholder:text-gray-400',
  disabled && 'bg-gray-50 text-gray-600 cursor-default',
  error && !disabled ? 'border-red-400' : 'border-gray-300',
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
    if (!query.trim()) { setResults([]); return; }
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
            .filter(v => !existingIds.includes(v.id) && (v.nome.toLowerCase().includes(q) || v.doc.includes(query)))
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
          className={cn(inputCls(), 'pl-8')}
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
  const [prazoDias, setPrazoDias] = useState('');
  const [ativo, setAtivo]         = useState(true);

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
      setPrazoDias(data.prazoDias != null ? String(data.prazoDias) : '');
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
    if (prazoDias !== '') {
      const n = Number(prazoDias);
      if (!Number.isInteger(n) || n < 0 || n > 3650) e.prazoDias = 'Prazo deve ser entre 0 e 3650 dias.';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  // ─── Salvar ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setGlobalError('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const body = {
      nome:      nome.trim(),
      descricao: descricao.trim() || undefined,
      prazoDias: prazoDias !== '' ? Number(prazoDias) : undefined,
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

      navigate('/cadastros/formas-pagamento');
    } catch (err: any) {
      setGlobalError(err.message ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setSaving(false);
    }
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
    if (!res.ok) return;
    setVendedores(prev => [...prev, { id: crypto.randomUUID(), vendedorId: v.id, vendedorNome: v.nome }]);
  };

  const handleRemoverVendedor = async (vinculo: VendedorVinculo) => {
    if (!id || !confirm(`Remover "${vinculo.vendedorNome}" desta forma de pagamento?`)) return;
    setRemovingId(vinculo.vendedorId);
    const token = localStorage.getItem('token');
    await fetch(`/api/formas-pagamento/${id}/vendedores/${vinculo.vendedorId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
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
    <div className="flex flex-col h-full">

      {/* ── Breadcrumb ── */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <button onClick={() => navigate('/cadastros/formas-pagamento')}
            className="hover:text-gray-600 transition-colors">
            Formas de Pagamento
          </button>
          <ChevronRight size={11} />
          <span className="text-gray-600 font-medium">{titulo[modo]}</span>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6 bg-[#eef1f6]">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-[#3B82F6]" />
            </div>
            <h1 className="text-base font-semibold text-gray-800">{titulo[modo]}</h1>
          </div>

          {globalError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {globalError}
            </div>
          )}

          {/* Card principal */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
              <div className="p-5 space-y-5">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dados</h2>

                <Field label="Nome" required={!readonly} error={fieldErrors.nome}>
                  <input
                    disabled={readonly}
                    value={nome}
                    onChange={e => { setNome(e.target.value); clearError('nome'); }}
                    placeholder="Ex: Boleto 30/60/90, PIX, Cartão de Crédito…"
                    maxLength={100}
                    className={inputCls(fieldErrors.nome, readonly)}
                  />
                </Field>

                <Field label="Descrição" hint="Detalhes adicionais visíveis internamente">
                  {readonly ? (
                    <div className={cn(inputCls(), 'flex items-center min-h-[60px] py-2 h-auto')}>
                      <span className={descricao ? 'text-gray-700' : 'text-gray-300 italic'}>
                        {descricao || 'Sem descrição'}
                      </span>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={descricao}
                      onChange={e => setDescricao(e.target.value)}
                      placeholder="Condições, observações, restrições…"
                      maxLength={500}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6] placeholder:text-gray-400 resize-none"
                    />
                  )}
                </Field>

                <Field
                  label="Prazo (dias)"
                  hint="Use 0 para pagamento à vista. Deixe vazio se não aplicável."
                  error={fieldErrors.prazoDias}
                >
                  {readonly ? (
                    <div className={cn(inputCls(), 'flex items-center')}>
                      <span className="text-gray-700">
                        {prazoDias === '' ? '—' : prazoDias === '0' ? 'À vista' : `${prazoDias} dias`}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      max={3650}
                      value={prazoDias}
                      onChange={e => { setPrazoDias(e.target.value); clearError('prazoDias'); }}
                      placeholder="Ex: 30"
                      className={cn(inputCls(fieldErrors.prazoDias), 'max-w-[180px]')}
                    />
                  )}
                </Field>

                {/* Toggle ativo — modo editar */}
                {modo === 'editar' && (
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Status</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {ativo ? 'Ativa e disponível para uso' : 'Inativa'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAtivo(v => !v)}
                      className={cn(
                        'relative w-10 h-[22px] rounded-full transition-colors duration-200',
                        ativo ? 'bg-[#3B82F6]' : 'bg-gray-200',
                      )}
                    >
                      <span className={cn(
                        'absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                        ativo ? 'translate-x-5' : 'translate-x-[3px]',
                      )} />
                    </button>
                  </div>
                )}

                {modo === 'visualizar' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">Status:</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                      {ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer do form */}
              <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                {readonly ? (
                  <>
                    <button type="button" onClick={() => navigate('/cadastros/formas-pagamento')}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                      Voltar
                    </button>
                    <button type="button" onClick={() => navigate(`/cadastros/formas-pagamento/${id}/editar`)}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563eb] transition-colors">
                      <Pencil size={12} /> Editar
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => navigate('/cadastros/formas-pagamento')}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                      <X size={13} /> Cancelar
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-md bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-70">
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      {saving ? 'Salvando…' : 'Salvar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>

          {/* ── Card de Vendedores (só aparece no modo visualizar/editar) ── */}
          {id && (
            <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
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
      </div>
    </div>
  );
}
