import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'Comercial', href: '/comercial' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  currentPath?: string;
  showToggle?: boolean;
}

export function Sidebar({ collapsed, onCollapse, currentPath = '/', showToggle = true }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      className="relative flex flex-col h-full bg-[#111] text-white overflow-visible shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-[18px] border-b border-white/10 overflow-hidden">
        <img src="/icon-white.png" alt="Valisys" className="w-7 h-7 shrink-0 object-contain" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="logo-label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="ml-3 font-semibold text-sm whitespace-nowrap"
            >
              Valisys
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-hidden">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = currentPath === href || currentPath.startsWith(href + '/');
          return (
            <a
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/55 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key={`label-${href}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/10 overflow-hidden">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/55 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="whitespace-nowrap"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      {showToggle && (
        <button
          onClick={() => onCollapse(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#2a2a2a] border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors shadow-lg z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}
    </motion.aside>
  );
}
