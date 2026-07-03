import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Loader2, Plus, Trash2, Search,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, TrendingUp, ChevronDown, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';


type Modo = 'criar' | 'editar' | 'visualizar';

const STATUS_CFG: Record<number, { label: string; color: string }> = {
  0: { label: 'Rascunho',   color: 'text-gray-400 bg-gray-100'    },
  1: { label: 'Confirmado', color: 'text-blue-600 bg-blue-50'     },
  2: { label: 'Concluído',  color: 'text-emerald-600 bg-emerald-50' },
  3: { label: 'Cancelado',  color: 'text-red-500 bg-red-50'       },
};

function maskCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return Math.floor(num / 100).toLocaleString('pt-BR') + ',' + String(num % 100).padStart(2, '0');
}
function parseCurrency(masked: string): number {
  if (!masked) return 0;
  return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0;
}
function floatToMask(v: number): string {
  if (!v) return '';
  return maskCurrency(String(Math.round(v * 100)));
}
function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function toDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.split('T')[0];
}


function UField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      'border-b py-3 transition-colors focus-within:border-[#1D4E89]',
      error ? 'border-red-400' : 'border-gray-200',
    )}>
      <label className="block text-xs text-gray-400 mb-0.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

const uCls = 'w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300';


interface SelectOption { value: string; label: string }

