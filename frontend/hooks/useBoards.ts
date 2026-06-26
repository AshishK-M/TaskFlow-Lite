'use client';

import { useCallback } from 'react';
import { boardService } from '@/services/board.service';
import type { CreateBoardInput } from '@/types/board';
import { useAsyncResource } from './useAsyncResource';

export const useBoards = () => {
  const resource = useAsyncResource(() => boardService.list(), []);

  const create = useCallback(
    async (input: CreateBoardInput) => {
      const created = await boardService.create(input);
      resource.setData((prev) => (prev ? [created, ...prev] : [created]));
      return created;
    },
    [resource],
  );

  const remove = useCallback(
    async (id: string) => {
      await boardService.remove(id);
      resource.setData((prev) => prev?.filter((b) => b.id !== id) ?? null);
    },
    [resource],
  );

  return { ...resource, create, remove };
};
