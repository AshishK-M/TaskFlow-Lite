import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export const EmptyState = ({ title, description, action, icon, className }: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12',
      className,
    )}
  >
    {icon && <div className="mb-3 text-slate-400">{icon}</div>}
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-1 text-sm text-slate-500 max-w-md">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
