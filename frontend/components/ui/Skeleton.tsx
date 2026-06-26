import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Skeleton = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('animate-pulse rounded bg-slate-200', className)} {...rest} />
);

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
    <Skeleton className="h-5 w-1/2" />
    <SkeletonText lines={2} />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);
