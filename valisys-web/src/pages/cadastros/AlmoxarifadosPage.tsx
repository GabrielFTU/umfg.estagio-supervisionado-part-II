import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, SlidersHorizontal, Warehouse,
  ChevronRight, Home, Loader2, MoreHorizontal, MapPin, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AlmoxarifadoItem = {
  id: string;
  nome: string;
  descricao: string | null;
  localizacao: string;
  responsavel: string;
  contato: string | null;
  email: string | null;
  ativo: boolean;
};

function RowMenu({ ativo, onEdit, onView, onToggleAtivo }: {
  ativo: boolean;
  onEdit: () => void;
  onView: () => void;
  onToggleAtivo: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen(v => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onMouseDown={e => e.stopPropagation()}
        onClick={handleToggle}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          open ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
        )}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/[0.07] py-0.5 text-[13px]"
        >
          <button
            onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Visualizar
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Editar
          </button>
          <div className="my-0.5 mx-2 border-t border-gray-100" />
          <button
            onClick={() => { setOpen(false); onToggleAtivo(); }}
            className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors"
          >
            {ativo ? 'Desativar' : 'Reativar'}
          </button>
        </div>
      )}
    </>
  );
}

export function AlmoxarifadosPage() {
  const navigate = useNavigate();
  const [search, setSearch]               = useState('');
  const [almoxarifados, setAlmoxarifados] = useState<AlmoxarifadoItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [filterOpen, setFilterOpen]       = useState(false);
  const [filtroStatus, setFiltroStatus]   = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/Almoxarifado', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) { setAlmoxarifados([]); return; }
      if (!res.ok) throw new Error();
      const data: any[] = await res.json();
      const lista: AlmoxarifadoItem[] = data.map(a => ({
        id:          a.id,
        nome:        a.nome,
        descricao:   a.descricao ?? null,
        localizacao: a.localizacao,
        responsavel: a.responsavel,
        contato:     a.contato ?? null,
        email:       a.email ?? null,
        ativo:       a.ativo,
      }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      setAlmoxarifados(lista);
    } catch {
      setError('Não foi possível carregar os almoxarifados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleAtivo = async (a: AlmoxarifadoItem) => {
    const acao = a.ativo ? 'Desativar' : 'Reativar';
    if (!confirm(`${acao} o almoxarifado "${a.nome}"?`)) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/Almoxarifado/${a.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 409) {
      const body = await res.json().catch(() => ({}));
      alert(body.message ?? 'Este almoxarifado possui depósitos ativos e não pode ser desativado.');
      return;
    }

    load();
  };

  const filtrosAtivos = !!filtroStatus;
  const filtered = almoxarifados.filter(a => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !a.nome.toLowerCase().includes(q) &&
        !a.localizacao.toLowerCase().includes(q) &&
        !a.responsavel.toLowerCase().includes(q)
      ) return false;
    }
    if (filtroStatus === 'ativo'   && !a.ativo) return false;
    if (filtroStatus === 'inativo' &&  a.ativo) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">

      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 bg-white border-b border-gray-200/70">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Home size={11} /><ChevronRight size={11} />
          <span>Cadastros</span><ChevronRight size={11} />
          <span className="text-gray-600 font-medium">Almoxarifados</span>
        </div>
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200/50">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6] transition-all placeholder:text-gray-400"
              placeholder="Buscar por nome, localização ou responsável…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div ref={filterRef} className="relative shrink-0">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3 rounded-md border text-xs font-medium transition-colors',
                filtrosAtivos
                  ? 'bg-blue-50 border-[#3B82F6] text-[#3B82F6]'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400',
              )}
            >
              <SlidersHorizontal size={13} /> Filtros
              {filtrosAtivos && (
                <span className="w-4 h-4 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center">1</span>
              )}
            </button>

            {filterOpen && (
              <div
                onMouseDown={e => e.stopPropagation()}
                className="absolute z-30 top-full right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Status</span>
                  {filtroStatus && (
                    <button onClick={() => setFiltroStatus('')} className="text-[11px] text-red-400 hover:text-red-600">
                      Limpar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {(['ativo', 'inativo'] as const).map(k => (
                    <button
                      key={k}
                      onClick={() => setFiltroStatus(k === filtroStatus ? '' : k)}
                      className={cn('text-xs py-1.5 px-3 rounded-md border text-left transition-colors',
                        filtroStatus === k
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300')}
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/cadastros/almoxarifados/novo')}
            className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563eb] shadow-sm shadow-blue-200 transition-colors sm:ml-auto shrink-0"
          >
            <Plus size={15} /> Novo Almoxarifado
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando almoxarifados…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button onClick={load} className="text-xs text-[#3B82F6] hover:underline">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Warehouse size={28} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search || filtrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhum almoxarifado cadastrado'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || filtrosAtivos ? 'Ajuste os filtros ou a busca.' : 'Clique em "Novo Almoxarifado" para começar.'}
              </p>
            </div>
            {!search && !filtrosAtivos && (
              <button
                onClick={() => navigate('/cadastros/almoxarifados/novo')}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#3B82F6] text-white text-sm hover:bg-[#2563eb] transition-colors"
              >
                <Plus size={14} /> Cadastrar almoxarifado
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pl-4">Nome</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Localização</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Responsável</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-2.5 pr-6">Status</th>
                    <th className="w-10 pr-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr
                      key={a.id}
                      className={cn(
                        'border-b border-gray-50 hover:bg-blue-50/40 transition-colors',
                        !a.ativo && 'opacity-50',
                      )}
                    >
                      <td className="py-3 pl-4 pr-6">
                        <p className="text-gray-700 font-medium">{a.nome}</p>
                        {a.descricao && (
                          <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs truncate">{a.descricao}</p>
                        )}
                      </td>
                      <td className="py-3 pr-6">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={11} className="shrink-0 text-gray-300" />
                          {a.localizacao}
                        </span>
                      </td>
                      <td className="py-3 pr-6">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={11} className="shrink-0 text-gray-300" />
                          {a.responsavel}
                        </span>
                      </td>
                      <td className="py-3 pr-6">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                          a.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500')}>
                          {a.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <RowMenu
                          ativo={a.ativo}
                          onView={() => navigate(`/cadastros/almoxarifados/${a.id}`)}
                          onEdit={() => navigate(`/cadastros/almoxarifados/${a.id}/editar`)}
                          onToggleAtivo={() => handleToggleAtivo(a)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
