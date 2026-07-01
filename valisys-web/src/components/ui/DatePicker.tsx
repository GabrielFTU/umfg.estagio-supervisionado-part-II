import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseIso(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function fmtDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

type Cell = { day: number; iso: string; month: 'prev' | 'curr' | 'next' };

function buildCells(year: number, month: number): Cell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: Cell[] = [];

  const prevM = month === 0 ? 11 : month - 1;
  const prevY = month === 0 ? year - 1 : year;
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, iso: toIso(new Date(prevY, prevM, d)), month: 'prev' });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: toIso(new Date(year, month, d)), month: 'curr' });
  }

  const nextM = month === 11 ? 0 : month + 1;
  const nextY = month === 11 ? year + 1 : year;
  let nd = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nd, iso: toIso(new Date(nextY, nextM, nd)), month: 'next' });
    nd++;
  }

  return cells;
}

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export function DatePicker({ value, onChange, disabled, error, placeholder = 'dd/mm/aaaa' }: DatePickerProps) {
  const today = new Date();
  const todayIso = toIso(today);
  const parsed = parseIso(value);

  const [open, setOpen]         = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (popupRef.current?.contains(e.target as Node)) return;
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const handleOpen = () => {
    if (disabled) return;
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      const PW = 256, PH = 300;
      let left = r.left;
      if (left + PW > window.innerWidth - 8) left = window.innerWidth - PW - 8;
      const top = window.innerHeight - r.bottom >= PH ? r.bottom + 4 : r.top - PH - 4;
      setPos({ top, left });
    }
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
    setOpen(v => !v);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = buildCells(viewYear, viewMonth);

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'flex items-center h-9 border-b transition-colors',
          error  ? 'border-red-400'
          : open  ? 'border-[#1D4E89]'
          : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50',
        )}
      >
        <input
          readOnly
          value={fmtDisplay(value)}
          placeholder={placeholder}
          disabled={disabled}
          onClick={handleOpen}
          className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none placeholder:text-gray-300 text-gray-700 cursor-pointer"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          tabIndex={-1}
          className={cn(
            'shrink-0 p-1 transition-colors',
            open ? 'text-[#1D4E89]' : 'text-gray-300 hover:text-gray-500',
          )}
        >
          <Calendar size={13} />
        </button>
      </div>

      {open && (
        <div
          ref={popupRef}
          onMouseDown={e => e.stopPropagation()}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 p-3"
        >
          {/* Header: nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <ChevronLeft size={14} />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-800">{MONTHS_PT[viewMonth]}</span>
              <span className="text-sm font-semibold text-[#1D4E89]">{viewYear}</span>
            </div>

            <button type="button" onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_PT.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-0.5 uppercase tracking-wide">
                {d.slice(0, 1)}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell, i) => {
              const isSelected = cell.iso === value;
              const isToday    = cell.iso === todayIso;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(cell.iso); setOpen(false); }}
                  className={cn(
                    'h-8 w-full flex items-center justify-center rounded-full text-[13px] transition-colors relative',
                    cell.month !== 'curr'      && 'text-gray-300 hover:bg-gray-50',
                    cell.month === 'curr' && !isSelected && !isToday && 'text-gray-700 hover:bg-gray-100',
                    isToday  && !isSelected    && 'text-[#1D4E89] font-bold',
                    isSelected                 && 'bg-[#1D4E89] text-white font-semibold shadow-sm',
                  )}
                >
                  {cell.day}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1D4E89]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => { onChange(todayIso); setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setOpen(false); }}
              className="text-[11px] text-[#1D4E89] hover:text-[#163D6D] font-medium transition-colors"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </>
  );
}
