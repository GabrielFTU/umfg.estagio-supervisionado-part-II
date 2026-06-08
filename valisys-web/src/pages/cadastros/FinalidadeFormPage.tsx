import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

type Modo = 'criar' | 'editar' | 'visualizar';

const uCls = 'w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300';

function UField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      'border-b py-3 transition-colors focus-within:border-[#3B82F6]',
      error ? 'border-red-400' : 'border-gray-200',
    )}>
      <label className="block text-xs text-gray-400 mb-0.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export function FinalidadeFormPage() {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const modo: Modo = !id ? 'criar' : location.pathname.endsWith('/editar') ? 'editar' : 'visualizar';
  const readOnly   = modo === 'visualizar';

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving]   = useState(false);
  const [ativo, setAtivo]     = useState(true);
  const [nome, setNome]       = useState('');
  const [descricao, setDescricao] = useState('');
  const [erroNome, setErroNome]   = useState('');
  const [globalErr, setGlobalErr] = useState('');

  useEffect(() => {
    if (!id) return;
    const fn = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/finalidades/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { navigate('/cadastros/finalidades'); return; }
      const data = await res.json();
      setNome(data.nome); setDescricao(data.descricao ?? ''); setAtivo(data.ativo);
      setLoading(false);
    };
    fn();
  }, [id, navigate]);

  const handleSalvar = async () => {
    if (!nome.trim()) { setErroNome('O nome é obrigatório.'); return; }
    setSaving(true); setGlobalErr('');
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    try {
      const res = modo === 'criar'
        ? await fetch('/api/finalidades', { method: 'POST', headers, body: JSON.stringify({ nome: nome.trim(), descricao: descricao.trim() || undefined }) })
        : await fetch(`/api/finalidades/${id}`, { method: 'PUT', headers, body: JSON.stringify({ id, nome: nome.trim(), descricao: descricao.trim() || undefined, ativo }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Erro ao salvar.');
      }
      showToast();
      navigate('/cadastros/finalidades');
    } catch (err: any) {
      setGlobalErr(err.message);
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Carregando…
      </div>
    );
  }

  const titulo = modo === 'criar' ? 'Nova Finalidade' : modo === 'editar' ? 'Editar Finalidade' : nome;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Barra de topo ── */}
      <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => navigate('/cadastros/finalidades')}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
          <ChevronLeft size={17} />
        </button>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <button onClick={() => navigate('/cadastros/finalidades')} className="hover:text-gray-600">
            Finalidade de pedido
          </button>
          <span>›</span>
          <span className="text-gray-600">{titulo}</span>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 pb-24">

          {globalErr && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{globalErr}</div>
          )}

          <div className="mt-1">
            <UField label="Nome" required error={erroNome}>
              {readOnly
                ? <p className="text-sm text-gray-700">{nome}</p>
                : <input className={uCls} value={nome} placeholder="Ex: Venda Normal, Demonstração…" maxLength={100}
                    onChange={e => { setNome(e.target.value); setErroNome(''); }} />
              }
            </UField>

            <UField label="Descrição">
              {readOnly
                ? <p className="text-sm text-gray-700">{descricao || '—'}</p>
                : <textarea rows={2} className={cn(uCls, 'resize-none')} value={descricao}
                    placeholder="Descrição opcional…" maxLength={500}
                    onChange={e => setDescricao(e.target.value)} />
              }
            </UField>

            {modo === 'editar' && (
              <div className="py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Status</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ativo ? 'Ativo' : 'Inativo'}</p>
                </div>
                <button type="button" onClick={() => setAtivo(v => !v)}
                  className={cn('relative overflow-hidden w-10 h-[22px] rounded-full transition-colors duration-200',
                    ativo ? 'bg-[#3B82F6]' : 'bg-gray-200')}>
                  <span className={cn('absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    ativo ? 'translate-x-[17px]' : 'translate-x-0')} />
                </button>
              </div>
            )}

            {modo === 'visualizar' && (
              <div className="py-4 border-b border-gray-200">
                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                  ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                  {ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
        {readOnly ? (
          <>
            <button onClick={() => navigate('/cadastros/finalidades')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Voltar
            </button>
            <button onClick={() => navigate(`/cadastros/finalidades/${id}/editar`)}
              className="h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors">
              Editar
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/cadastros/finalidades')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={saving}
              className="flex items-center gap-2 h-9 px-6 rounded-full bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] transition-colors disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
