import { useState, useEffect, useCallback, type FC } from 'react';
import {
  Pencil, Check, GripVertical, EyeOff, Eye,
  DollarSign, ShoppingBag, Package, Users,
  ChevronRight, Home, TrendingUp, TrendingDown, X,
  MapPin, Loader2, RefreshCw, AlertCircle, Columns2, Square,
} from 'lucide-react';
import { BrazilMap } from '@/components/dashboard/BrazilMap';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface VendasResumo {
  totalVendas: number;
  totalPedidos: number;
  produtosVendidos: number;
  novosClientes: number;
  variacaoVendas: number;
  variacaoPedidos: number;
  variacaoProdutos: number;
  variacaoClientes: number;
}

interface TopProduto {
  nome: string;
  quantidade: number;
  percentual: number;
}

interface FluxoSemanal {
  dia: string;
  aReceber: number;
  aPagar: number;
}

interface DelaysMensais {
  mes: string;
  mais15: number;
  mais30: number;
}

interface VendasMensais {
  mes: string;
  vendido: number;
}

interface DashboardData {
  vendasResumo: VendasResumo;
  topProdutos: TopProduto[];
  vendasPorEstado: Record<string, number>;
  fluxoSemanal: FluxoSemanal[];
  recebimentosMensais: DelaysMensais[];
  vendasMensais: VendasMensais[];
  // produção
  opsPorFase: { nome: string; valor: number }[];
  opsPorMes: { nome: string; valor: number }[];
  totalOpsAtivas: number;
  totalOpsFinalizadas: number;
  totalOpsAtrasadas: number;
  tempoMedioProducao: number;
}

