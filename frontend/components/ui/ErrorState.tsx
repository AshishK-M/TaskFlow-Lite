import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
};

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  action,
  className,
}: ErrorStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center rounded-xl border border-rose-200 bg-rose-50/40 px-6 py-12',
      className,
    )}
  >
    <h3 className="text-base font-semibold text-rose-900">{title}</h3>
    {message && <p className="mt-1 text-sm text-rose-700 max-w-md">{message}</p>}
    <div className="mt-4 flex gap-2">
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
      {action}
    </div>
  </div>
);
