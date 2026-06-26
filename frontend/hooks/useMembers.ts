'use client';

import { useCallback } from 'react';
import { memberService } from '@/services/member.service';
import type { AddMemberInput, UpdateMemberInput } from '@/types/member';
import { useAsyncResource } from './useAsyncResource';

export const useMembers = (boardId: string) => {
  const resource = useAsyncResource(() => memberService.list(boardId), [boardId]);

  const add = useCallback(
    async (input: AddMemberInput) => {
      const created = await memberService.add(boardId, input);
      resource.setData((prev) => (prev ? [...prev, created] : [created]));
      return created;
    },
    [boardId, resource],
  );

  const updateRole = useCallback(
    async (memberId: string, input: UpdateMemberInput) => {
      const updated = await memberService.updateRole(boardId, memberId, input);
      resource.setData((prev) =>
        prev?.map((m) => (m.id === memberId ? updated : m)) ?? null,
      );
      return updated;
    },
    [boardId, resource],
  );

  const remove = useCallback(
    async (memberId: string) => {
      await memberService.remove(boardId, memberId);
      resource.setData((prev) => prev?.filter((m) => m.id !== memberId) ?? null);
    },
    [boardId, resource],
  );

  return { ...resource, add, updateRole, remove };
};
