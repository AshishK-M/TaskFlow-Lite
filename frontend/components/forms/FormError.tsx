import { cn } from '@/lib/cn';

export const FormError = ({ message, className }: { message?: string | null; className?: string }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700',
        className,
      )}
    >
      {message}
    </div>
  );
};