interface EstadoDetalhes {
  sigla: string;
  totalPedidos: number;
  totalVendas: number;
  topProdutos: { nome: string; quantidade: number; valorTotal: number }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatVariacao(v: number): string {
  const abs = Math.abs(v).toFixed(1);
  return `${v >= 0 ? '+' : '-'}${abs}% em relação ao mês anterior`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getPrimeiroNome(): string {
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return user?.nome?.split(' ')[0] ?? '';
  } catch {
    return '';
  }
}

function formatHora(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ── Panel constants ───────────────────────────────────────────────────────────

const axisStyle = { fontSize: 10, fill: '#9ca3af' };
const gridProps = { stroke: '#f3f4f6', strokeDasharray: '3 3' };
const tooltipStyle = {
  contentStyle: {
    fontSize: 11,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
  },
};

const PANEL_COLORS = ['#1D4E89', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

// ── Skeletons ─────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-4 border border-blue-100 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gray-100 mb-3" />
          <div className="h-5 w-3/4 rounded-md bg-gray-100 mb-2" />
          <div className="h-3 w-1/2 rounded-md bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  const heights = [40, 70, 55, 85, 60, 75, 45];
  return (
    <div className="h-[180px] flex items-end gap-2 px-1 animate-pulse">
      {heights.map((h, i) => (
        <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

// ── Panel components ─────────────────────────────────────────────────────────

function VendasPanel({ data, loading }: { data?: VendasResumo; loading: boolean }) {
  if (loading) return <div className="p-5"><KpiSkeleton /></div>;

  const cards = [
    {
      icon: DollarSign, label: 'Total de vendas',
      value: data ? formatBRL(data.totalVendas) : '—',
      change: data ? formatVariacao(data.variacaoVendas) : '',
      up: (data?.variacaoVendas ?? 0) >= 0,
      hero: true,
    },
    {
      icon: ShoppingBag, label: 'Total de pedidos',
      value: data ? String(data.totalPedidos) : '—',
      change: data ? formatVariacao(data.variacaoPedidos) : '',
      up: (data?.variacaoPedidos ?? 0) >= 0,
      iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
    },
    {
      icon: Package, label: 'Produtos vendidos',
      value: data ? String(data.produtosVendidos) : '—',
      change: data ? formatVariacao(data.variacaoProdutos) : '',
      up: (data?.variacaoProdutos ?? 0) >= 0,
      iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    },
    {
      icon: Users, label: 'Novos clientes',
      value: data ? String(data.novosClientes) : '—',
      change: data ? formatVariacao(data.variacaoClientes) : '',
      up: (data?.variacaoClientes ?? 0) >= 0,
      iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="p-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map(({ icon: Icon, label, value, change, up, hero, iconBg, iconColor }) => (
          <div
            key={label}
            className={cn(
              'p-4 border rounded-xl',
              hero
                ? 'bg-gradient-to-br from-[#1D4E89] to-[#163D6D] border-transparent shadow-sm'
                : 'bg-white border-blue-100',
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center',
                hero ? 'bg-white/15' : cn(iconBg, iconColor && 'border-0'),
              )}>
                <Icon size={17} className={hero ? 'text-white' : iconColor} />
              </div>
            </div>
            <p className={cn('text-xl font-bold', hero ? 'text-white' : 'text-gray-800')}>{value}</p>
            <p className={cn('text-xs mt-0.5 leading-tight', hero ? 'text-white/70' : 'text-gray-500')}>{label}</p>
            {change && (
              <p className={cn(
                'text-[11px] mt-1.5 font-medium flex items-center gap-1',
                hero ? (up ? 'text-emerald-300' : 'text-red-300') : (up ? 'text-emerald-600' : 'text-red-500'),
              )}>
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {change}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopProductsPanel({ data, loading }: { data?: TopProduto[]; loading: boolean }) {
  const items = data ?? [];

  return (
    <div className="p-5">
      <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
        <span>#</span>
        <span className="flex-1 ml-3">Nome</span>
        <span>Qtd</span>
        <span className="ml-3 w-10 text-right">%</span>
      </div>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded-full" style={{ width: `${90 - i * 8}%` }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Sem dados no período</p>
      ) : (
        <div className="space-y-3">
          {items.map(({ nome, quantidade, percentual }, idx) => (
            <div key={nome} className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400 font-medium w-5 shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-700 w-20 shrink-0 truncate" title={nome}>{nome}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${percentual}%`, backgroundColor: PANEL_COLORS[idx % PANEL_COLORS.length] }}
                />
              </div>
              <span className="text-[10px] text-gray-500 w-8 text-right shrink-0">{quantidade}</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: PANEL_COLORS[idx % PANEL_COLORS.length] + '20',
                  color: PANEL_COLORS[idx % PANEL_COLORS.length],
                }}
              >
                {percentual.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PayablesPanel({ data, loading }: { data?: FluxoSemanal[]; loading: boolean }) {
  const chartData = data ?? [];
  if (loading) return <div className="p-5"><ChartSkeleton /></div>;
  if (chartData.length === 0) return <p className="px-5 pb-5 text-xs text-gray-400 text-center py-8">Sem dados no período</p>;
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={8} barGap={3}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="dia" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} width={32} />
          <Tooltip {...tooltipStyle} formatter={(v) => [formatBRL(Number(v))]} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="aReceber" name="A receber" fill="#1D4E89" radius={[5, 5, 0, 0]} />
          <Bar dataKey="aPagar"   name="A pagar"   fill="#10B981" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DelaysPanel({ data, loading }: { data?: DelaysMensais[]; loading: boolean }) {
  const chartData = data ?? [];
  if (loading) return <div className="p-5"><ChartSkeleton /></div>;
  if (chartData.length === 0) return <p className="px-5 pb-5 text-xs text-gray-400 text-center py-8">Sem dados no período</p>;
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="mes" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
          <Tooltip {...tooltipStyle} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Line dataKey="mais15" name="Atrasado +15 dias" stroke="#10B981" strokeWidth={2} dot={false} />
          <Line dataKey="mais30" name="Atrasado +30 dias" stroke="#EF4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SoldGoalPanel({ data, loading }: { data?: VendasMensais[]; loading: boolean }) {
  const chartData = data ?? [];
  if (loading) return <div className="p-5"><ChartSkeleton /></div>;
  if (chartData.length === 0) return <p className="px-5 pb-5 text-xs text-gray-400 text-center py-8">Sem dados no período</p>;
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={14} barGap={3}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="mes" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} width={32} />
          <Tooltip {...tooltipStyle} formatter={(v) => [formatBRL(Number(v))]} />
          <Bar dataKey="vendido" name="Vendido" fill="#163D6D" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LeadTimePanel({ data, loading }: { data?: { nome: string; valor: number }[]; loading: boolean }) {
  const chartData = (data ?? []).map(x => ({ fase: x.nome, ops: x.valor }));
  if (loading) return <div className="p-5"><ChartSkeleton /></div>;
  if (chartData.length === 0) return <p className="px-5 pb-5 text-xs text-gray-400 text-center py-8">Sem ordens de produção ativas</p>;
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={14} barGap={3} layout="vertical">
          <CartesianGrid {...gridProps} horizontal={false} />
          <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis dataKey="fase" type="category" tick={axisStyle} axisLine={false} tickLine={false} width={60} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="ops" name="OPs" fill="#1D4E89" radius={[0, 5, 5, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProductionPanel({ data, loading }: { data?: { nome: string; valor: number }[]; loading: boolean }) {
  const chartData = (data ?? []).map(x => ({ mes: x.nome, ops: x.valor }));
  if (loading) return <div className="p-5"><ChartSkeleton /></div>;
  if (chartData.length === 0) return <p className="px-5 pb-5 text-xs text-gray-400 text-center py-8">Sem ordens finalizadas no período</p>;
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barSize={14} barGap={3}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="mes" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="ops" name="OPs Finalizadas" fill="#1D4E89" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Estado Modal ─────────────────────────────────────────────────────────────

function EstadoModal({ sigla, onClose }: { sigla: string; onClose: () => void }) {
  const [data, setData]   = useState<EstadoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchJson<EstadoDetalhes>(`/api/Dashboard/estado/${sigla}`)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [sigla]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1D4E89]/10 flex items-center justify-center">
              <MapPin size={15} className="text-[#1D4E89]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Estado: {sigla}</p>
              <p className="text-[11px] text-gray-400">Detalhes de vendas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Fechar"
            aria-label="Fechar"
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="flex items-center justify-center h-24 gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Carregando…</span>
            </div>
          )}
          {error && (
            <p className="text-sm text-red-400 text-center py-4">Não foi possível carregar os dados.</p>
          )}
          {data && !loading && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#EAF1FB] p-3 border border-blue-100 rounded-lg">
                  <p className="text-[11px] text-gray-400">Total de pedidos</p>
                  <p className="text-lg font-bold text-gray-800">{data.totalPedidos.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-[#EAF1FB] p-3 border border-blue-100 rounded-lg">
                  <p className="text-[11px] text-gray-400">Total em vendas</p>
                  <p className="text-lg font-bold text-gray-800">{formatBRL(data.totalVendas)}</p>
                </div>
              </div>

              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Produtos mais vendidos
              </p>
              {data.topProdutos.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">Sem produtos registrados</p>
              ) : (
                <div className="space-y-2">
                  {data.topProdutos.map((p, idx) => (
                    <div key={p.nome} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: PANEL_COLORS[idx % PANEL_COLORS.length] + '20',
                            color: PANEL_COLORS[idx % PANEL_COLORS.length],
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs text-gray-700 truncate" title={p.nome}>{p.nome}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-gray-700">{p.quantidade}x</p>
                        <p className="text-[10px] text-gray-400">{formatBRL(p.valorTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Panel config / registry ───────────────────────────────────────────────────

interface PanelConfig {
  id: string;
  cols: 1 | 2;
  visible: boolean;
}

const PANEL_META: Record<string, { title: string; subtitle?: string }> = {
  vendas:      { title: 'Vendas', subtitle: 'Mês atual x Mês anterior' },
  topProducts: { title: 'Produtos mais Vendidos', subtitle: 'Últimos 30 dias' },
  payables:    { title: 'Total a pagar x Total a receber', subtitle: 'Últimos 7 dias' },
  delays:      { title: 'Total a receber em atraso', subtitle: 'Últimos 12 meses' },
  soldGoal:    { title: 'Historico de vendas', subtitle: 'Últimos 7 meses' },
  leadTime:    { title: 'OPs por Fase de Produção', subtitle: 'Ordens ativas' },
  countries:   { title: 'Vendas por região', subtitle: 'Estados Brasileiros' },
  production:  { title: 'OPs Finalizadas por Mês', subtitle: 'Últimos 6 meses' },
};

const DEFAULT_PANELS: PanelConfig[] = [
  { id: 'vendas',      cols: 2, visible: true },
  { id: 'topProducts', cols: 1, visible: true },
  { id: 'payables',    cols: 1, visible: true },
  { id: 'delays',      cols: 1, visible: true },
  { id: 'soldGoal',    cols: 1, visible: true },
  { id: 'leadTime',    cols: 1, visible: true },
  { id: 'countries',   cols: 1, visible: true },
  { id: 'production',  cols: 1, visible: true },
];

// ── Panel Wrapper ─────────────────────────────────────────────────────────────

interface PanelWrapperProps {
  panel: PanelConfig;
  editMode: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onHide: () => void;
  onResize: (cols: 1 | 2) => void;
  children: React.ReactNode;
}

function PanelWrapper({
  panel, editMode, isDragging, isDragOver,
  onDragStart, onDragOver, onDragLeave, onDrop,
  onHide, onResize, children,
}: PanelWrapperProps) {
  const meta = PANEL_META[panel.id];

  return (
    <div
      draggable={editMode}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(e); }}
      className={cn(
        'bg-[#EAF1FB] border rounded-xl transition-all duration-150 min-w-0 overflow-hidden',
        'h-full flex flex-col',
        editMode ? 'border-dashed border-blue-200 shadow-sm' : 'border-blue-100 shadow-sm',
        isDragging && 'opacity-30',
        isDragOver && editMode && 'border-[#1D4E89] border-solid ring-2 ring-[#1D4E89]/20',
        editMode && !isDragging && 'cursor-grab active:cursor-grabbing',
        panel.cols === 1 ? 'col-span-1' : 'col-span-1 md:col-span-2 lg:col-span-2',
      )}
    >
      <div className={cn(
        'flex items-center justify-between px-5 pt-4 pb-1 shrink-0',
        editMode && 'pb-3 border-b border-dashed border-gray-200',
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {editMode && <GripVertical size={14} className="text-gray-400 shrink-0" />}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">{meta?.title}</h3>
            {meta?.subtitle && (
              <p className="text-[11px] text-gray-400 leading-tight">{meta.subtitle}</p>
            )}
          </div>
        </div>

        {editMode && (
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button
              onClick={() => onResize(1)}
              title="Ocupar 1 coluna"
              aria-label="Ocupar 1 coluna"
              aria-pressed={panel.cols === 1}
              className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center transition-colors border',
                panel.cols === 1
                  ? 'bg-[#1D4E89] text-white border-[#1D4E89]'
                  : 'text-gray-400 border-gray-200 hover:border-[#1D4E89] hover:text-[#1D4E89]',
              )}
            >
              <Square size={11} />
            </button>
            <button
              onClick={() => onResize(2)}
              title="Ocupar 2 colunas"
              aria-label="Ocupar 2 colunas"
              aria-pressed={panel.cols === 2}
              className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center transition-colors border',
                panel.cols === 2
                  ? 'bg-[#1D4E89] text-white border-[#1D4E89]'
                  : 'text-gray-400 border-gray-200 hover:border-[#1D4E89] hover:text-[#1D4E89]',
              )}
            >
              <Columns2 size={11} />
            </button>
            <button
              onClick={onHide}
              title="Ocultar painel"
              aria-label="Ocultar painel"
              className="w-6 h-6 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors ml-1"
            >
              <EyeOff size={11} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        {children}
      </div>
    </div>
  );
}

// ── Load/save panels ──────────────────────────────────────────────────────────

function loadPanels(): PanelConfig[] {
  try {
    const saved = localStorage.getItem('valisys-dashboard-panels-v3');
    if (!saved) return DEFAULT_PANELS;
    const parsed: PanelConfig[] = JSON.parse(saved);
    const missing = DEFAULT_PANELS.filter(d => !parsed.find(p => p.id === d.id));
    return [...parsed, ...missing];
  } catch {
    return DEFAULT_PANELS;
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [panels, setPanels]         = useState<PanelConfig[]>(loadPanels);
  const [editMode, setEditMode]     = useState(false);
  const [dragId, setDragId]         = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dashData, setDashData]     = useState<DashboardData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [dashError, setDashError]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const nomeUsuario = getPrimeiroNome();

  useEffect(() => {
    localStorage.setItem('valisys-dashboard-panels-v3', JSON.stringify(panels));
  }, [panels]);

  const carregarDados = useCallback(() => {
    setLoading(true);
    setDashError(false);
    fetchJson<DashboardData>('/api/Dashboard')
      .then(d => { setDashData(d); setLastUpdated(new Date()); setLoading(false); })
      .catch(() => { setDashError(true); setLoading(false); });
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleDrop = useCallback((targetId: string) => {
    if (!dragId || dragId === targetId) return;
    setPanels(prev => {
      const next = [...prev];
      const from = next.findIndex(p => p.id === dragId);
      const to   = next.findIndex(p => p.id === targetId);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragId(null);
    setDragOverId(null);
  }, [dragId]);

  const toggleVisible = (id: string) =>
    setPanels(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));

  const resizePanel = (id: string, cols: 1 | 2) =>
    setPanels(prev => prev.map(p => p.id === id ? { ...p, cols } : p));

  const PANEL_CONTENT: Record<string, FC> = {
    vendas:      () => <VendasPanel data={dashData?.vendasResumo} loading={loading} />,
    topProducts: () => <TopProductsPanel data={dashData?.topProdutos} loading={loading} />,
    payables:    () => <PayablesPanel data={dashData?.fluxoSemanal} loading={loading} />,
    delays:      () => <DelaysPanel data={dashData?.recebimentosMensais} loading={loading} />,
    soldGoal:    () => <SoldGoalPanel data={dashData?.vendasMensais} loading={loading} />,
    leadTime:    () => <LeadTimePanel data={dashData?.opsPorFase} loading={loading} />,
    countries:   () => (
      <div className="pt-1">
        <BrazilMap
          data={dashData?.vendasPorEstado ?? {}}
          onStateClick={setSelectedEstado}
        />
      </div>
    ),
    production:  () => <ProductionPanel data={dashData?.opsPorMes} loading={loading} />,
  };

  const visible = panels.filter(p => p.visible);
  const hidden  = panels.filter(p => !p.visible);

  return (
    <div className="p-4 md:p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <Home size={11} /><ChevronRight size={11} /><span>Dashboard</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800">
            {getSaudacao()}{nomeUsuario ? `, ${nomeUsuario}` : ''}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading
              ? 'Atualizando dados…'
              : lastUpdated
                ? `Atualizado às ${formatHora(lastUpdated)}`
                : 'Aguardando dados'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarDados}
            disabled={loading}
            title="Atualizar dados"
            aria-label="Atualizar dados"
            className="w-9 h-9 rounded-md flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:border-[#1D4E89] hover:text-[#1D4E89] shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {editMode && (
            <button
              onClick={() => setPanels(DEFAULT_PANELS)}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Redefinir layout
            </button>
          )}
          <button
            onClick={() => setEditMode(v => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              editMode
                ? 'bg-[#1D4E89] text-white shadow-md hover:bg-[#163D6D]'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1D4E89] hover:text-[#1D4E89] shadow-sm',
            )}
          >
            {editMode ? <Check size={14} /> : <Pencil size={14} />}
            {editMode ? 'Concluir' : 'Personalizar'}
          </button>
        </div>
      </div>

      {dashError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle size={13} />
            Não foi possível carregar os dados do dashboard.
          </span>
          <button
            onClick={carregarDados}
            className="font-semibold underline underline-offset-2 hover:text-red-800"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {editMode && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[#EAF1FB] border border-[#A8C7EA] text-xs text-[#163D6D] flex items-center gap-2">
          <GripVertical size={13} />
          <span>
            Arraste os painéis para reorganizá-los. Use os botões <strong>1</strong> e <strong>2</strong> para ajustar a largura.
            Clique em <EyeOff size={11} className="inline" /> para ocultar.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map(panel => {
          const Content = PANEL_CONTENT[panel.id];
          return (
            <PanelWrapper
              key={panel.id}
              panel={panel}
              editMode={editMode}
              isDragging={dragId === panel.id}
              isDragOver={dragOverId === panel.id}
              onDragStart={() => setDragId(panel.id)}
              onDragOver={() => setDragOverId(panel.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => handleDrop(panel.id)}
              onHide={() => toggleVisible(panel.id)}
              onResize={(cols) => resizePanel(panel.id, cols)}
            >
              {Content && <Content />}
            </PanelWrapper>
          );
        })}
      </div>

      {editMode && hidden.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Painéis ocultos
          </p>
          <div className="flex flex-wrap gap-2">
            {hidden.map(panel => (
              <button
                key={panel.id}
                onClick={() => toggleVisible(panel.id)}
                title={`Mostrar painel: ${PANEL_META[panel.id]?.title}`}
                aria-label={`Mostrar painel ${PANEL_META[panel.id]?.title}`}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-dashed border-gray-300 text-xs text-gray-500 hover:border-[#1D4E89] hover:text-[#1D4E89] hover:bg-[#EAF1FB] transition-colors"
              >
                <Eye size={12} />
                {PANEL_META[panel.id]?.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedEstado && (
        <EstadoModal
          sigla={selectedEstado}
          onClose={() => setSelectedEstado(null)}
        />
      )}
    </div>
  );
}
