import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gauge, LayersPlus, Briefcase, ScanLine, Factory, DraftingCompass, Package, CircleDollarSign, BarChart3,
  SlidersHorizontal, LogOut, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubItem { label: string; href: string }
interface NavGroup { label: string; items: SubItem[] }
interface NavItemDef {
  icon: React.ElementType;
  label: string;
  href: string;
  children?: SubItem[];  
  groups?: NavGroup[]; 
}

const NAV_ITEMS: NavItemDef[] = [
  // Dashboard — sempre primeiro
  {
    icon: Gauge,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: LayersPlus,
    label: 'Cadastros',
    href: '/cadastros',
    groups: [
      {
        label: 'Basicos',
        items: [
          { label: 'Almoxarifados',          href: '/cadastros/almoxarifados' },
          { label: 'Categorias de Produto',  href: '/cadastros/categorias' },
          { label: 'Condições de Pagamento', href: '/cadastros/condicoes-pagamento' },
          { label: 'Depósitos',              href: '/cadastros/depositos' },
          { label: 'Fases de Produção',      href: '/cadastros/fases' },
          { label: 'Finalidades de Pedido',  href: '/cadastros/finalidades' },
          { label: 'Formas de Pagamento',    href: '/cadastros/formas-pagamento' },
          { label: 'Tipos de Ordem',         href: '/cadastros/tipos-ordem' },
          { label: 'Unidades de Medida',     href: '/cadastros/unidades' },
        ],
      },
      {
        label: 'Avançados',
        items: [
          { label: 'Pessoas',  href: '/cadastros/pessoas' },
          { label: 'Produtos', href: '/cadastros/produtos' },
        ],
      },
    ],
  },
  {
    icon: Briefcase,
    label: 'Comercial',
    href: '/comercial',
    children: [
      { label: 'Catalogo de Produtos',         href: '/catalogo/produtos' },
      { label: 'Clientes',         href: '/comercial/clientes' },
      { label: 'Orçamentos',       href: '/comercial/orcamentos' },
      { label: 'Pedidos de Venda', href: '/comercial/pedidos' },
    ],
  },
  {
    icon: ScanLine,
    label: 'Consulta e Ação',
    href: '/consulta-acao',
    children: [
      { label: 'Consulta e Ação', href: '/scan' },
    ],
  },
  {
    icon: DraftingCompass,
    label: 'Engenharia',
    href: '/engenharia',
    children: [
      { label: 'Ficha Técnica',      href: '/producao/fichas-tecnicas' }
    ],
  },
  {
    icon: Package,
    label: 'Estoque',
    href: '/estoque',
    children: [
      { label: 'Inventário',    href: '/estoque/inventario' },
      { label: 'Movimentações', href: '/estoque/movimentacoes' },
    ],
  },
  {
    icon: CircleDollarSign,
    label: 'Financeiro',
    href: '/financeiro',
    children: [
      { label: 'Contas a Pagar',     href: '/financeiro/contas-pagar' },
      { label: 'Contas a Receber',   href: '/financeiro/contas-receber' },
      { label: 'Fluxo de Caixa',     href: '/financeiro/fluxo-caixa' },
      { label: 'Gestão de Carteira', href: '/financeiro/carteira' },
    ],
  },
  {
    icon: Factory,
    label: 'Produção',
    href: '/producao',
    children: [
      { label: 'Kanban',             href: '/producao/kanban' },
      { label: 'Lotes',              href: '/lotes' },
      { label: 'Ordens de Produção', href: '/producao/ordens' },
      { label: 'Roteiros de Produção', href: '/producao/roteiros' },
    ],
  },
  {
    icon: BarChart3,
    label: 'Relatórios',
    href: '/relatorios',
    children: [
      { label: 'Estoque',    href: '/relatorios/estoque' },
      { label: 'Financeiro', href: '/relatorios/financeiro' },
      { label: 'Vendas',     href: '/relatorios/vendas' },
    ],
  },
];

const CONFIG_ITEM: NavItemDef = {
  icon: SlidersHorizontal,
  label: 'Configurações',
  href: '/configuracoes',
  children: [
    { label: 'Logs',     href: '/configuracoes/Logs' },
    { label: 'Perfis',   href: '/configuracoes/perfis' },
    { label: 'Usuários', href: '/configuracoes/usuarios' },
  ],
};

interface FlyoutProps {
  item: NavItemDef;
  anchorY: number;
  onClose: () => void;
}

