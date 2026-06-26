import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: string;
};

export const Badge = ({ tone, className, ...rest }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
      tone ?? 'bg-slate-100 text-slate-700 border-slate-200',
      className,
    )}
    {...rest}
  />
);
