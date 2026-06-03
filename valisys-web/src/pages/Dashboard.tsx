import { useState, useEffect, useCallback, type FC } from 'react';
import {
  Pencil, Check, GripVertical, EyeOff, Eye,
  DollarSign, ShoppingBag, Package, Users,
  ChevronRight, Home, TrendingUp, TrendingDown,
} from 'lucide-react';
import { BrazilMap } from '@/components/dashboard/BrazilMap';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const VENDAS_CARDS = [
  { icon: DollarSign, label: 'Total de vendas',    value: 'R$1.000', change: '+8% do que ontem',   up: true },
  { icon: ShoppingBag, label: 'Total de pedidos',  value: '300',     change: '+5% do que ontem',   up: true },
  { icon: Package,    label: 'Produtos vendidos',  value: '5',       change: '+1,2% do que ontem', up: true },
  { icon: Users,      label: 'Novos clientes',     value: '8',       change: '+0,5% do que ontem', up: true },
];

const TOP_PRODUCTS = [
  { rank: '01', name: 'Barco 1', pct: 45, color: '#3B82F6' },
  { rank: '02', name: 'Barco 2', pct: 29, color: '#10B981' },
  { rank: '03', name: 'Barco 3', pct: 25, color: '#8B5CF6' },
  { rank: '04', name: 'Barco 4', pct: 18, color: '#F59E0B' },
];

const WEEKLY_DATA = [
  { day: 'Seg', aReceber: 18, aPagar: 12 },
  { day: 'Ter', aReceber: 20, aPagar: 15 },
  { day: 'Qua', aReceber: 13, aPagar: 20 },
  { day: 'Qui', aReceber: 10, aPagar: 8  },
  { day: 'Sex', aReceber: 17, aPagar: 14 },
  { day: 'Sáb', aReceber: 15, aPagar: 16 },
];

const DELAYS_DATA = [
  { month: 'Jan', mais15: 180, mais30: 280 },
  { month: 'Fev', mais15: 220, mais30: 310 },
  { month: 'Mar', mais15: 260, mais30: 200 },
  { month: 'Abr', mais15: 310, mais30: 255 },
  { month: 'Mai', mais15: 280, mais30: 380 },
  { month: 'Jun', mais15: 330, mais30: 295 },
  { month: 'Jul', mais15: 220, mais30: 345 },
  { month: 'Ago', mais15: 190, mais30: 270 },
  { month: 'Set', mais15: 240, mais30: 190 },
  { month: 'Out', mais15: 300, mais30: 315 },
  { month: 'Nov', mais15: 270, mais30: 230 },
  { month: 'Dez', mais15: 350, mais30: 400 },
];

const SOLD_GOAL_DATA = [
  { month: 'Jan', vendido: 280, meta: 350 },
  { month: 'Fev', vendido: 320, meta: 350 },
  { month: 'Mar', vendido: 370, meta: 350 },
  { month: 'Abr', vendido: 290, meta: 380 },
  { month: 'Mai', vendido: 400, meta: 380 },
  { month: 'Jun', vendido: 355, meta: 400 },
  { month: 'Jul', vendido: 430, meta: 400 },
];

const LEAD_DATA = [
  { day: 'Seg', producao: 22, entrega: 15 },
  { day: 'Ter', producao: 18, entrega: 20 },
  { day: 'Qua', producao: 25, entrega: 13 },
  { day: 'Qui', producao: 12, entrega: 18 },
  { day: 'Sex', producao: 20, entrega: 14 },
  { day: 'Sáb', producao: 16, entrega: 10 },
];

const PRODUCTION_DATA = [
  { prod: '1', produzido: 180, previsto: 200 },
  { prod: '2', produzido: 240, previsto: 220 },
  { prod: '3', produzido: 160, previsto: 190 },
  { prod: '4', produzido: 290, previsto: 260 },
  { prod: '5', produzido: 210, previsto: 230 },
  { prod: '6', produzido: 320, previsto: 300 },
];

const STATES_SALES: Record<string, number> = {
  SP: 950, RJ: 780, MG: 650, RS: 580, PR: 520,
  BA: 430, SC: 410, GO: 350, PE: 330, CE: 300,
  AM: 250, PA: 220, MT: 200, MS: 180, ES: 170,
  MA: 150, DF: 140, RN: 120, PB: 110, AL: 100,
  PI: 90,  RO: 80,  TO: 70,  SE: 60,  AC: 50,
  AP: 40,  RR: 30,
};

interface PanelConfig {
  id: string;
  cols: 1 | 2;
  visible: boolean;
}

