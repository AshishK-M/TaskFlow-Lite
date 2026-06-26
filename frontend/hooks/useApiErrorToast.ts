'use client';

import { useCallback } from 'react';
import { MESSAGES } from '@/constants/messages';
import { useToast } from './useToast';

/**
 * Wraps an async action: shows a success toast on resolve and an error toast
 * derived from the rejected value's `.message`. Returns the wrapped function.
 */
export const useApiAction = () => {
  const toast = useToast();

  return useCallback(
    <Args extends unknown[], Result>(
      fn: (...args: Args) => Promise<Result>,
      opts: { success?: string; onError?: (err: unknown) => void } = {},
    ) =>
      async (...args: Args): Promise<Result | undefined> => {
        try {
          const result = await fn(...args);
          if (opts.success) toast.success(opts.success);
          return result;
        } catch (err) {
          const message = err instanceof Error ? err.message : MESSAGES.errors.generic;
          toast.error(message);
          opts.onError?.(err);
          return undefined;
        }
      },
    [toast],
  );
};
