'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type DropdownItem = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
};

export const Dropdown = ({ trigger, items, align = 'right' }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex">
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            'absolute z-20 mt-1 min-w-[10rem] rounded-md border border-slate-200 bg-white shadow-lg py-1',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed',
                item.destructive ? 'text-rose-700 hover:bg-rose-50' : 'text-slate-700',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
