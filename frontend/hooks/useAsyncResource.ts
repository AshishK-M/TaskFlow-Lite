'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncResource<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (updater: T | ((prev: T | null) => T | null)) => void;
};

/**
 * Generic resource hook: tracks loading/error, supports refetch, and exposes
 * setData for optimistic updates. The fetcher should be stable (memoised by the
 * caller) — useAsyncResource will re-fetch whenever the fetcher reference or
 * any deps change.
 */
export const useAsyncResource = <T,>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  options: { enabled?: boolean } = {},
): AsyncResource<T> => {
  const { enabled = true } = options;
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  // Track the latest call so stale responses are ignored.
  const callIdRef = useRef(0);

  const run = useCallback(async () => {
    if (!enabled) return;
    const id = ++callIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (callIdRef.current === id) setDataState(result);
    } catch (err) {
      if (callIdRef.current === id) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      if (callIdRef.current === id) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    void run();
  }, [run]);

  const setData = useCallback((updater: T | ((prev: T | null) => T | null)) => {
    setDataState((prev) =>
      typeof updater === 'function' ? (updater as (p: T | null) => T | null)(prev) : updater,
    );
  }, []);

  return { data, loading, error, refetch: run, setData };
};
