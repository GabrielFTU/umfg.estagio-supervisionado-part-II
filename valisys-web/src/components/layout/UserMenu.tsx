import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, KeyRound, LogOut } from 'lucide-react';
import { logout } from '@/services/auth';
import { ChangePasswordModal } from './ChangePasswordModal';

interface User {
  nome?: string;
  email?: string;
  perfilNome?: string;
}

interface UserMenuProps {
  user: User;
  initials: string;
}

export function UserMenu({ user, initials }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [senhaModalAberto, setSenhaModalAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
          <span className="text-white text-[11px] font-bold">{initials}</span>
        </div>
        <span className="text-white text-sm font-medium hidden md:block max-w-[120px] truncate">
          {user?.nome?.split(' ')[0] ?? 'Usuário'}
        </span>
        <ChevronDown size={13} className={`text-white/60 hidden md:block transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white rounded-xl border border-gray-100 shadow-xl shadow-black/10 overflow-hidden z-50"
          >
            {/* Info do usuário */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-50/70">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.nome ?? 'Usuário'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email ?? ''}</p>
                {user?.perfilNome && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-medium text-[#1D4E89]">
                    {user.perfilNome}
                  </span>
                )}
              </div>
            </div>

            <div className="py-1.5">
              <button
                onClick={() => { setOpen(false); setSenhaModalAberto(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1D4E89] transition-colors"
              >
                <KeyRound size={15} />
                Alterar senha
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChangePasswordModal aberto={senhaModalAberto} onFechar={() => setSenhaModalAberto(false)} />
    </div>
  );
}