function Flyout({ item, anchorY, onClose }: FlyoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const allItems = item.children ?? [];
  const topPx = Math.min(
    Math.max(anchorY, 56),
    window.innerHeight - (allItems.length * 34 + 80),
  );

  const linkClass = 'flex items-center justify-between pl-6 pr-4 py-2 text-sm text-gray-500 hover:bg-[#eff6ff] hover:text-[#3B82F6] transition-colors group';
  const chevron = <ChevronRight size={12} className="text-gray-300 group-hover:text-[#3B82F6] shrink-0 ml-6" />;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      transition={{ duration: 0.11, ease: 'easeOut' }}
      className="fixed z-50 bg-white border border-gray-200 min-w-[210px] overflow-hidden"
      style={{
        left: 56,
        top: topPx,
        borderRadius: '0 6px 6px 0',
        boxShadow: '4px 4px 16px rgba(0,0,0,0.10)',
        borderLeft: '3px solid #3B82F6',
      }}
    >
      {item.children && (
        <div className="py-1">
          {item.children.map(child => (
            <a key={child.href} href={child.href} onClick={onClose} className={linkClass}>
              {child.label}{chevron}
            </a>
          ))}
        </div>
      )}

      {item.groups && (
        <div className="py-1">
          {item.groups.map((group, gi) => {
            const isOpen = openGroup === group.label;
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className="flex w-full items-center justify-between px-4 py-1.5 text-[11px] text-sm text-gray-500"
                >
                  {group.label}
                  <ChevronRight
                    size={11}
                    className={cn('transition-transform duration-150 text-gray-300', isOpen && 'rotate-90')}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      {group.items.map(child => (
                        <a key={child.href} href={child.href} onClick={onClose} className={linkClass}>
                          {child.label}{chevron}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
  currentPath?: string;
  showToggle?: boolean;
  showLabels?: boolean;
}

export function Sidebar({ currentPath = '/', showLabels = false }: SidebarProps) {
  const [flyout, setFlyout] = useState<{ id: string; y: number } | null>(null);

  const handleClick = (item: NavItemDef, e: React.MouseEvent<HTMLElement>) => {
    if (item.children || item.groups) {
      const rect = e.currentTarget.getBoundingClientRect();
      setFlyout(prev =>
        prev?.id === item.href ? null : { id: item.href, y: rect.top },
      );
    } else {
      setFlyout(null);
      window.location.href = item.href;
    }
  };

  const activeItem = NAV_ITEMS.find(
    i => currentPath === i.href || currentPath.startsWith(i.href + '/'),
  );

  return (
    <>
      <aside className={cn(
        'flex flex-col h-full shrink-0 bg-white border-r border-gray-200',
        showLabels ? 'w-52' : 'w-14',
      )}>
        {/* Navegação */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = activeItem?.href === item.href;
            const isOpen = flyout?.id === item.href;
            const Icon = item.icon;

            if (showLabels) {
              return (
                <a
                  key={item.href}
                  href={item.children || item.groups ? undefined : item.href}
                  onClick={item.children || item.groups ? (e) => handleClick(item, e) : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-gray-500 hover:bg-blue-50 hover:text-[#3B82F6]',
                  )}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {(item.children || item.groups) && <ChevronRight size={13} className="opacity-40" />}
                </a>
              );
            }

            return (
              <div key={item.href} className="relative group/tip">
                <button
                  onClick={(e) => handleClick(item, e)}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-md mx-auto transition-all duration-100',
                    active || isOpen
                      ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-200'
                      : 'text-gray-400 hover:bg-blue-50 hover:text-[#3B82F6]',
                  )}
                >
                  <Icon size={20} />
                </button>

                {!isOpen && (
                  <span className="
                    pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                    px-2.5 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                    opacity-0 group-hover/tip:opacity-100
                    translate-x-1 group-hover/tip:translate-x-0
                    transition-all duration-150 z-50
                  ">
                    {item.label}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Configurações + Sair */}
        <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
          {/* Configurações */}
          {(() => {
            const item = CONFIG_ITEM;
            const active = currentPath.startsWith(item.href);
            const isOpen = flyout?.id === item.href;
            const Icon = item.icon;
            if (showLabels) {
              return (
                <a
                  href={item.children || item.groups ? undefined : item.href}
                  onClick={item.children || item.groups ? (e) => handleClick(item, e) : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                    active ? 'bg-[#3B82F6] text-white' : 'text-gray-500 hover:bg-blue-50 hover:text-[#3B82F6]',
                  )}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {(item.children || item.groups) && <ChevronRight size={13} className="opacity-40" />}
                </a>
              );
            }
            return (
              <div className="relative group/tip">
                <button
                  onClick={(e) => handleClick(item, e)}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-md mx-auto transition-all duration-100',
                    active || isOpen
                      ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-200'
                      : 'text-gray-400 hover:bg-blue-50 hover:text-[#3B82F6]',
                  )}
                >
                  <Icon size={20} />
                </button>
                {!isOpen && (
                  <span className="
                    pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                    px-2.5 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                    opacity-0 group-hover/tip:opacity-100
                    translate-x-1 group-hover/tip:translate-x-0
                    transition-all duration-150 z-50">
                    {item.label}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                  </span>
                )}
              </div>
            );
          })()}

          {/* Sair */}
          <div className="relative group/tip">
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/'; }}
              className={cn(
                'flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors',
                showLabels ? 'gap-3 px-3 py-2.5 w-full' : 'w-10 h-10 mx-auto',
              )}
            >
              <LogOut size={17} className="shrink-0" />
              {showLabels && <span className="text-sm font-medium">Sair</span>}
            </button>

            {!showLabels && (
              <span className="
                pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                px-2.5 py-1 rounded-md bg-gray-800 text-white text-xs whitespace-nowrap
                opacity-0 group-hover/tip:opacity-100
                translate-x-1 group-hover/tip:translate-x-0
                transition-all duration-150 z-50">
                Sair
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
              </span>
            )}
          </div>
        </div>
      </aside>
      <AnimatePresence>
        {flyout && (() => {
          const item = [...NAV_ITEMS, CONFIG_ITEM].find(i => i.href === flyout.id);
          return (item?.children || item?.groups) ? (
            <Flyout
              key={flyout.id}
              item={item}
              anchorY={flyout.y}
              onClose={() => setFlyout(null)}
            />
          ) : null;
        })()}
      </AnimatePresence>
    </>
  );
}
