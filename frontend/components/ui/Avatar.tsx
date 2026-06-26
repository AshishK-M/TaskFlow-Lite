import { cn } from '@/lib/cn';
import { getInitials } from '@/utils/getInitials';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

export type AvatarProps = {
  name?: string | null;
  size?: keyof typeof sizes;
  className?: string;
};

const palette = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-fuchsia-500',
];

const colorFor = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
};

export const Avatar = ({ name, size = 'md', className }: AvatarProps) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 select-none',
      sizes[size],
      colorFor(name ?? '?'),
      className,
    )}
    title={name ?? undefined}
  >
    {getInitials(name)}
  </span>
);
