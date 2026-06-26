'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  variant: ToastVariant;
  message: string;
};

export type ToastViewportProps = {
  items: ToastItem[];
  onDismiss: (id: string) => void;
};

const variantClass: Record<ToastVariant, string> = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-900',
};

export const ToastViewport = ({ items, onDismiss }: ToastViewportProps) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    {items.map((toast) => (
      <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
    ))}
  </div>
);

const ToastCard = ({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) => {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg min-w-[16rem] max-w-sm',
        variantClass[toast.variant],
      )}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-white/80 hover:text-white"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};
