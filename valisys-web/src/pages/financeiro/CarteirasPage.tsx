import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Loader2, Landmark, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalMsg } from '@/components/ui/ModalMsg';
import { fetchWithAuth } from '@/services/api';

interface CarteiraItem {
  id: string;
  codigoBanco: string;
  nomeBanco: string;
  titular: string;
  saldoInicial: number;
  saldoAtual: number;
  dataHoraSaldoInicial: string;
  ativo: boolean;
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function BankInitials({ nome }: { nome: string }) {
  const words = nome.trim().split(/\s+/);
  const initials = words.length >= 2
    ? words[0][0] + words[1][0]
    : nome.slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-lg bg-[#1D4E89] flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-bold uppercase">{initials}</span>
    </div>
  );
}

function CardMenu({
  ativo,
  onEdit,
  onToggle,
  onExtrato,
}: {
  ativo: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onExtrato: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(v => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px]"
          style={{ top: pos.top, right: pos.right }}
        >
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => { setOpen(false); onExtrato(); }}
          >
            Ver extrato
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            Editar
          </button>
          <button
            className={cn(
              'flex w-full items-center px-4 py-2 text-sm transition-colors',
              ativo
                ? 'text-red-600 hover:bg-red-50'
                : 'text-emerald-600 hover:bg-emerald-50',
            )}
            onClick={() => { setOpen(false); onToggle(); }}
          >
            {ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

export function CarteirasPage() {
  const navigate = useNavigate();
  const [carteiras, setCarteiras] = useState<CarteiraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [apenasAtivos, setApenasAtivos] = useState(true);
  const [confirmToggle, setConfirmToggle] = useState<CarteiraItem | null>(null);

  const fetchCarteiras = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/carteiras');
      if (res.ok) setCarteiras(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCarteiras(); }, []);

  const handleToggle = async () => {
    if (!confirmToggle) return;
    const url = confirmToggle.ativo
      ? `/api/carteiras/${confirmToggle.id}`
      : `/api/carteiras/${confirmToggle.id}/ativar`;
    const method = confirmToggle.ativo ? 'DELETE' : 'PATCH';
    await fetchWithAuth(url, { method });
    setConfirmToggle(null);
    fetchCarteiras();
  };

  const filtered = carteiras.filter(c => {
    if (apenasAtivos && !c.ativo) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.nomeBanco.toLowerCase().includes(q) ||
      c.codigoBanco.includes(q) ||
      c.titular.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Informe o Titular / Banco"
                className="w-full pl-9 pr-3 h-9 bg-transparent border-b border-gray-200 text-sm focus:outline-none focus:border-[#1D4E89] placeholder:text-gray-300 transition-colors"
              />
            </div>
            {apenasAtivos && (
              <button
                onClick={() => setApenasAtivos(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D4E89] text-white text-xs font-medium"
              >
                Status: ATIVO
                <span className="text-white/70 hover:text-white">&times;</span>
              </button>
            )}
            {!apenasAtivos && (
              <button
                onClick={() => setApenasAtivos(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 text-xs"
              >
                Exibindo todos
              </button>
            )}
          </div>

          <button
            onClick={() => navigate('/financeiro/carteira/nova')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D4E89] text-white text-sm font-medium hover:bg-[#163D6D] transition-colors shrink-0"
          >
            <Plus size={15} />
            Nova carteira
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400 text-sm">
            <Landmark size={32} className="text-gray-200" />
            <p>Nenhuma carteira encontrada</p>
            <button
              onClick={() => navigate('/financeiro/carteira/nova')}
              className="mt-1 text-[#1D4E89] hover:underline text-xs"
            >
              Cadastrar nova carteira
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div
                key={c.id}
                className={cn(
                  'bg-white rounded-xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md',
                  c.ativo ? 'border-gray-100' : 'border-gray-100 opacity-60',
                )}
              >
                {/* Top: icon + banco + menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BankInitials nome={c.nomeBanco} />
                    <div>
                      <p className="text-xs text-gray-400">{c.codigoBanco}</p>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{c.nomeBanco}</p>
                    </div>
                  </div>
                  <CardMenu
                    ativo={c.ativo}
                    onEdit={() => navigate(`/financeiro/carteira/${c.id}/editar`)}
                    onToggle={() => setConfirmToggle(c)}
                    onExtrato={() => navigate(`/financeiro/carteira/${c.id}/extrato`)}
                  />
                </div>

                {/* Titular */}
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Titular</p>
                  <p className="text-sm text-gray-700 font-medium">{c.titular}</p>
                </div>

                {/* Saldo */}
                <div className="flex items-end justify-between pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">Saldo atual</p>
                    <p className={cn(
                      'text-base font-bold',
                      c.saldoAtual >= 0 ? 'text-emerald-600' : 'text-red-500',
                    )}>
                      {fmtBRL(c.saldoAtual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400 mb-0.5">Saldo inicial</p>
                    <p className="text-xs text-gray-500">{fmtBRL(c.saldoInicial)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalMsg
        aberto={!!confirmToggle}
        titulo={confirmToggle?.ativo ? 'Desativar carteira' : 'Reativar carteira'}
        descricao={
          confirmToggle?.ativo
            ? `Deseja desativar a carteira de "${confirmToggle.titular}"?`
            : `Deseja reativar a carteira de "${confirmToggle?.titular}"?`
        }
        variante={confirmToggle?.ativo ? 'perigo' : 'info'}
        labelConfirmar={confirmToggle?.ativo ? 'Desativar' : 'Reativar'}
        onConfirmar={handleToggle}
        onCancelar={() => setConfirmToggle(null)}
      />
    </div>
  );
}
