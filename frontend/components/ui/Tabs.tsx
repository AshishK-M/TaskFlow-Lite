'use client';

import { cn } from '@/lib/cn';

export type TabItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

export type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export const Tabs = <T extends string>({ items, value, onChange, className }: TabsProps<T>) => (
  <div className={cn('border-b border-slate-200', className)}>
    <nav className="-mb-px flex gap-4">
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-1 py-3 text-sm border-b-2 transition-colors',
              active
                ? 'border-brand-600 text-brand-700 font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  active ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  </div>
);
