'use client';

import { useCallback } from 'react';
import { boardService } from '@/services/board.service';
import type { UpdateBoardInput } from '@/types/board';
import { useAsyncResource } from './useAsyncResource';

export const useBoard = (boardId: string) => {
  const resource = useAsyncResource(() => boardService.get(boardId), [boardId]);

  const update = useCallback(
    async (input: UpdateBoardInput) => {
      const updated = await boardService.update(boardId, input);
      resource.setData((prev) => (prev ? { ...prev, ...updated } : prev));
      return updated;
    },
    [boardId, resource],
  );

  return { ...resource, update };
};
