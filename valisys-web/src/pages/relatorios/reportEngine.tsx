import { useState, useEffect, useRef } from 'react';
import {
  Loader2, Home, ChevronRight, ChevronUp, ChevronDown, Download, Printer, FileSearch, Search, Check, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/services/api';

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

// ─── Print Modal ──────────────────────────────────────────────────────────────

function getCurrentUser(): { nome: string; email: string } | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export interface PrintColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

interface ReportPrintModalProps {
  title: string;
  category: string;
  columns: PrintColumn[];
  rows: any[];
  renderCell: (row: any, col: PrintColumn) => React.ReactNode;
  filtrosDesc?: string[];
  onClose: () => void;
}

export function ReportPrintModal({ title, category, columns, rows, renderCell, filtrosDesc = [], onClose }: ReportPrintModalProps) {
  const user = getCurrentUser();
  const emissao = new Date();
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handlePrint = () => {
    if (!docRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    html, body { margin: 0; padding: 0; background: white; font-family: Arial, Helvetica, sans-serif; color: #111; }
    table { border-collapse: collapse; width: 100%; }
    @page { size: A4 portrait; margin: 1.2cm 1.5cm; }
  </style>
</head>
<body>${docRef.current.innerHTML}</body>
</html>`);
    win.document.close();
    win.onload = () => { win.print(); win.close(); };
  };

  const alignCss = (a?: string): 'left' | 'right' | 'center' => a === 'right' ? 'right' : a === 'center' ? 'center' : 'left';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-[2px]">
      {/* Toolbar */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Printer size={15} />
          <span className="font-semibold text-sm text-gray-800">Pré-visualização — {title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose}
            className="h-8 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            Fechar
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#1D4E89] hover:bg-[#163D6D] text-white text-sm font-medium transition-colors">
            <Printer size={13} /> Imprimir
          </button>
        </div>
      </div>

      {/* Paper area */}
      <div className="flex-1 overflow-y-auto bg-[#5a5a5a] py-8 px-4 flex justify-center">
        <div
          ref={docRef}
          style={{
            width: '21cm',
            minHeight: '29.7cm',
            backgroundColor: 'white',
            boxShadow: '0 6px 32px rgba(0,0,0,0.45)',
            padding: '1.2cm 1.5cm',
            boxSizing: 'border-box',
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#111',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ══ CABEÇALHO (minimalista, no espírito do impresso de Ordem de Produção) ══ */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: '10px', marginBottom: '16px',
            borderBottom: '2px solid #2c2c2c',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
              <img src="/icon-black.png" alt="" style={{ height: '34px', display: 'block' }} />
              <div>
                <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#222', letterSpacing: '1px', textTransform: 'uppercase' }}>Valisys ERP</div>
                <div style={{ fontSize: '7pt', color: '#888', marginTop: '1px' }}>Sistema de Gestão Industrial</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
              <div style={{ fontSize: '8.5pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px', color: '#555' }}>
                {category}
              </div>
              <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#000', lineHeight: 1.2, marginTop: '2px' }}>
                {title}
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '120px' }}>
              <div style={{ fontSize: '6.5pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emissão</div>
              <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#222', marginTop: '2px' }}>
                {emissao.toLocaleDateString('pt-BR')}
              </div>
              <div style={{ fontSize: '8.5pt', color: '#666', marginTop: '1px' }}>
                {emissao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Filtros aplicados */}
          <div style={{ fontSize: '7.5pt', color: '#777', marginBottom: '12px' }}>
            <strong style={{ color: '#555' }}>Filtros:</strong>&nbsp;{filtrosDesc.length > 0 ? filtrosDesc.join(' · ') : 'Nenhum filtro aplicado'}
          </div>

          {/* ══ TABELA (minimalista: sem grade pesada, só linhas) ══ */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c.key} style={{
                    borderBottom: '1.5px solid #2c2c2c', padding: '5px 8px',
                    fontSize: '6.5pt', fontWeight: 'bold', color: '#555',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    textAlign: alignCss(c.align), whiteSpace: 'nowrap',
                  }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '20px 8px', textAlign: 'center', fontSize: '9pt', color: '#999' }}>
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : rows.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map(c => (
                    <td key={c.key} style={{
                      borderBottom: '0.75px solid #ddd', padding: '5px 8px',
                      fontSize: '8.5pt', color: '#222', textAlign: alignCss(c.align),
                    }}>
                      {renderCell(row, c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ RODAPÉ ══ */}
          <div style={{
            marginTop: 'auto', borderTop: '1px solid #e0e0e0', paddingTop: '6px',
            fontSize: '7pt', color: '#999',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>
              Emitido em {emissao.toLocaleString('pt-BR')}
              {user ? ` · Usuário: ${user.nome}` : ''}
            </span>
            <span>{rows.length} registro{rows.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MultiSelectField ─────────────────────────────────────────────────────────

interface MultiSelectFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: Opt[];
  placeholder?: string;
}

export function MultiSelectField({ values, onChange, options, placeholder = 'Todos' }: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQ('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = q
    ? options.filter(o => o.nome.toLowerCase().includes(q.toLowerCase()))
    : options;

  const toggle = (id: string) => {
    onChange(values.includes(id) ? values.filter(v => v !== id) : [...values, id]);
  };

  const selectedLabel = values.length === 0
    ? placeholder
    : values.length === 1
      ? options.find(o => o.id === values[0])?.nome ?? placeholder
      : `${values.length} selecionados`;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-9 px-3 flex items-center justify-between text-sm border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:border-blue-500"
      >
        <span className={cn('truncate', values.length === 0 ? 'text-gray-400' : 'text-gray-800')}>
          {selectedLabel}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {values.length > 0 && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onChange([]); }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer leading-none"
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar…"
                className="w-full h-8 pl-8 pr-2 text-xs border border-gray-200 rounded-md outline-none focus:border-gray-400 placeholder:text-gray-300"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">Nenhum resultado</div>
            ) : filtered.map(o => {
              const checked = values.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggle(o.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50',
                    checked && 'bg-blue-50/60',
                  )}
                >
                  <span className={cn(
                    'shrink-0 w-4 h-4 rounded border flex items-center justify-center',
                    checked ? 'bg-[#1D4E89] border-[#1D4E89]' : 'border-gray-300',
                  )}>
                    {checked && <Check size={11} className="text-white" />}
                  </span>
                  <span className={cn('truncate', checked ? 'text-gray-800 font-medium' : 'text-gray-600')}>
                    {o.nome}
                  </span>
                </button>
              );
            })}
          </div>
          {values.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button type="button" onClick={() => onChange([])} className="text-xs font-medium text-gray-400 hover:text-red-500">
                Limpar seleção ({values.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  const [filters, setFilters]           = useState<Record<string, string[]>>({});
  const [rows, setRows]                 = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [sort, setSort_]               = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: '', dir: 'asc' });
  const [printOpen, setPrintOpen]       = useState(false);

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
    const params = new URLSearchParams();
    report.filters.forEach(f => {
      (filters[f.key] ?? []).forEach(v => params.append(f.key, v));
    });

    setLoading(true);
    setHasGenerated(true);
    setError('');
    setRows([]);
    setPage(1);
    fetchWithAuth(`${report.endpoint}?${params}`)
      .then(async r => {
        if (!r.ok) throw new Error(`Falha ao gerar relatório (HTTP ${r.status}).`);
        return r.json();
      })
      .then(setRows)
      .catch((e: Error) => setError(e.message || 'Não foi possível gerar o relatório.'))
      .finally(() => setLoading(false));
  };

  const handleClear = () => {
    setFilters({});
    setRows([]);
    setError('');
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
  const activeFiltersCount = report.filters.filter(f => (filters[f.key] ?? []).length > 0).length;

  const filtrosDesc: string[] = report.filters
    .filter(f => (filters[f.key] ?? []).length > 0)
    .map(f => {
      const vs = filters[f.key] ?? [];
      if (f.type === 'date') return `${f.label}: ${new Date(vs[0] + 'T00:00').toLocaleDateString('pt-BR')}`;
      const nomes = vs.map(v => f.options?.find(o => o.id === v)?.nome ?? v);
      return `${f.label}: ${nomes.join(', ')}`;
    });

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
                      value={filters[f.key]?.[0] ?? ''}
                      onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value ? [e.target.value] : [] }))}
                      className={selCls}
                    />
                  ) : (
                    <MultiSelectField
                      values={filters[f.key] ?? []}
                      onChange={vs => setFilters(prev => ({ ...prev, [f.key]: vs }))}
                      options={f.options ?? []}
                      placeholder={f.placeholder ?? 'Todos'}
                    />
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={handleGenerate} className="text-xs text-[#1D4E89] hover:underline">Tentar novamente</button>
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
                  onClick={() => setPrintOpen(true)}
                  disabled={sorted.length === 0}
                  title="Imprimir"
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors rounded"
                >
                  <Printer size={15} />
                </button>
              </div>
            </div>

            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 text-xs text-gray-500">
              <span className="font-semibold text-gray-400">Filtros:</span> {filtrosDesc.length > 0 ? filtrosDesc.join(' · ') : 'Nenhum filtro aplicado'}
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

      {printOpen && (
        <ReportPrintModal
          title={report.label}
          category={`Relatório de ${breadcrumbLabel}`}
          columns={report.columns.map(c => ({ key: c.key, label: c.label, align: c.align }))}
          rows={sorted}
          renderCell={(row, col) => {
            const column = report.columns.find(c => c.key === col.key)!;
            return formatValue(row[col.key], column.format);
          }}
          filtrosDesc={filtrosDesc}
          onClose={() => setPrintOpen(false)}
        />
      )}
    </div>
  );
}

export function useOptions(url: string, mapper: (d: any) => Opt): [Opt[]] {
  const [opts, setOpts] = useState<Opt[]>([]);
  useEffect(() => {
    fetchWithAuth(url)
      .then(r => r.ok ? r.json() : [])
      .then((d: any[]) => setOpts(d.map(mapper)))
      .catch(() => setOpts([]));
  }, [url]);
  return [opts];
}
