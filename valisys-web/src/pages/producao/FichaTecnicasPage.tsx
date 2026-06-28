import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Loader2, MoreHorizontal, FileText,
  Home, ChevronRight, SlidersHorizontal, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ModalMsg } from '@/components/ui/ModalMsg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FichaTecnicaItem {
  id: string;
  produtoId: string;
  produtoCodigo: string;
  produtoNome: string;
  codigo: string;
  versao: string;
  ativa: boolean;
}

// ─── RowMenu ──────────────────────────────────────────────────────────────────

function RowMenu({ ativa, onView, onInativar }: {
  ativa: boolean;
  onView: () => void; onInativar: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef  = useRef<HTMLButtonElement>(null);
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
    const close = () => setOpen(false);
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current  && !btnRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', h);
    document.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('scroll', close, true); };
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-0.5 text-[13px]">
          <button onClick={() => { setOpen(false); onView(); }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100">
            Visualizar / Editar
          </button>
          <div className="my-0.5 mx-2 border-t border-gray-200" />
          {ativa && (
            <button onClick={() => { setOpen(false); onInativar(); }}
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50">
              Inativar
            </button>
          )}
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FichaTecnicasPage() {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [fichas, setFichas]         = useState<FichaTecnicaItem[]>([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filtroAtiva, setFiltroAtiva] = useState<boolean | null>(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmTarget, setConfirmTarget] = useState<FichaTecnicaItem | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterOpen]);

  const load = async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/fichas-tecnicas', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403) { setFichas([]); return; }
      if (!res.ok) throw new Error();
      setFichas(await res.json());
    } catch { setError('Não foi possível carregar as fichas técnicas.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => fichas.filter(f => {
    if (filtroAtiva !== null && f.ativa !== filtroAtiva) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.produtoNome.toLowerCase().includes(q) && !f.produtoCodigo.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [fichas, search, filtroAtiva]);

  const handleInativar = (f: FichaTecnicaItem) => { setConfirmTarget(f); };

  const execInativar = async () => {
    if (!confirmTarget) return;
    const f = confirmTarget;
    setConfirmTarget(null);
    const token = localStorage.getItem('token');
    await fetch(`/api/fichas-tecnicas/${f.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    showToast('Ficha técnica inativada');
    load();
  };

  const activeFilters = (filtroAtiva !== true ? 1 : 0);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Breadcrumb */}
      <div className="shrink-0 px-6 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Home size={11} /><ChevronRight size={11} />
          <span>Produção</span><ChevronRight size={11} />
          <span className="text-gray-800 font-semibold">Ficha Técnica</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full h-9 pl-6 pr-3 text-sm bg-transparent border-b border-gray-400 focus:border-blue-600 focus:outline-none transition-colors placeholder:text-gray-400 text-gray-800"
            placeholder="Buscar por código ou nome"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button onClick={() => navigate('/producao/fichas-tecnicas/novo')}
          className="flex items-center gap-1.5 h-9 px-5 rounded-full bg-[#F59E0B] text-white text-sm font-semibold hover:bg-amber-500 transition-colors shrink-0">
          <Plus size={14} /> Novo
        </button>

        <div className="ml-auto" ref={filterRef}>
          <div className="relative">
            <button onClick={() => setFilterOpen(v => !v)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-semibold transition-colors',
                activeFilters > 0
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50',
              )}>
              <SlidersHorizontal size={13} />
              Filtros
              {activeFilters > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">
                  {activeFilters}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute z-40 right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-800">Filtros</span>
                  <button onClick={() => setFilterOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={14} /></button>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Status</p>
                  {([{ label: 'Todas', value: null }, { label: 'Ativas', value: true }, { label: 'Inativas', value: false }] as const).map(opt => (
                    <button key={String(opt.value)} onClick={() => { setFiltroAtiva(opt.value); setFilterOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors',
                        filtroAtiva === opt.value
                          ? 'border-blue-400 bg-blue-50 text-blue-800 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300',
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-gray-600 text-sm">
            <Loader2 size={16} className="animate-spin" /> Carregando…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={load} className="text-xs text-blue-600 hover:underline font-medium">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16 text-center">
            <FileText size={36} className="text-gray-300" />
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {search ? 'Nenhum resultado encontrado' : 'Nenhuma ficha técnica cadastrada'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {search ? 'Ajuste a busca.' : 'Clique em "Novo" para criar a primeira ficha técnica.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pl-6 pr-4 w-40">Código ↑↓</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4">Nome ↑↓</th>
                <th className="text-left text-xs font-semibold text-gray-600 py-3 pr-4 w-36">Pendências</th>
                <th className="w-10 pr-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}
                  onClick={() => navigate(`/producao/fichas-tecnicas/${f.id}`)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="py-3 pl-6 pr-4 text-sm font-mono text-gray-700">{f.produtoCodigo}</td>
                  <td className="py-3 pr-4 text-sm text-gray-800">{f.produtoNome}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer">NÃO</span>
                  </td>
                  <td className="py-3 pr-4 text-right" onClick={e => e.stopPropagation()}>
                    <RowMenu ativa={f.ativa}
                      onView={() => navigate(`/producao/fichas-tecnicas/${f.id}`)}
                      onInativar={() => handleInativar(f)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && (
        <div className="shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-xs font-semibold text-gray-700">
            {filtered.length} {filtered.length === 1 ? 'ficha' : 'fichas'}
            {filtered.length !== fichas.length && <span className="font-normal text-gray-500"> de {fichas.length} total</span>}
          </span>
        </div>
      )}

      <ModalMsg
        aberto={confirmTarget !== null}
        titulo="Inativar ficha técnica"
        descricao={confirmTarget ? `Inativar a ficha técnica do produto "${confirmTarget.produtoNome}"?` : ''}
        variante="perigo"
        onConfirmar={execInativar}
        onCancelar={() => setConfirmTarget(null)}
      />
    </div>
  );
}
