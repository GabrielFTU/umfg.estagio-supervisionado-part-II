import { useState, useEffect } from 'react';
import {
  Loader2, Home, ChevronRight, ChevronUp, ChevronDown, Download, Printer,
  TrendingDown, Package, Warehouse, FileSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType = 'abaixo-minimo' | 'saldo-produto' | 'saldo-deposito';

interface Filters {
  produto: string;
  categoria: string;
  fornecedor: string;
  deposito: string;
}

const EMPTY: Filters = { produto: '', categoria: '', fornecedor: '', deposito: '' };

interface Opt { id: string; nome: string }
interface DepositoOpt { id: string; nome: string; almoxarifadoNome: string }

// ─── Config ───────────────────────────────────────────────────────────────────

const REPORTS = [
  {
    id: 'abaixo-minimo' as const,
    label: 'Estoque Mínimo',
    desc: 'Produtos abaixo do limite',
    icon: TrendingDown,
    colSpan: 8,
    endpoint: '/api/relatorios/estoque/abaixo-minimo',
    filters: ['produto', 'categoria', 'deposito'] as (keyof Filters)[],
  },
  {
    id: 'saldo-produto' as const,
    label: 'Saldo por Produto',
    desc: 'Posição atual por item',
    icon: Package,
    colSpan: 7,
    endpoint: '/api/relatorios/estoque/saldo-produto',
    filters: ['produto', 'categoria', 'fornecedor'] as (keyof Filters)[],
  },
  {
    id: 'saldo-deposito' as const,
    label: 'Saldo por Depósito',
    desc: 'Posição por local de armazenagem',
    icon: Warehouse,
    colSpan: 6,
    endpoint: '/api/relatorios/estoque/saldo-deposito',
    filters: ['produto', 'deposito'] as (keyof Filters)[],
  },
] as const;

const PAGE_SIZE_OPTS = [10, 20, 50];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtQtd = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function exportToCSV(data: any[], reportId: ReportType) {
  const headers: Record<ReportType, string[]> = {
    'abaixo-minimo':  ['Produto', 'Código', 'Categoria', 'Unidade', 'Atual', 'Mínimo', 'Déficit'],
    'saldo-produto':  ['Produto', 'Código', 'Categoria', 'Unidade', 'Saldo', 'Custo Médio', 'Valor Total'],
    'saldo-deposito': ['Depósito', 'Almoxarifado', 'Produto', 'Código', 'Unidade', 'Saldo'],
  };
  const mapper: Record<ReportType, (r: any) => (string | number)[]> = {
    'abaixo-minimo':  r => [r.produtoNome, r.produtoCodigo, r.categoriaNome ?? '', r.unidade, r.estoqueAtual, r.estoqueMinimo, r.diferenca],
    'saldo-produto':  r => [r.produtoNome, r.produtoCodigo, r.categoriaNome ?? '', r.unidade, r.saldoTotal, r.custoMedio ?? 0, r.valorTotal ?? 0],
    'saldo-deposito': r => [r.depositoNome, r.almoxarifadoNome ?? '', r.produtoNome, r.produtoCodigo, r.unidade, r.saldo],
  };
  const csv = [headers[reportId].join(','), ...data.map(r =>
    mapper[reportId](r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  )].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `estoque-${reportId}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── SortHeader ───────────────────────────────────────────────────────────────

function SortHeader({ label, sk, sort, onSort, align = 'left' }: {
  label: string; sk: string;
  sort: { key: string; dir: 'asc' | 'desc' };
  onSort: (k: string) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const active = sort.key === sk;
  return (
    <th
      onClick={() => onSort(sk)}
      className={cn(
        'py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
      )}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="flex flex-col leading-none">
          <ChevronUp   size={9} className={cn(active && sort.dir === 'asc'  ? 'text-[#3B82F6]' : 'text-gray-300')} />
          <ChevronDown size={9} className={cn(active && sort.dir === 'desc' ? 'text-[#3B82F6]' : 'text-gray-300')} />
        </span>
      </span>
    </th>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RelatorioEstoquePage() {
  const [activeReport, setActiveReport] = useState<ReportType>('abaixo-minimo');
  const [filters, setFilters]           = useState<Filters>({ ...EMPTY });
  const [rows, setRows]                 = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [sort, setSort_]               = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: '', dir: 'asc' });

  const [produtos, setProdutos]         = useState<Opt[]>([]);
  const [categorias, setCategorias]     = useState<Opt[]>([]);
  const [fornecedores, setFornecedores] = useState<Opt[]>([]);
  const [depositos, setDepositos]       = useState<Opt[]>([]);

  const report = REPORTS.find(r => r.id === activeReport)!;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };
    fetch('/api/Produtos', { headers: h }).then(r => r.ok ? r.json() : []).then((d: any[]) =>
      setProdutos(d.map(p => ({ id: p.id, nome: p.nome })))
    );
    fetch('/api/CategoriasProduto', { headers: h }).then(r => r.ok ? r.json() : []).then((d: any[]) =>
      setCategorias(d.map(c => ({ id: c.id, nome: c.nome })))
    );
    fetch('/api/Pessoas', { headers: h }).then(r => r.ok ? r.json() : []).then((d: any[]) =>
      setFornecedores(d.filter((p: any) => p.tipo === 'Fornecedor' || p.isFornecedor).map(p => ({ id: p.id, nome: p.nomeRazaoSocial ?? p.nome })))
    );
    fetch('/api/depositos', { headers: h }).then(r => r.ok ? r.json() : []).then((d: DepositoOpt[]) =>
      setDepositos(d.map(dep => ({ id: dep.id, nome: dep.almoxarifadoNome ? `${dep.nome} (${dep.almoxarifadoNome})` : dep.nome })))
    );
  }, []);

  const handleReportChange = (id: ReportType) => {
    setActiveReport(id);
    setFilters({ ...EMPTY });
    setRows([]);
    setHasGenerated(false);
    setSort_({ key: '', dir: 'asc' });
    setPage(1);
  };

  const handleGenerate = () => {
    const cfg = REPORTS.find(x => x.id === activeReport)!;
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filters.produto)    params.set('produtoId',    filters.produto);
    if (filters.categoria)  params.set('categoriaId',  filters.categoria);
    if (filters.fornecedor) params.set('fornecedorId', filters.fornecedor);
    if (filters.deposito)   params.set('depositoId',   filters.deposito);

    setLoading(true);
    setHasGenerated(true);
    setRows([]);
    setPage(1);
    fetch(`${cfg.endpoint}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  const handleClear = () => {
    setFilters({ ...EMPTY });
    setRows([]);
    setHasGenerated(false);
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSort_(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sort.key) return 0;
    const dir = sort.dir === 'asc' ? 1 : -1;
    const av = a[sort.key] ?? ''; const bv = b[sort.key] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const selCls = 'w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-800';

  function renderHeaders() {
    const S = (label: string, sk: string, align?: 'left' | 'right' | 'center') =>
      <SortHeader key={sk} label={label} sk={sk} sort={sort} onSort={handleSort} align={align} />;
    const H = (label: string, align: 'left' | 'right' | 'center' = 'left') =>
      <th key={label} className={cn('py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap', align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left')}>{label}</th>;

    switch (activeReport) {
      case 'abaixo-minimo':
        return <>{S('Nome', 'produtoNome')}{S('Código', 'produtoCodigo')}{S('Categoria', 'categoriaNome')}{H('Unid.', 'center')}{S('Atual', 'estoqueAtual', 'right')}{S('Mínimo', 'estoqueMinimo', 'right')}{S('Déficit', 'diferenca', 'right')}</>;
      case 'saldo-produto':
        return <>{S('Nome', 'produtoNome')}{S('Código', 'produtoCodigo')}{S('Categoria', 'categoriaNome')}{H('Unid.', 'center')}{S('Saldo', 'saldoTotal', 'right')}{S('Custo Médio', 'custoMedio', 'right')}{S('Valor Total', 'valorTotal', 'right')}</>;
      case 'saldo-deposito':
        return <>{S('Depósito', 'depositoNome')}{S('Almoxarifado', 'almoxarifadoNome')}{S('Produto', 'produtoNome')}{S('Código', 'produtoCodigo')}{H('Unid.', 'center')}{S('Saldo', 'saldo', 'right')}</>;
    }
  }

  function renderRow(row: any) {
    const trCls = 'border-b border-gray-100 hover:bg-gray-50 transition-colors';
    switch (activeReport) {
      case 'abaixo-minimo': return (
        <tr key={row.id} className={trCls}>
          <td className="px-3 py-3 text-sm font-semibold text-gray-800 max-w-[200px]"><div className="truncate">{row.produtoNome}</div></td>
          <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{row.produtoCodigo}</td>
          <td className="px-3 py-3 text-sm text-gray-500">{row.categoriaNome ?? '—'}</td>
          <td className="px-3 py-3 text-xs text-gray-400 text-center">{row.unidade}</td>
          <td className="px-3 py-3 text-sm tabular-nums text-right font-medium text-gray-700">{fmtQtd(row.estoqueAtual)}</td>
          <td className="px-3 py-3 text-sm tabular-nums text-right text-gray-500">{fmtQtd(row.estoqueMinimo)}</td>
          <td className="px-3 py-3 text-sm tabular-nums text-right font-semibold text-red-600">{fmtQtd(row.diferenca)}</td>
        </tr>
      );
      case 'saldo-produto': return (
        <tr key={row.id} className={trCls}>
          <td className="px-3 py-3 text-sm font-semibold text-gray-800 max-w-[200px]"><div className="truncate">{row.produtoNome}</div></td>
          <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{row.produtoCodigo}</td>
          <td className="px-3 py-3 text-sm text-gray-500">{row.categoriaNome ?? '—'}</td>
          <td className="px-3 py-3 text-xs text-gray-400 text-center">{row.unidade}</td>
          <td className="px-3 py-3 text-sm tabular-nums text-right font-medium text-gray-700">{fmtQtd(row.saldoTotal)}</td>
          <td className="px-3 py-3 text-sm tabular-nums text-right text-gray-500">{fmtBRL(row.custoMedio ?? 0)}</td>
          <td className="px-3 py-3 text-sm tabular-nums text-right font-semibold text-blue-700">{fmtBRL(row.valorTotal ?? 0)}</td>
        </tr>
      );
      case 'saldo-deposito': return (
        <tr key={row.id} className={trCls}>
          <td className="px-3 py-3 text-sm font-semibold text-gray-800">{row.depositoNome}</td>
          <td className="px-3 py-3 text-sm text-gray-500">{row.almoxarifadoNome ?? '—'}</td>
          <td className="px-3 py-3 text-sm text-gray-800 max-w-[180px]"><div className="truncate">{row.produtoNome}</div></td>
          <td className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{row.produtoCodigo}</td>
          <td className="px-3 py-3 text-xs text-gray-400 text-center">{row.unidade}</td>
          <td className="px-3 py-3 text-sm tabular-nums text-right font-semibold text-emerald-700">{fmtQtd(row.saldo)}</td>
        </tr>
      );
    }
  }

  const activeFiltersCount = report.filters.filter(f => !!filters[f]).length;

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Relatórios</span><ChevronRight size={11} />
          <span className="text-gray-700 font-semibold">Estoque</span>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Report type cards */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tipo de relatório</p>
          <div className="flex items-start gap-3">
            {REPORTS.map(r => {
              const Icon = r.icon;
              const isActive = activeReport === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleReportChange(r.id)}
                  className={cn(
                    'flex flex-col items-start gap-2 w-48 p-4 border transition-all text-left rounded-xl',
                    isActive
                      ? 'border-2 border-[#3B82F6] bg-blue-50/60'
                      : 'border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <Icon size={18} className={isActive ? 'text-[#3B82F6]' : 'text-gray-400'} />
                  <div>
                    <p className={cn('text-sm font-semibold leading-tight', isActive ? 'text-[#3B82F6]' : 'text-gray-700')}>
                      {r.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter form */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Parâmetros — {report.label}
          </p>

          <div className={cn(
            'grid gap-4 mb-5',
            report.filters.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
          )}>
            {report.filters.includes('produto') && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Produto</label>
                <select value={filters.produto} onChange={e => setFilters(f => ({ ...f, produto: e.target.value }))} className={selCls}>
                  <option value="">Todos os produtos</option>
                  {produtos.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>
            )}
            {report.filters.includes('categoria') && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Categoria</label>
                <select value={filters.categoria} onChange={e => setFilters(f => ({ ...f, categoria: e.target.value }))} className={selCls}>
                  <option value="">Todas as categorias</option>
                  {categorias.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>
            )}
            {report.filters.includes('fornecedor') && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Fornecedor</label>
                <select value={filters.fornecedor} onChange={e => setFilters(f => ({ ...f, fornecedor: e.target.value }))} className={selCls}>
                  <option value="">Todos os fornecedores</option>
                  {fornecedores.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>
            )}
            {report.filters.includes('deposito') && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Depósito</label>
                <select value={filters.deposito} onChange={e => setFilters(f => ({ ...f, deposito: e.target.value }))} className={selCls}>
                  <option value="">Todos os depósitos</option>
                  {depositos.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleClear}
              disabled={activeFiltersCount === 0 && !hasGenerated}
              className="text-xs font-medium text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 h-9 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <FileSearch size={14} />}
              Gerar relatório
            </button>
          </div>
        </div>

        {/* Results */}
        {!hasGenerated ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <FileSearch size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Nenhum relatório gerado</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Selecione o tipo, preencha os parâmetros acima e clique em <strong>Gerar relatório</strong>.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Table header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">
                {report.label}
                {sorted.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {sorted.length} registro{sorted.length !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportToCSV(sorted, activeReport)}
                  disabled={sorted.length === 0}
                  title="Exportar CSV"
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors rounded"
                >
                  <Download size={15} />
                </button>
                <button
                  onClick={() => window.print()}
                  title="Imprimir"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded"
                >
                  <Printer size={15} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    {renderHeaders()}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={report.colSpan} className="px-6 py-14 text-center text-sm text-gray-400">
                        Nenhum registro encontrado para os parâmetros informados.
                      </td>
                    </tr>
                  ) : paginated.map(row => renderRow(row))}
                </tbody>
              </table>
            </div>

            {sorted.length > pageSize && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4 text-sm text-gray-500 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <button onClick={() => goPage(1)}          disabled={page === 1}          className="px-1 disabled:opacity-30 hover:text-gray-800">{'<<'}</button>
                  <button onClick={() => goPage(page - 1)}   disabled={page === 1}          className="px-1 disabled:opacity-30 hover:text-gray-800">{'<'}</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    return start + i;
                  }).filter(p => p <= totalPages).map(p => (
                    <button key={p} onClick={() => goPage(p)}
                      className={cn('w-7 h-7 rounded-full text-sm transition-colors',
                        p === page ? 'bg-blue-100 text-[#3B82F6] font-semibold' : 'hover:bg-gray-100')}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goPage(page + 1)}   disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>'}</button>
                  <button onClick={() => goPage(totalPages)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>>'}</button>
                </div>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border border-gray-300 rounded text-xs px-1 py-0.5 outline-none focus:border-[#3B82F6]">
                  {PAGE_SIZE_OPTS.map(s => <option key={s} value={s}>{s} por página</option>)}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
