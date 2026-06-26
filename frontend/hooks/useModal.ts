'use client';

import { useCallback, useState } from 'react';

export type UseModalResult<T = void> = {
  open: boolean;
  data: T | null;
  show: (data?: T) => void;
  hide: () => void;
};

export const useModal = <T = void,>(): UseModalResult<T> => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const show = useCallback((d?: T) => {
    setData(d ?? null);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setData(null);
  }, []);

  return { open, data, show, hide };
};
