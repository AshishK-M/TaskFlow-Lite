'use client';

import { useCallback } from 'react';
import { taskService } from '@/services/task.service';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/types/task';
import { useAsyncResource } from './useAsyncResource';

export const useTasks = (boardId: string) => {
  const resource = useAsyncResource(() => taskService.list(boardId), [boardId]);

  const create = useCallback(
    async (input: CreateTaskInput) => {
      const created = await taskService.create(boardId, input);
      resource.setData((prev) => (prev ? [...prev, created] : [created]));
      return created;
    },
    [boardId, resource],
  );

  const update = useCallback(
    async (taskId: string, input: UpdateTaskInput) => {
      const updated = await taskService.update(boardId, taskId, input);
      resource.setData((prev) =>
        prev?.map((t) => (t.id === taskId ? updated : t)) ?? null,
      );
      return updated;
    },
    [boardId, resource],
  );

  const remove = useCallback(
    async (taskId: string) => {
      await taskService.remove(boardId, taskId);
      resource.setData((prev) => prev?.filter((t) => t.id !== taskId) ?? null);
    },
    [boardId, resource],
  );

  const moveTask = useCallback(
    (taskId: string, status: Task['status']) => update(taskId, { status }),
    [update],
  );

  return { ...resource, create, update, remove, moveTask };
};
