import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { login, saveSession } from '@/services/auth';

type Mode = 'login' | 'register';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, senha);
      saveSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 bg-[#3B82F6] text-white p-12 relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full border border-white/[0.06] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-white/[0.03] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-xs text-center">
          <img src="/icon-white.png" alt="Valisys" className="h-20 w-auto object-contain select-none" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Althel ERP</h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Controle total da sua empresa em uma única plataforma.
            </p>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {['Gestão Comercial', 'Gestão Financeira', 'Controle de Produção', 'Indicadores Gerenciais'].map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs rounded-full border border-white/55 text-white/100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile logo */}
        <div className="flex justify-center pt-10 pb-2 lg:hidden">
          <img src="/icon-black.png" alt="Valisys" className="h-14 w-auto object-contain" />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[380px]">

            {/* Sliding tab switcher */}
            <div className="relative flex bg-gray-100 rounded-xl p-1 mb-8">
              <motion.div
                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
                animate={{
                  left: mode === 'login' ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              />
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  mode === 'login' ? 'text-gray-900' : 'text-gray-500'}`}>
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  mode === 'register' ? 'text-gray-900' : 'text-gray-500'}`}>
                Criar conta
              </button>
            </div>

            {/*Animação */}
            <AnimatePresence mode="wait" initial={false}>
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}>
                  <h1 className="text-xl font-normal text-gray-900 mb-7 tracking-tight">
                    Insira suas credenciais
                  </h1>

                  <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <Input
                      id="email"
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      />
                    <div>
                      <Input
                        id="senha"
                        type="password"
                        label="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        autoComplete="current-password"
                      />
                      <div className="flex justify-end mt-2">
                        <a href="#" className="text-xs text-blue-500 hover:underline">
                          Esqueci minha senha
                        </a>
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-500 -mt-1">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#111] text-white text-xs font-semibold tracking-[2.5px] uppercase hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 mt-1"
                    >
                      {loading ? 'ENTRANDO...' : 'ENTRAR'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <h1 className="text-xl font-normal text-gray-900 mb-7 tracking-tight">
                    Crie sua conta
                  </h1>

                  <form className="flex flex-col gap-5">
                    <Input id="nome" type="text" label="Nome completo" autoComplete="name" required />
                    <Input id="reg-email" type="email" label="Email" autoComplete="email" required />
                    <Input
                      id="reg-senha"
                      type="password"
                      label="Senha"
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#111] text-white text-xs font-semibold tracking-[2.5px] uppercase hover:bg-gray-800 transition-colors mt-1"
                    >
                      CADASTRAR
                    </button>

                    <p className="text-xs text-gray-400 text-center leading-relaxed">
                      O cadastro está sujeito à aprovação do administrador.
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          © {new Date().getFullYear()} By Valisys. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
