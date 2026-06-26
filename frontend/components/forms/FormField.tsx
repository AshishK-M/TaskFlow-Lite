import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type FormFieldProps = {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

export const FormField = ({ label, htmlFor, required, error, hint, className, children }: FormFieldProps) => (
  <div className={cn('space-y-1.5', className)}>
    {label && (
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-xs text-rose-600">{error}</p>
    ) : hint ? (
      <p className="text-xs text-slate-500">{hint}</p>
    ) : null}
  </div>
);
