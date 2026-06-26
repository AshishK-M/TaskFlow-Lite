import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const PageContainer = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6', className)} {...rest} />
);
