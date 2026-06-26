import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Card = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-xl border border-slate-200 bg-white shadow-soft', className)}
    {...rest}
  />
);

export const CardHeader = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 border-b border-slate-100', className)} {...rest} />
);

export const CardBody = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...rest} />
);

export const CardFooter = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 border-t border-slate-100', className)} {...rest} />
);
