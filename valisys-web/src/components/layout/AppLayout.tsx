import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';


interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') ?? '{}'); }
    catch { return {}; }
  })();

  const initials = user?.nome
    ? user.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ─── Header ─── */}
      <header className="h-14 bg-[#3B5998] flex items-center px-4 shrink-0 z-20 shadow-lg">
        <div className="flex-1 flex items-center">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-white/70 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <img src="/icon-white.png" alt="Valisys" className="h-8 w-8 object-contain" />
          <span className="text-white font-semibold text-sm tracking-wide">
            Valisys ERP
          </span>
        </div>

        {/* Direita — ações */}
        <div className="flex-1 flex items-center justify-end gap-1">
          <button className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-300 rounded-full border border-[#FFDE21]" />
          </button>

          <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <span className="text-white text-sm font-medium hidden md:block max-w-[120px] truncate">
              {user?.nome?.split(' ')[0] ?? 'Usuário'}
            </span>
            <ChevronDown size={13} className="text-white/60 hidden md:block" />
          </button>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:flex relative z-10">
          <Sidebar currentPath={pathname} />
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="drawer"
              className="fixed left-0 top-0 h-full z-40 lg:hidden flex"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <Sidebar currentPath={pathname} showLabels />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 -right-10 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#eef1f6]">
          {children}
        </main>
      </div>
    </div>
  );
}
