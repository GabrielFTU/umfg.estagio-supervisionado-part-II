import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';

const CARDS = [
  { icon: DollarSign, label: 'Receita do Mês', value: 'R$ —', change: '' },
  { icon: ShoppingCart, label: 'Pedidos Abertos', value: '—', change: '' },
  { icon: TrendingUp, label: 'Meta Atingida', value: '— %', change: '' },
  { icon: Users, label: 'Clientes Ativos', value: '—', change: '' },
];

export function DashboardPage() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') ?? '{}');
    } catch {
      return {};
    }
  })();

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Olá{user?.nome ? `, ${user.nome.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Bem-vindo ao painel de controle da Valisys.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {CARDS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Icon size={15} className="text-gray-400" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm min-h-64 flex flex-col">
          <h2 className="text-sm font-medium text-gray-700 mb-1">Visão Geral</h2>
          <p className="text-xs text-gray-400">Gráficos e relatórios serão exibidos aqui.</p>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-gray-300">Em desenvolvimento</span>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm min-h-64 flex flex-col">
          <h2 className="text-sm font-medium text-gray-700 mb-1">Atividades Recentes</h2>
          <p className="text-xs text-gray-400">Últimas movimentações do sistema.</p>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-gray-300">Em desenvolvimento</span>
          </div>
        </div>
      </div>
    </div>
  );
}