const PANEL_META: Record<string, { title: string; subtitle?: string }> = {
  vendas:      { title: 'Vendas', subtitle: 'Apontamento de vendas' },
  topProducts: { title: 'Produtos mais Vendidos' },
  payables:    { title: 'Total a pagar x Total a receber', subtitle: 'Últimos 7 dias' },
  delays:      { title: 'Financeiro – Recebimentos com atraso', subtitle: 'Últimos 12 meses' },
  soldGoal:    { title: 'Quantidade vendida x meta' },
  leadTime:    { title: 'Lead Time médio de Ordens de Produção' },
  countries:   { title: 'Vendas por Estado', subtitle: 'Mapa do Brasil' },
  production:  { title: 'Qtd. produzida x Qtd. prevista por produto' },
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

const axisStyle = { fontSize: 10, fill: '#9ca3af' };
const gridProps = { stroke: '#f3f4f6', strokeDasharray: '3 3' };
const tooltipProps = {
  contentStyle: {
    fontSize: 11,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
  },
};

function VendasPanel() {
  return (
    <div className="p-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {VENDAS_CARDS.map(({ icon: Icon, label, value, change, up }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Icon size={17} className="text-[#3B82F6]" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
            <p className={cn('text-[11px] mt-1.5 font-medium flex items-center gap-1', up ? 'text-emerald-600' : 'text-red-500')}>
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {change}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopProductsPanel() {
  return (
    <div className="p-5">
      <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
        <span>#</span>
        <span className="flex-1 ml-3">Nome</span>
        <span>Vendas</span>
        <span className="ml-3 w-10 text-right">%</span>
      </div>
      <div className="space-y-3">
        {TOP_PRODUCTS.map(({ rank, name, pct, color }) => (
          <div key={rank} className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 font-medium w-5 shrink-0">{rank}</span>
            <span className="text-xs text-gray-700 w-14 shrink-0 truncate">{name}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: color + '20', color }}
            >
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PayablesPanel() {
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={WEEKLY_DATA} barSize={8} barGap={3}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`} width={28} />
          <Tooltip {...tooltipProps} formatter={(v: number) => [`R$${v}k`]} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="aReceber" name="A receber" fill="#3B82F6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="aPagar"   name="A pagar"   fill="#10B981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DelaysPanel() {
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={DELAYS_DATA}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
          <Tooltip {...tooltipProps} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Line dataKey="mais15" name="Atrasado +15 dias" stroke="#10B981" strokeWidth={2} dot={false} />
          <Line dataKey="mais30" name="Atrasado +30 dias" stroke="#EF4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SoldGoalPanel() {
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={SOLD_GOAL_DATA} barSize={9} barGap={3}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
          <Tooltip {...tooltipProps} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="vendido" name="Vendido" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
          <Bar dataKey="meta"    name="Meta"    fill="#F59E0B" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LeadTimePanel() {
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={LEAD_DATA} barSize={8} barGap={3}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={24} />
          <Tooltip {...tooltipProps} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="producao" name="Produção" fill="#3B82F6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="entrega"  name="Entrega"  fill="#10B981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CountriesPanel() {
  return (
    <div className="pt-1">
      <BrazilMap data={STATES_SALES} />
    </div>
  );
}

function ProductionPanel() {
  return (
    <div className="p-5">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={PRODUCTION_DATA} barSize={10} barGap={3}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="prod" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
          <Tooltip {...tooltipProps} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="produzido" name="Produzido" fill="#3B82F6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="previsto"  name="Previsto"  fill="#93c5fd" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PANEL_CONTENT: Record<string, FC> = {
  vendas:      VendasPanel,
  topProducts: TopProductsPanel,
  payables:    PayablesPanel,
  delays:      DelaysPanel,
  soldGoal:    SoldGoalPanel,
  leadTime:    LeadTimePanel,
  countries:   CountriesPanel,
  production:  ProductionPanel,
};

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
        'bg-white rounded-xl border transition-all duration-150',
        editMode ? 'border-dashed border-gray-300 shadow-sm' : 'border-gray-100 shadow-sm',
        isDragging && 'opacity-30',
        isDragOver && editMode && 'border-[#3B82F6] border-solid ring-2 ring-[#3B82F6]/20',
        editMode && !isDragging && 'cursor-grab active:cursor-grabbing',
        panel.cols === 1 ? 'col-span-1' : 'col-span-1 lg:col-span-2',
      )}
    >
      <div className={cn(
        'flex items-center justify-between px-5 pt-4 pb-1',
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
            {([1, 2] as const).map(n => (
              <button
                key={n}
                onClick={() => onResize(n)}
                className={cn(
                  'w-6 h-6 rounded text-[10px] font-bold transition-colors border',
                  panel.cols === n
                    ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                    : 'text-gray-400 border-gray-200 hover:border-[#3B82F6] hover:text-[#3B82F6]',
                )}
              >
                {n}
              </button>
            ))}
            <button
              onClick={onHide}
              className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors ml-1"
            >
              <EyeOff size={11} />
            </button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

function loadPanels(): PanelConfig[] {
  try {
    const saved = localStorage.getItem('valisys-dashboard-panels');
    if (!saved) return DEFAULT_PANELS;
    const parsed: PanelConfig[] = JSON.parse(saved);
    const missing = DEFAULT_PANELS.filter(d => !parsed.find(p => p.id === d.id));
    return [...parsed, ...missing];
  } catch {
    return DEFAULT_PANELS;
  }
}

export function DashboardPage() {
  const [panels, setPanels]       = useState<PanelConfig[]>(loadPanels);
  const [editMode, setEditMode]   = useState(false);
  const [dragId, setDragId]       = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('valisys-dashboard-panels', JSON.stringify(panels));
  }, [panels]);

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

  const visible = panels.filter(p => p.visible);
  const hidden  = panels.filter(p => !p.visible);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <Home size={11} /><ChevronRight size={11} /><span>Dashboard</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
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
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              editMode
                ? 'bg-[#3B82F6] text-white shadow-md hover:bg-[#2563eb]'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#3B82F6] hover:text-[#3B82F6] shadow-sm',
            )}
          >
            {editMode ? <Check size={14} /> : <Pencil size={14} />}
            {editMode ? 'Concluir' : 'Personalizar'}
          </button>
        </div>
      </div>

      {editMode && (
        <div className="mb-4 px-4 py-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl text-xs text-[#1d4ed8] flex items-center gap-2">
          <GripVertical size={13} />
          <span>
            Arraste os painéis para reorganizá-los. Use os botões <strong>1</strong> e <strong>2</strong> para ajustar a largura.
            Clique em <EyeOff size={11} className="inline" /> para ocultar.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#eff6ff] transition-colors"
              >
                <Eye size={12} />
                {PANEL_META[panel.id]?.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
