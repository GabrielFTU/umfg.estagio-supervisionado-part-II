import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader2, Home, ChevronRight,
  Layers, ClipboardList, ListOrdered, Image,
  FlaskConical, Ruler,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FichaTecnica {
  id: string;
  produtoId: string;
  produtoCodigo: string;
  produtoNome: string;
  produtoImagemUrl: string | null;
  codigo: string;
  versao: string;
  descricao: string | null;
  ativa: boolean;
  itens: unknown[];
  sequencias: unknown[];
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon, label, onClick, disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-8 transition-all text-center',
        disabled
          ? 'border-gray-100 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.03)_6px,rgba(0,0,0,0.03)_7px)] text-gray-300 cursor-not-allowed'
          : 'border-[#2D6A2D] bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(45,106,45,0.04)_6px,rgba(45,106,45,0.04)_7px)] text-[#2D6A2D] hover:bg-emerald-50 hover:border-emerald-600 cursor-pointer',
      )}
    >
      <Icon size={32} strokeWidth={1.4} />
      <span className="text-sm font-semibold leading-tight whitespace-pre-line">{label}</span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FichaTecnicaPainelPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ficha, setFicha]     = useState<FichaTecnica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/fichas-tecnicas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setFicha(await res.json());
      } catch { setError('Não foi possível carregar a ficha técnica.'); }
      finally { setLoading(false); }
    };
    if (id) load();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-full gap-2 text-gray-600 text-sm">
      <Loader2 size={16} className="animate-spin" /> Carregando…
    </div>
  );

  if (error || !ficha) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      <p className="text-sm text-red-600 font-medium">{error || 'Ficha técnica não encontrada.'}</p>
      <button onClick={() => navigate('/producao/fichas-tecnicas')}
        className="text-xs text-blue-600 hover:underline font-medium">Voltar</button>
    </div>
  );

  const sections = [
    { icon: Layers,      label: 'Consumo',                  path: 'consumo',               disabled: false },
    { icon: ClipboardList, label: 'Detalhe',                path: 'detalhe',               disabled: true  },
    { icon: ListOrdered, label: 'Sequência\nOperacional',    path: 'sequencia-operacional', disabled: false },
    { icon: Image,       label: 'Imagens',                  path: 'imagens',               disabled: true  },
    { icon: FlaskConical, label: 'Composição\ne Conservação', path: 'composicao',          disabled: true  },
    { icon: Ruler,       label: 'Medidas',                  path: 'medidas',               disabled: true  },
  ];

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <button onClick={() => navigate('/producao/fichas-tecnicas')}
            className="hover:text-gray-700 transition-colors">Ficha Técnica</button>
          <ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Painel</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Product title */}
          <p className="text-base font-semibold text-gray-800 text-center mb-10">
            {ficha.produtoCodigo} - {ficha.produtoNome}
          </p>

          {/* Section grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sections.map(s => (
              <SectionCard
                key={s.path}
                icon={s.icon}
                label={s.label}
                disabled={s.disabled}
                onClick={s.disabled ? undefined : () => navigate(`/producao/fichas-tecnicas/${id}/${s.path}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
