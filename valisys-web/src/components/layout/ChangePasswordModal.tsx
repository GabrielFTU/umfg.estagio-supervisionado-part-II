import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, KeyRound, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { changePassword } from '@/services/auth';
import { useToast } from '@/contexts/ToastContext';

interface ChangePasswordModalProps {
  aberto: boolean;
  onFechar: () => void;
}

const inputCls = (error?: string) => cn(
  'w-full h-9 bg-transparent text-sm border-b transition-colors focus:outline-none placeholder:text-gray-300 pr-8',
  error ? 'border-red-400' : 'border-gray-300 focus:border-[#1D4E89]',
);

export function ChangePasswordModal({ aberto, onFechar }: ChangePasswordModalProps) {
  const { showToast } = useToast();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setNovaSenha('');
    setConfirmarSenha('');
    setShowSenha(false);
    setFieldErrors({});
    setError('');
    setSaving(false);
  };

  const fechar = () => {
    if (saving) return;
    reset();
    onFechar();
  };

  const clearErr = (f: string) => setFieldErrors(p => ({ ...p, [f]: '' }));

  const validate = (): boolean => {
    const erros: Record<string, string> = {};
    if (!novaSenha) erros.novaSenha = 'A nova senha é obrigatória.';
    else if (novaSenha.length < 6 || novaSenha.length > 50) erros.novaSenha = 'A senha deve ter entre 6 e 50 caracteres.';

    if (!confirmarSenha) erros.confirmarSenha = 'Confirme a nova senha.';
    else if (confirmarSenha !== novaSenha) erros.confirmarSenha = 'As senhas não coincidem.';

    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setSaving(true);
    try {
      await changePassword(novaSenha, confirmarSenha);
      showToast('Senha alterada com sucesso.');
      reset();
      onFechar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
            onClick={fechar}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <KeyRound size={16} className="text-[#1D4E89]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">Alterar senha</p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      Escolha uma nova senha de acesso.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fechar}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 ml-2"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="px-5 pb-4 flex flex-col gap-4">
                  {error && (
                    <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Nova senha <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSenha ? 'text' : 'password'}
                        value={novaSenha}
                        onChange={e => { setNovaSenha(e.target.value); clearErr('novaSenha'); }}
                        placeholder="Mínimo de 6 caracteres"
                        maxLength={50}
                        autoFocus
                        className={inputCls(fieldErrors.novaSenha)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(v => !v)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {fieldErrors.novaSenha && <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.novaSenha}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Confirmar nova senha <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSenha ? 'text' : 'password'}
                        value={confirmarSenha}
                        onChange={e => { setConfirmarSenha(e.target.value); clearErr('confirmarSenha'); }}
                        placeholder="Repita a nova senha"
                        maxLength={50}
                        className={inputCls(fieldErrors.confirmarSenha)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(v => !v)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {fieldErrors.confirmarSenha && <p className="text-[11px] text-red-500 mt-0.5">{fieldErrors.confirmarSenha}</p>}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    type="button"
                    onClick={fechar}
                    disabled={saving}
                    className="flex-1 h-9 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-9 rounded-lg text-sm text-white font-medium bg-[#1D4E89] hover:bg-[#163D6D] transition-colors disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400"
                  >
                    {saving
                      ? <span className="flex items-center justify-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Salvando…</span>
                      : 'Salvar senha'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
