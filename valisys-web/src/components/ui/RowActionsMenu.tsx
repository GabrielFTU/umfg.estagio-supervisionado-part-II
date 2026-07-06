import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RowActionsMenuProps {
  children: (close: () => void) => React.ReactNode;
  menuClassName?: string;
  buttonClassName?: string;
}

const VIEWPORT_MARGIN = 8;

export function RowActionsMenu({ children, menuClassName, buttonClassName }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useLayoutEffect(() => {
    if (!open || !btnRef.current || !menuRef.current) return;
    const btn  = btnRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();

    let top = btn.bottom + 4;
    if (top + menu.height > window.innerHeight - VIEWPORT_MARGIN) {
      top = btn.top - menu.height - 4;
    }
    top = Math.min(Math.max(top, VIEWPORT_MARGIN), window.innerHeight - menu.height - VIEWPORT_MARGIN);

    let left = btn.right - menu.width;
    left = Math.min(Math.max(left, VIEWPORT_MARGIN), window.innerWidth - menu.width - VIEWPORT_MARGIN);

    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
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
        onClick={() => setOpen(v => !v)}
        className={cn(
          'p-1.5 rounded-md transition-colors',
          open ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
          buttonClassName,
        )}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, visibility: pos ? 'visible' : 'hidden', zIndex: 9999 }}
          className={cn('w-36 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/[0.07] py-0.5 text-[13px]', menuClassName)}
        >
          {children(close)}
        </div>
      )}
    </>
  );
}
