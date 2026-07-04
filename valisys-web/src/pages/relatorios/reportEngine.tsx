import { useState, useEffect } from 'react';
import {
  Loader2, Home, ChevronRight, ChevronUp, ChevronDown, Download, Printer, FileSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Opt { id: string; nome: string }

export type ColumnFormat = 'text' | 'qty' | 'currency' | 'date' | 'badge';

export interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  format?: ColumnFormat;
}

export interface ReportFilterDef {
  key: string;
  label: string;
  type: 'select' | 'date';
  options?: Opt[];
  placeholder?: string;
}

export interface ReportDef {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  endpoint: string;
  filters: ReportFilterDef[];
  columns: ReportColumn[];
  paginate?: boolean;
}

interface ReportPageProps {
  breadcrumbLabel: string;
  slug: string;
  reports: ReportDef[];
}

const PAGE_SIZE_OPTS = [10, 20, 50];

// ─── Formatting helpers ─────────────────────────────────────────────────────────

const fmtQtd = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (v: string) => v ? new Date(v).toLocaleDateString('pt-BR') : '—';

const BADGE_CLASS: Record<string, string> = {
  Pago:              'bg-emerald-50 text-emerald-700',
  Concluido:         'bg-emerald-50 text-emerald-700',
  Confirmado:        'bg-blue-50 text-blue-700',
  ParcialmentePago:  'bg-amber-50 text-amber-700',
  Pendente:          'bg-amber-50 text-amber-700',
  Rascunho:          'bg-gray-100 text-gray-600',
  Vencido:           'bg-red-50 text-red-700',
  Cancelado:         'bg-red-50 text-red-700',
};

function formatValue(value: any, format?: ColumnFormat) {
  if (value === null || value === undefined || value === '') return '—';
  switch (format) {
    case 'qty':      return fmtQtd(value);
    case 'currency': return fmtBRL(value);
    case 'date':     return fmtDate(value);
    default:         return String(value);
  }
}

function csvValue(value: any, format?: ColumnFormat): string | number {
  if (value === null || value === undefined) return '';
  if (format === 'date') return fmtDate(value);
  return value;
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
          <ChevronUp   size={9} className={cn(active && sort.dir === 'asc'  ? 'text-[#1D4E89]' : 'text-gray-300')} />
          <ChevronDown size={9} className={cn(active && sort.dir === 'desc' ? 'text-[#1D4E89]' : 'text-gray-300')} />
        </span>
      </span>
    </th>
  );
}

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
};

// ─── ReportPage ───────────────────────────────────────────────────────────────

export function ReportPage({ breadcrumbLabel, slug, reports }: ReportPageProps) {
  const [activeReport, setActiveReport] = useState<string>(reports[0].id);
  const [filters, setFilters]           = useState<Record<string, string>>({});
  const [rows, setRows]                 = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [sort, setSort_]               = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: '', dir: 'asc' });

  const report = reports.find(r => r.id === activeReport)!;
  const paginate = report.paginate !== false;

  const handleReportChange = (id: string) => {
    setActiveReport(id);
    setFilters({});
    setRows([]);
    setHasGenerated(false);
    setSort_({ key: '', dir: 'asc' });
    setPage(1);
  };

  const handleGenerate = () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    report.filters.forEach(f => {
      const v = filters[f.key];
      if (v) params.set(f.key, v);
    });

    setLoading(true);
    setHasGenerated(true);
    setRows([]);
    setPage(1);
    fetch(`${report.endpoint}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  const handleClear = () => {
    setFilters({});
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
  const paginated  = paginate ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;
  const goPage     = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const exportToCSV = () => {
    const csv = [
      report.columns.map(c => c.label).join(','),
      ...sorted.map(row => report.columns
        .map(c => `"${String(csvValue(row[c.key], c.format)).replace(/"/g, '""')}"`)
        .join(',')),
    ].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-${activeReport}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selCls = 'w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-800';
  const activeFiltersCount = report.filters.filter(f => !!filters[f.key]).length;

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Relatórios</span><ChevronRight size={11} />
          <span className="text-gray-700 font-semibold">{breadcrumbLabel}</span>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Report type cards */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tipo de relatório</p>
          <div className="flex items-start gap-3">
            {reports.map(r => {
              const Icon = r.icon;
              const isActive = activeReport === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleReportChange(r.id)}
                  className={cn(
                    'flex flex-col items-start gap-2 w-48 p-4 border transition-all text-left rounded-xl',
                    isActive
                      ? 'border-2 border-[#1D4E89] bg-blue-50/60'
                      : 'border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <Icon size={18} className={isActive ? 'text-[#1D4E89]' : 'text-gray-400'} />
                  <div>
                    <p className={cn('text-sm font-semibold leading-tight', isActive ? 'text-[#1D4E89]' : 'text-gray-700')}>
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

          {report.filters.length > 0 && (
            <div className={cn('grid gap-4 mb-5', GRID_COLS[Math.min(report.filters.length, 4)] ?? 'grid-cols-3')}>
              {report.filters.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.label}</label>
                  {f.type === 'date' ? (
                    <input
                      type="date"
                      value={filters[f.key] ?? ''}
                      onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className={selCls}
                    />
                  ) : (
                    <select
                      value={filters[f.key] ?? ''}
                      onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className={selCls}
                    >
                      <option value="">{f.placeholder ?? 'Todos'}</option>
                      {(f.options ?? []).map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

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
              className="flex items-center gap-2 h-9 px-5 rounded-lg bg-[#1D4E89] text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
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
                  onClick={exportToCSV}
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
                    {report.columns.map(c => c.sortable === false
                      ? (
                        <th key={c.key} className={cn('py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap', c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left')}>
                          {c.label}
                        </th>
                      )
                      : <SortHeader key={c.key} label={c.label} sk={c.key} sort={sort} onSort={handleSort} align={c.align} />,
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={report.columns.length} className="px-6 py-14 text-center text-sm text-gray-400">
                        Nenhum registro encontrado para os parâmetros informados.
                      </td>
                    </tr>
                  ) : paginated.map((row, i) => (
                    <tr key={row.id ?? i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {report.columns.map(c => (
                        <td
                          key={c.key}
                          className={cn(
                            'px-3 py-3 text-sm text-gray-700',
                            c.align === 'right' ? 'text-right tabular-nums' : c.align === 'center' ? 'text-center' : 'text-left',
                          )}
                        >
                          {c.format === 'badge' ? (
                            <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', BADGE_CLASS[row[c.key]] ?? 'bg-gray-100 text-gray-600')}>
                              {row[c.key]}
                            </span>
                          ) : formatValue(row[c.key], c.format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginate && sorted.length > pageSize && (
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
                        p === page ? 'bg-blue-100 text-[#1D4E89] font-semibold' : 'hover:bg-gray-100')}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goPage(page + 1)}   disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>'}</button>
                  <button onClick={() => goPage(totalPages)} disabled={page === totalPages} className="px-1 disabled:opacity-30 hover:text-gray-800">{'>>'}</button>
                </div>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border border-gray-300 rounded text-xs px-1 py-0.5 outline-none focus:border-[#1D4E89]">
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

export function useOptions(url: string, mapper: (d: any) => Opt): [Opt[]] {
  const [opts, setOpts] = useState<Opt[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setOpts(d.map(mapper)))
      .catch(() => setOpts([]));
  }, [url]);
  return [opts];
}
