import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Search, Gauge, LayersPlus, Briefcase, Package,
  CircleDollarSign, DraftingCompass, Factory, SlidersHorizontal, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERMISSION_SECTIONS, ALL_PERMISSION_VALUES, type PermissionGroup } from '@/lib/permissions';

interface PermissionMatrixProps {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  'Geral': Gauge,
  'Cadastros Básicos': LayersPlus,
  'Cadastros Avançados': LayersPlus,
  'Comercial': Briefcase,
  'Estoque': Package,
  'Financeiro': CircleDollarSign,
  'Engenharia': DraftingCompass,
  'Produção': Factory,
  'Sistema': SlidersHorizontal,
};

function groupMatchesSearch(group: PermissionGroup, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (group.label.toLowerCase().includes(q)) return true;
  return group.actions.some(a => a.label.toLowerCase().includes(q));
}

export function PermissionMatrix({ selected, onChange, disabled }: PermissionMatrixProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const totalPct = ALL_PERMISSION_VALUES.length === 0 ? 0 : Math.round((selected.length / ALL_PERMISSION_VALUES.length) * 100);

  const toggleValue = (value: string) => {
    if (disabled) return;
    const next = selectedSet.has(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const toggleGroup = (group: PermissionGroup, checkAll: boolean) => {
    if (disabled) return;
    const groupValues = group.actions.map(a => a.value);
    const next = checkAll
      ? Array.from(new Set([...selected, ...groupValues]))
      : selected.filter(v => !groupValues.includes(v));
    onChange(next);
  };

  const selectAll = () => !disabled && onChange([...ALL_PERMISSION_VALUES]);
  const clearAll = () => !disabled && onChange([]);

  const toggleCollapsed = (sectionLabel: string) =>
    setCollapsed(prev => ({ ...prev, [sectionLabel]: !prev[sectionLabel] }));

  const visibleSections = PERMISSION_SECTIONS
    .map(section => ({
      ...section,
      groups: section.groups.filter(g => groupMatchesSearch(g, search)),
    }))
    .filter(s => s.groups.length > 0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar permissão…"
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1D4E89] placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums">
              {selected.length} de {ALL_PERMISSION_VALUES.length} selecionadas
            </span>
            {!disabled && (
              <>
                <button type="button" onClick={selectAll}
                  className="text-xs font-medium text-[#1D4E89] hover:underline whitespace-nowrap">
                  Marcar todos
                </button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={clearAll}
                  className="text-xs font-medium text-gray-500 hover:underline whitespace-nowrap">
                  Limpar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Barra de progresso geral */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', totalPct === 100 ? 'bg-emerald-500' : 'bg-[#1D4E89]')}
              initial={false}
              animate={{ width: `${totalPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] font-medium text-gray-400 tabular-nums w-8 text-right">{totalPct}%</span>
        </div>
      </div>

      {/* Sections */}
      <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100">
        {visibleSections.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">Nenhuma permissão encontrada.</p>
        ) : visibleSections.map(section => {
          const isCollapsed = collapsed[section.label] && !search;
          const sectionValues = section.groups.flatMap(g => g.actions.map(a => a.value));
          const sectionSelectedCount = sectionValues.filter(v => selectedSet.has(v)).length;
          const sectionPct = sectionValues.length === 0 ? 0 : Math.round((sectionSelectedCount / sectionValues.length) * 100);
          const SectionIcon = SECTION_ICONS[section.label] ?? ShieldCheck;

          return (
            <div key={section.label}>
              <button
                type="button"
                onClick={() => toggleCollapsed(section.label)}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-colors',
                  sectionSelectedCount > 0 ? 'bg-blue-50 text-[#1D4E89]' : 'bg-gray-100 text-gray-400',
                )}>
                  <SectionIcon size={13} />
                </span>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{section.label}</span>
                <div className="hidden sm:block flex-1 h-1 rounded-full bg-gray-100 overflow-hidden max-w-[120px]">
                  <motion.div
                    className={cn('h-full rounded-full', sectionPct === 100 ? 'bg-emerald-400' : 'bg-blue-300')}
                    initial={false}
                    animate={{ width: `${sectionPct}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <span className="flex items-center gap-2 ml-auto shrink-0">
                  <span className="text-[11px] text-gray-400 tabular-nums">{sectionSelectedCount}/{sectionValues.length}</span>
                  <ChevronDown size={14} className={cn('text-gray-400 transition-transform duration-200', !isCollapsed && 'rotate-180')} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden bg-white"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 px-4 pb-4 pt-1">
                      {section.groups.map(group => {
                        const groupValues = group.actions.map(a => a.value);
                        const groupSelectedCount = groupValues.filter(v => selectedSet.has(v)).length;
                        const allChecked = groupSelectedCount === groupValues.length;
                        const someChecked = groupSelectedCount > 0 && !allChecked;

                        return (
                          <motion.div
                            key={group.key}
                            whileHover={disabled ? undefined : { y: -2 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              'border rounded-lg p-3 transition-shadow',
                              allChecked ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white',
                              !disabled && 'hover:shadow-md hover:border-gray-300',
                            )}
                          >
                            <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={allChecked}
                                ref={el => { if (el) el.indeterminate = someChecked; }}
                                disabled={disabled}
                                onChange={e => toggleGroup(group, e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-[#1D4E89] focus:ring-[#1D4E89] shrink-0"
                              />
                              <span className="text-[13px] font-medium text-gray-700 flex-1 truncate">{group.label}</span>
                              <span className="text-[10px] text-gray-400 shrink-0 tabular-nums">{groupSelectedCount}/{groupValues.length}</span>
                            </label>
                            <div className="flex flex-wrap gap-x-3 gap-y-1.5 pl-5">
                              {group.actions.map(action => (
                                <label key={action.value} className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={selectedSet.has(action.value)}
                                    disabled={disabled}
                                    onChange={() => toggleValue(action.value)}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#1D4E89] focus:ring-[#1D4E89]"
                                  />
                                  <span className="text-xs text-gray-600">{action.label}</span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