function SelectField({ label, required, value, onChange, options, placeholder, readOnly, error }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  options: SelectOption[]; placeholder?: string; readOnly?: boolean; error?: string;
}) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  }, [query, options]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={wrapRef} className={cn(
      'border-b py-3 transition-colors',
      open ? 'border-[#1D4E89]' : error ? 'border-red-400' : 'border-gray-200',
    )}>
      <label className="block text-xs text-gray-400 mb-0.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {readOnly ? (
        <p className="text-sm text-gray-700">{selected?.label || '—'}</p>
      ) : (
        <>
          <button type="button" onClick={() => { setOpen(v => !v); setQuery(''); }}
            className="w-full flex items-center justify-between text-left focus:outline-none">
            <span className={cn('text-sm', value ? 'text-gray-700' : 'text-gray-300')}>
              {selected?.label || placeholder || 'Selecione…'}
            </span>
            <ChevronDown size={14} className={cn('text-gray-400 transition-transform shrink-0', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
              style={{ maxHeight: 220 }}>
              {/* Busca dentro do dropdown */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
                <Search size={12} className="text-gray-400 shrink-0" />
                <input autoFocus className="flex-1 text-sm outline-none placeholder:text-gray-300 bg-transparent"
                  placeholder="Buscar…" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              {/* Lista */}
              <div className="overflow-y-auto" style={{ maxHeight: 170 }}>
                {filtered.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-gray-400 text-center">Nenhum resultado</p>
                ) : filtered.map(o => (
                  <button key={o.value} type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors border-b border-gray-50 last:border-0',
                      o.value === value ? 'bg-blue-50 text-[#1D4E89] font-medium' : 'text-gray-700 hover:bg-gray-50',
                    )}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function SelectWrap(props: Parameters<typeof SelectField>[0]) {
  return (
    <div className="relative">
      <SelectField {...props} />
    </div>
  );
}

interface ClienteOption { id: string; nome: string; doc: string }

function ClienteSearch({
  value, onSelect, readOnly,
}: { value: { id: string; nome: string } | null; onSelect: (c: ClienteOption) => void; readOnly?: boolean }) {
  const [query, setQuery]     = useState(value?.nome ?? '');
  const [results, setResults] = useState<ClienteOption[]>([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value?.nome ?? ''); }, [value?.nome]);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const buscar = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const h: HeadersInit = { Authorization: `Bearer ${token}` };
      const [rF, rJ] = await Promise.all([
        fetch('/api/PessoasFisicas', { headers: h }),
        fetch('/api/PessoasJuridicas', { headers: h }),
      ]);
      const [fisicas, juridicas]: [any[], any[]] = await Promise.all([rF.json(), rJ.json()]);
      const lower = q.toLowerCase();
      const todos: ClienteOption[] = [
        ...fisicas.map(p => ({ id: p.id, nome: p.nome, doc: p.cpf })),
        ...juridicas.map(p => ({ id: p.id, nome: p.razaoSocial, doc: p.cnpj })),
      ];
      setResults(todos.filter(c => c.nome.toLowerCase().includes(lower) || c.doc.includes(q)).slice(0, 8));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (open) buscar(query); }, 300);
    return () => clearTimeout(t);
  }, [query, open, buscar]);

  if (readOnly) return <p className="text-sm text-gray-700">{value?.nome || '—'}</p>;

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2">
        <Search size={13} className="text-gray-300 shrink-0" />
        <input className={uCls}
          placeholder="Buscar por nome, CPF ou CNPJ…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
        />
        {loading && <Loader2 size={13} className="text-gray-400 animate-spin shrink-0" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: 220 }}>
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {results.map(c => (
              <button key={c.id} type="button"
                onClick={() => { onSelect(c); setQuery(c.nome); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-700">{c.nome}</p>
                <p className="text-[11px] text-gray-400">{c.doc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


interface ItemLocal {
  localId: string; id?: string; produtoId: string;
  produtoNome: string; produtoCodigo: string; unidadeMedida: string;
  quantidade: string; valorUnitario: string; descontoUnitario: string;
}

const ItemRow = memo(function ItemRow({
  item, index, readOnly, onUpdate, onRemove,
}: { item: ItemLocal; index: number; readOnly?: boolean; onUpdate: (f: keyof ItemLocal, v: string) => void; onRemove: () => void }) {
  const subtotal = useMemo(() =>
    (parseCurrency(item.valorUnitario) - parseCurrency(item.descontoUnitario)) * (parseInt(item.quantidade, 10) || 0),
    [item.quantidade, item.valorUnitario, item.descontoUnitario]);

  return (
    <tr className="border-b border-gray-50 group/row">
      <td className="py-3 pl-4 pr-3 text-xs text-gray-400 w-8">{index + 1}</td>
      <td className="py-3 pr-4">
        <p className="text-sm text-gray-700">{item.produtoNome}</p>
        <p className="text-[11px] text-gray-400">{item.produtoCodigo} · {item.unidadeMedida}</p>
      </td>
      <td className="py-3 pr-4 w-24 text-center">
        {readOnly
          ? <span className="text-sm text-gray-700">{item.quantidade}</span>
          : <input type="number" min={1} value={item.quantidade}
              onChange={e => onUpdate('quantidade', e.target.value)}
              className="w-full bg-transparent text-sm text-center outline-none border-b border-transparent focus:border-gray-300 transition-colors" />
        }
      </td>
      <td className="py-3 pr-4 w-28 text-right">
        {readOnly
          ? <span className="text-sm text-gray-700">{formatCurrency(parseCurrency(item.valorUnitario))}</span>
          : <input value={item.valorUnitario} onChange={e => onUpdate('valorUnitario', maskCurrency(e.target.value))}
              className="w-full bg-transparent text-sm text-right outline-none border-b border-transparent focus:border-gray-300 transition-colors" placeholder="0,00" />
        }
      </td>
      <td className="py-3 pr-4 w-28 text-right">
        {readOnly
          ? <span className="text-sm text-gray-700">{formatCurrency(parseCurrency(item.descontoUnitario))}</span>
          : <input value={item.descontoUnitario} onChange={e => onUpdate('descontoUnitario', maskCurrency(e.target.value))}
              className="w-full bg-transparent text-sm text-right outline-none border-b border-transparent focus:border-gray-300 transition-colors" placeholder="0,00" />
        }
      </td>
      <td className="py-3 pr-4 text-right w-28">
        <span className="text-sm text-gray-700">{formatCurrency(subtotal)}</span>
      </td>
      {!readOnly && (
        <td className="py-3 pr-4 w-8">
          <button type="button" onClick={onRemove}
            className="opacity-0 group-hover/row:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all">
            <Trash2 size={13} />
          </button>
        </td>
      )}
    </tr>
  );
});

interface ProdutoOption { id: string; nome: string; codigo: string; unidade: string; preco: number }

function ProdutoModal({ onAdd, onClose }: {
  onAdd: (p: ProdutoOption, quantidade: number, valorUnitario: number, descontoUnitario: number) => void;
  onClose: () => void;
}) {
  const [produtos, setProdutos]         = useState<ProdutoOption[]>([]);
  const [loading, setLoading]           = useState(true);
  const [produtoId, setProdutoId]       = useState('');
  const [aplicarDesconto, setAplicarDesconto] = useState(false);
  const [continuar, setContinuar]       = useState(false);
  const [quantidade, setQuantidade]     = useState('1');
  const [valorUnitario, setValorUnitario]     = useState('');
  const [descontoUnitario, setDescontoUnitario] = useState('');
  const [erroProduto, setErroProduto]   = useState('');

  useEffect(() => {
    const fn = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/produtos', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setLoading(false); return; }
      const data: any[] = await res.json();
      setProdutos(data.filter(p => p.ativo).map(p => ({
        id: p.id, nome: p.nome, codigo: String(p.codigoInternoProduto ?? ''),
        unidade: p.unidadeMedida?.sigla ?? 'UN', preco: p.custoPadrao ?? 0,
      })));
      setLoading(false);
    };
    fn();
  }, []);

  const produtoOptions: SelectOption[] = useMemo(
    () => produtos.map(p => ({ value: p.id, label: p.nome + (p.codigo ? ` (${p.codigo})` : '') })),
    [produtos],
  );

  const produtoSelecionado = useMemo(() => produtos.find(p => p.id === produtoId) ?? null, [produtos, produtoId]);

  useEffect(() => {
    if (produtoSelecionado) setValorUnitario(floatToMask(produtoSelecionado.preco));
    else setValorUnitario('');
  }, [produtoId]); 

  const valorTotal =
    (parseCurrency(valorUnitario) - (aplicarDesconto ? parseCurrency(descontoUnitario) : 0)) *
    (parseInt(quantidade, 10) || 0);

  const handleAdicionar = () => {
    if (!produtoSelecionado) { setErroProduto('Selecione um produto.'); return; }
    onAdd(
      produtoSelecionado,
      parseInt(quantidade, 10) || 1,
      parseCurrency(valorUnitario),
      aplicarDesconto ? parseCurrency(descontoUnitario) : 0,
    );
    if (continuar) {
      setProdutoId(''); setQuantidade('1');
      setValorUnitario(''); setDescontoUnitario('');
      setAplicarDesconto(false); setErroProduto('');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] flex flex-col">

      {/* Breadcrumb */}
      <div className="shrink-0 px-8 py-3 bg-white border-b border-gray-100 flex items-center gap-1.5 text-sm text-gray-400">
        <Home size={13} />
        <ChevronRight size={13} />
        <span>Pedido de venda</span>
        <ChevronRight size={13} />
        <span className="text-gray-700 font-medium">Produto</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

          {/* Produto select */}
          <div className="relative">
            <SelectField
              label="Produto"
              required
              value={produtoId}
              onChange={v => { setProdutoId(v); setErroProduto(''); }}
              options={produtoOptions}
              placeholder={loading ? 'Carregando…' : 'Selecione o produto'}
              error={erroProduto}
            />
          </div>

          {/* Toggle desconto */}
          <div className="mt-1 flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Aplicar desconto</span>
            <button
              type="button"
              onClick={() => setAplicarDesconto(v => !v)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none',
                aplicarDesconto ? 'bg-[#1D4E89]' : 'bg-gray-200',
              )}
            >
              <span className={cn(
                'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                aplicarDesconto ? 'translate-x-[18px]' : 'translate-x-[2px]',
              )} />
            </button>
          </div>

          {/* Tabela */}
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs text-gray-500 font-semibold pb-2 pr-4">Produto</th>
                  <th className="text-right text-xs text-gray-500 font-semibold pb-2 pr-4 w-32">Valor unitário</th>
                  {aplicarDesconto && (
                    <th className="text-right text-xs text-gray-500 font-semibold pb-2 pr-4 w-32">Desconto unit.</th>
                  )}
                  <th className="text-right text-xs text-gray-500 font-semibold pb-2 pr-4 w-32">Valor total</th>
                  <th className="text-right text-xs text-gray-500 font-semibold pb-2 w-28">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {!produtoSelecionado ? (
                  <tr>
                    <td colSpan={aplicarDesconto ? 5 : 4} className="py-10 text-center text-sm text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="py-3 pr-4">
                      <p className="text-sm text-gray-700">{produtoSelecionado.nome}</p>
                      <p className="text-[11px] text-gray-400">{produtoSelecionado.codigo} · {produtoSelecionado.unidade}</p>
                    </td>
                    <td className="py-3 pr-4 w-32">
                      <input value={valorUnitario} onChange={e => setValorUnitario(maskCurrency(e.target.value))}
                        className="w-full bg-transparent text-sm text-right outline-none border-b border-gray-300 focus:border-[#1D4E89] transition-colors pb-0.5 placeholder:text-gray-300"
                        placeholder="0,00" />
                    </td>
                    {aplicarDesconto && (
                      <td className="py-3 pr-4 w-32">
                        <input value={descontoUnitario} onChange={e => setDescontoUnitario(maskCurrency(e.target.value))}
                          className="w-full bg-transparent text-sm text-right outline-none border-b border-gray-300 focus:border-[#1D4E89] transition-colors pb-0.5 placeholder:text-gray-300"
                          placeholder="0,00" />
                      </td>
                    )}
                    <td className="py-3 pr-4 w-32 text-right">
                      <span className="text-sm text-gray-700">{formatCurrency(valorTotal)}</span>
                    </td>
                    <td className="py-3 w-28">
                      <input type="number" min={1} value={quantidade} onChange={e => setQuantidade(e.target.value)}
                        className="w-full bg-transparent text-sm text-right outline-none border-b border-gray-300 focus:border-[#1D4E89] transition-colors pb-0.5" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-8 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
        <button type="button" onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Cancelar
        </button>
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={continuar} onChange={e => setContinuar(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-[#1D4E89]" />
            Continuar adicionando
          </label>
          <button type="button" onClick={handleAdicionar}
            className="h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}


interface FormState {
  clienteId: string; representanteNome: string; formaPagamentoId: string;
  condicaoPagamentoId: string; finalidade: string; dataPrevisaoEntrega: string;
  desconto: string; observacaoInterna: string; observacaoExterna: string;
}

export function PedidoVendaFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();

  const modo: Modo = !id ? 'criar' : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const readOnly   = modo === 'visualizar';

  const [loading, setLoading]   = useState(!!id);
  const [saving, setSaving]     = useState(false);
  const [erros, setErros]       = useState<Record<string, string>>({});
  const [globalErr, setGlobalErr] = useState('');
  const [statusPedido, setStatusPedido]   = useState(0);
  const [codigoPedido, setCodigoPedido]   = useState<number | null>(null);
  const [pedidoId, setPedidoId]           = useState<string | null>(id ?? null);
  const [showModal, setShowModal]         = useState(false);
  const [mudarStatusAcao, setMudarStatusAcao] = useState<'confirmar' | 'cancelar' | 'concluir' | null>(null);
  const [formasPagamento, setFormasPagamento]     = useState<SelectOption[]>([]);
  const [condicoesPagamento, setCondicoesPagamento] = useState<SelectOption[]>([]);
  const [finalidades, setFinalidades]             = useState<SelectOption[]>([]);

  const [cliente, setCliente] = useState<{ id: string; nome: string } | null>(null);
  const [form, setForm] = useState<FormState>({
    clienteId: '', representanteNome: '', formaPagamentoId: '',
    condicaoPagamentoId: '', finalidade: '', dataPrevisaoEntrega: '',
    desconto: '', observacaoInterna: '', observacaoExterna: '',
  });
  const [itens, setItens] = useState<ItemLocal[]>([]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };

    fetch('/api/formas-pagamento', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => setFormasPagamento(data.filter(f => f.ativo).map(f => ({ value: f.nome, label: f.nome }))));

    fetch('/api/condicoes-pagamento', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => setCondicoesPagamento(data.filter(f => f.ativo).map(f => ({ value: f.nome, label: f.nome }))));

    fetch('/api/finalidades', { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => setFinalidades(data.filter(f => f.ativo).map(f => ({ value: f.nome, label: f.nome }))));
  }, []);


  useEffect(() => {
    if (!id) return;
    const fn = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pedidos-venda/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { navigate('/comercial/pedidos'); return; }
      const data: any = await res.json();
      setCodigoPedido(data.codigo); setStatusPedido(data.status); setPedidoId(data.id);
      setCliente({ id: data.clienteId, nome: data.clienteNome });
      setForm({
        clienteId: data.clienteId, representanteNome: data.representanteNome ?? '',
        formaPagamentoId: data.formaPagamento ?? '',
        condicaoPagamentoId: data.condicaoPagamento ?? '',
        finalidade: data.finalidade ?? '',
        dataPrevisaoEntrega: toDateInput(data.dataPrevisaoEntrega), desconto: floatToMask(data.desconto),
        observacaoInterna: data.observacaoInterna ?? '', observacaoExterna: data.observacaoExterna ?? '',
      });
      setItens((data.itens ?? []).map((i: any) => ({
        localId: i.id, id: i.id, produtoId: i.produtoId, produtoNome: i.produtoNome,
        produtoCodigo: i.produtoCodigo ?? '', unidadeMedida: i.unidadeMedida ?? 'UN',
        quantidade: String(i.quantidade), valorUnitario: floatToMask(i.valorUnitario),
        descontoUnitario: floatToMask(i.descontoUnitario),
      })));
      setLoading(false);
    };
    fn();
  }, [id, navigate]);


  const { subtotal, desconto, total } = useMemo(() => {
    const sub = itens.reduce((s, i) =>
      s + (parseCurrency(i.valorUnitario) - parseCurrency(i.descontoUnitario)) * (parseInt(i.quantidade, 10) || 0), 0);
    const desc = parseCurrency(form.desconto);
    return { subtotal: sub, desconto: desc, total: sub - desc };
  }, [itens, form.desconto]);

  const addProduto = (p: ProdutoOption, quantidade: number, valorUnitario: number, descontoUnitario: number) => {
    const exists = itens.find(i => i.produtoId === p.id);
    if (exists) {
      setItens(prev => prev.map(i => i.produtoId === p.id
        ? { ...i, quantidade: String(quantidade), valorUnitario: floatToMask(valorUnitario), descontoUnitario: floatToMask(descontoUnitario) }
        : i,
      ));
    } else {
      setItens(prev => [...prev, {
        localId: crypto.randomUUID(), produtoId: p.id, produtoNome: p.nome,
        produtoCodigo: p.codigo, unidadeMedida: p.unidade,
        quantidade: String(quantidade),
        valorUnitario: floatToMask(valorUnitario),
        descontoUnitario: floatToMask(descontoUnitario),
      }]);
    }
  };

  const updateItem = (localId: string, field: keyof ItemLocal, value: string) =>
    setItens(prev => prev.map(i => i.localId === localId ? { ...i, [field]: value } : i));
  const removeItem = (localId: string) =>
    setItens(prev => prev.filter(i => i.localId !== localId));

  // ── Validação ─────────────────────────────────────────────────────────────

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.clienteId) e.clienteId = 'Selecione um cliente.';
    if (!form.finalidade) e.finalidade = 'Selecione a finalidade.';
    if (!form.formaPagamentoId) e.formaPagamentoId = 'Selecione a forma de pagamento.';
    if (!form.condicaoPagamentoId) e.condicaoPagamentoId = 'Selecione a condição de pagamento.';
    if (itens.length === 0) e.itens = 'Adicione ao menos um produto.';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  // ── Salvar ────────────────────────────────────────────────────────────────

  const handleSalvar = async () => {
    if (!validar()) return;
    setSaving(true); setGlobalErr('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const payload = {
      clienteId: form.clienteId,
      formaPagamento: form.formaPagamentoId || undefined,
      condicaoPagamento: form.condicaoPagamentoId || undefined,
      finalidade: form.finalidade || undefined,
      dataPrevisaoEntrega: form.dataPrevisaoEntrega || undefined,
      desconto: parseCurrency(form.desconto),
      observacaoInterna: form.observacaoInterna || undefined,
      observacaoExterna: form.observacaoExterna || undefined,
      itens: itens.map(i => ({
        id: i.id, produtoId: i.produtoId,
        quantidade: parseInt(i.quantidade, 10) || 1,
        valorUnitario: parseCurrency(i.valorUnitario),
        descontoUnitario: parseCurrency(i.descontoUnitario),
      })),
    };
    try {
      if (modo === 'criar') {
        const res = await fetch('/api/pedidos-venda', { method: 'POST', headers, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('Erro ao criar pedido.');
        const criado = await res.json();
        showToast();
        navigate(`/comercial/pedidos/${criado.id}`);
      } else {
        const res = await fetch(`/api/pedidos-venda/${pedidoId}`, { method: 'PUT', headers, body: JSON.stringify({ id: pedidoId, ...payload }) });
        if (!res.ok) throw new Error('Erro ao salvar pedido.');
        showToast();
        navigate(`/comercial/pedidos/${pedidoId}`);
      }
    } catch (err: any) {
      setGlobalErr(err.message ?? 'Erro inesperado.');
    } finally { setSaving(false); }
  };

  const mudarStatus = (acao: 'confirmar' | 'cancelar' | 'concluir') => {
    setMudarStatusAcao(acao);
  };

  const execMudarStatus = async () => {
    if (!mudarStatusAcao) return;
    const acao = mudarStatusAcao;
    setMudarStatusAcao(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/pedidos-venda/${pedidoId}/${acao}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    window.location.reload();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando pedido…
      </div>
    );
  }

  const titulo = modo === 'criar' ? 'Novo Pedido' : modo === 'editar' ? 'Editar Pedido' : `Pedido #${String(codigoPedido ?? '').padStart(3, '0')}`;
  const sc = STATUS_CFG[statusPedido];

  const setF = (key: keyof FormState) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Barra superior ── */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate(-1)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
          <ChevronLeft size={17} />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <h1 className="text-base font-semibold text-gray-800">{titulo}</h1>
          {codigoPedido !== null && (
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full shrink-0', sc.color)}>
              {sc.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {readOnly && statusPedido === 0 && (
            <button onClick={() => navigate(`/comercial/pedidos/${pedidoId}/editar`)}
              className="h-8 px-3 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Editar
            </button>
          )}
          {readOnly && statusPedido === 0 && (
            <button onClick={() => mudarStatus('confirmar')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#1D4E89] text-white text-xs font-medium hover:bg-[#163D6D] transition-colors">
              <TrendingUp size={12} /> Confirmar
            </button>
          )}
          {readOnly && statusPedido === 1 && (
            <button onClick={() => mudarStatus('concluir')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors">
              <CheckCircle2 size={12} /> Concluir
            </button>
          )}
          {readOnly && (statusPedido === 0 || statusPedido === 1) && (
            <button onClick={() => mudarStatus('cancelar')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors">
              <XCircle size={12} /> Cancelar
            </button>
          )}
        </div>
      </div>

      {/* ── Conteúdo scrollável ── */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 pb-24">

          {globalErr && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{globalErr}</div>
          )}

          {/* ── Campos com underline + select ── */}
          <div className="mt-1">

            <UField label="Cliente" required error={erros.clienteId}>
              <ClienteSearch
                value={cliente}
                onSelect={c => { setCliente({ id: c.id, nome: c.nome }); setF('clienteId')(c.id); }}
                readOnly={readOnly}
              />
            </UField>

            <SelectWrap
              label="Finalidade de pedido"
              required
              value={form.finalidade}
              onChange={setF('finalidade')}
              options={finalidades}
              placeholder="Selecione a finalidade"
              readOnly={readOnly}
              error={erros.finalidade}
            />

            <SelectWrap
              label="Forma de Pagamento"
              required
              value={form.formaPagamentoId}
              onChange={setF('formaPagamentoId')}
              options={formasPagamento}
              placeholder="Selecione a forma de pagamento"
              readOnly={readOnly}
              error={erros.formaPagamentoId}
            />

            <SelectWrap
              label="Condição de Pagamento"
              required
              value={form.condicaoPagamentoId}
              onChange={setF('condicaoPagamentoId')}
              options={condicoesPagamento}
              placeholder="Selecione a condição de pagamento"
              readOnly={readOnly}
              error={erros.condicaoPagamentoId}
            />

            <UField label="Previsão de Entrega">
              {readOnly
                ? <p className="text-sm text-gray-700">{form.dataPrevisaoEntrega ? new Date(form.dataPrevisaoEntrega + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
                : <DatePicker
                    value={form.dataPrevisaoEntrega ?? ''}
                    onChange={setF('dataPrevisaoEntrega')}
                  />
              }
            </UField>

            <UField label="Desconto Global (R$)" error={erros.desconto}>
              {readOnly
                ? <p className="text-sm text-gray-700">{form.desconto || '—'}</p>
                : <input className={uCls} value={form.desconto} placeholder="0,00"
                    onChange={e => setF('desconto')(maskCurrency(e.target.value))} />
              }
            </UField>

            <UField label="Observação Interna">
              {readOnly
                ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.observacaoInterna || '—'}</p>
                : <textarea rows={2} className={cn(uCls, 'resize-none')} value={form.observacaoInterna}
                    placeholder="Visível apenas internamente…"
                    onChange={e => setF('observacaoInterna')(e.target.value)} />
              }
            </UField>

            <UField label="Observação para o Cliente">
              {readOnly
                ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.observacaoExterna || '—'}</p>
                : <textarea rows={2} className={cn(uCls, 'resize-none')} value={form.observacaoExterna}
                    placeholder="Pode ser impressa no documento enviado ao cliente…"
                    onChange={e => setF('observacaoExterna')(e.target.value)} />
              }
            </UField>
          </div>

          {/* ── Produtos ── */}
          <div className="mt-8">
            {erros.itens && <p className="text-xs text-red-500 mb-2">{erros.itens}</p>}

            {!readOnly && (
              <div className="flex items-center gap-6 mb-4">
                <button type="button" onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 text-sm text-[#1D4E89] hover:text-[#163D6D] transition-colors font-medium">
                  <span className="flex items-center justify-center w-4 h-4 bg-[#1D4E89] text-white rounded-full shrink-0">
                    <Plus size={10} />
                  </span>
                  Adicionar produto
                </button>
              </div>
            )}

            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs text-gray-400 font-medium py-2 pl-4 pr-3 w-8">#</th>
                  <th className="text-left text-xs text-gray-400 font-medium py-2 pr-4">Produto</th>
                  <th className="text-center text-xs text-gray-400 font-medium py-2 pr-4 w-24">Quantidade</th>
                  <th className="text-right text-xs text-gray-400 font-medium py-2 pr-4 w-28">Vl. Unit.</th>
                  <th className="text-right text-xs text-gray-400 font-medium py-2 pr-4 w-28">Desc. Unit.</th>
                  <th className="text-right text-xs text-gray-400 font-medium py-2 pr-4 w-28">Valor total</th>
                  {!readOnly && <th className="w-8" />}
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 ? (
                  <tr>
                    <td colSpan={readOnly ? 6 : 7} className="py-8 text-center text-sm text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : itens.map((item, idx) => (
                  <ItemRow key={item.localId} item={item} index={idx} readOnly={readOnly}
                    onUpdate={(f, v) => updateItem(item.localId, f, v)}
                    onRemove={() => removeItem(item.localId)} />
                ))}
              </tbody>
            </table>

            <div className="border-t border-gray-200 pt-3 flex items-center justify-between mt-1">
              <span className="text-sm text-gray-400">
                {itens.length} {itens.length === 1 ? 'produto' : 'produtos'}
              </span>
              <div className="text-right space-y-0.5">
                {desconto > 0 && (
                  <p className="text-xs text-gray-400">
                    Subtotal: {formatCurrency(subtotal)} · Desconto: {formatCurrency(desconto)}
                  </p>
                )}
                <p className="text-sm font-semibold text-gray-700">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Rodapé fixo (criar/editar) ── */}
      {(modo === 'criar' || modo === 'editar') && (
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button type="button" onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSalvar} disabled={saving}
            className="flex items-center gap-2 h-9 px-6 rounded-full bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      )}

      {showModal && <ProdutoModal onAdd={addProduto} onClose={() => setShowModal(false)} />}

      <ModalMsg
        aberto={mudarStatusAcao !== null}
        titulo={
          mudarStatusAcao === 'confirmar' ? 'Confirmar pedido' :
          mudarStatusAcao === 'concluir'  ? 'Concluir pedido'  : 'Cancelar pedido'
        }
        descricao={
          mudarStatusAcao === 'confirmar' ? 'Confirmar este pedido?' :
          mudarStatusAcao === 'concluir'  ? 'Concluir este pedido?' :
          'Cancelar este pedido? Esta ação não pode ser desfeita.'
        }
        variante={mudarStatusAcao === 'cancelar' ? 'perigo' : 'aviso'}
        labelConfirmar={
          mudarStatusAcao === 'confirmar' ? 'Confirmar' :
          mudarStatusAcao === 'concluir'  ? 'Concluir'  : 'Cancelar pedido'
        }
        onConfirmar={execMudarStatus}
        onCancelar={() => setMudarStatusAcao(null)}
      />
    </div>
  );
}
