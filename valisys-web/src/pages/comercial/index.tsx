import { ShoppingCart } from 'lucide-react';

export function ComercialPage() {
  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
          <ShoppingCart size={18} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Comercial</h1>
          <p className="text-sm text-gray-500">Gestão de clientes, pedidos e negociações.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {['Clientes', 'Pedidos do Mês', 'Propostas Abertas'].map((item) => (
          <div key={item} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{item}</p>
            <p className="text-xl font-semibold text-gray-900">—</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm min-h-72 flex flex-col items-center justify-center gap-2">
        <ShoppingCart size={32} className="text-gray-200" />
        <p className="text-sm text-gray-400 font-medium">Módulo Comercial</p>
        <p className="text-xs text-gray-300">Em desenvolvimento</p>
      </div>
    </div>
  );
}
