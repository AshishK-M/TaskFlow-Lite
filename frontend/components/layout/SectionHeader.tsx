import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type SectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const SectionHeader = ({ title, description, action, className }: SectionHeaderProps) => (
  <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
    <div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
