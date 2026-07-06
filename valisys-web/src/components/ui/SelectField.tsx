import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({ label, required, value, onChange, options, placeholder, readOnly, disabled, error }: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  }, [query, options]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={wrapRef} className={cn(
      'relative border-b py-1.5 transition-colors',
      open ? 'border-[#1D4E89]' : error ? 'border-red-400' : 'border-gray-300',
    )}>
      <label className={cn('block text-xs mb-1', error ? 'text-red-500' : 'text-gray-500')}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {readOnly ? (
        <p className="text-sm text-gray-700 h-9 flex items-center">{selected?.label || '—'}</p>
      ) : (
        <>
          <button type="button" disabled={disabled}
            onClick={() => { if (disabled) return; setOpen(v => !v); setQuery(''); }}
            className={cn(
              'w-full h-9 flex items-center justify-between text-left focus:outline-none',
              disabled && 'cursor-not-allowed opacity-50',
            )}>
            <span className={cn('text-sm truncate', value ? 'text-gray-700' : 'text-gray-300')}>
              {selected?.label || placeholder || 'Selecione…'}
            </span>
            <ChevronDown size={14} className={cn('text-gray-400 transition-transform shrink-0', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
              style={{ maxHeight: 220 }}>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 sticky top-0 bg-white">
                <Search size={12} className="text-gray-400 shrink-0" />
                <input autoFocus className="flex-1 text-sm outline-none placeholder:text-gray-300 bg-transparent"
                  placeholder="Buscar…" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 170 }}>
                {filtered.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-gray-400 text-center">Nenhum resultado</p>
                ) : filtered.map(o => (
                  <button key={o.value} type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors border-b border-gray-50 last:border-0',
                      o.value === value ? 'bg-blue-50 text-[#1D4E89] font-medium' : 'text-gray-700 hover:bg-gray-50',
                    )}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
