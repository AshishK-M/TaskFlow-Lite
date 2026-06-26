'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BoardFormModal } from '@/components/boards/BoardFormModal';
import { BoardHeader } from '@/components/boards/BoardHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { BoardMembersPanel } from '@/components/members/BoardMembersPanel';
import { BoardTasksPanel } from '@/components/tasks/BoardTasksPanel';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { MESSAGES } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { useApiAction } from '@/hooks/useApiErrorToast';
import { useBoard } from '@/hooks/useBoard';
import { useModal } from '@/hooks/useModal';
import { usePermissions } from '@/hooks/usePermissions';
import { boardService } from '@/services/board.service';
import type { Member } from '@/types/member';

type Tab = 'tasks' | 'members';

export default function BoardDetailPage({ params }: { params: { id: string } }) {
  const boardId = params.id;
  const router = useRouter();
  const { data: board, loading, error, refetch, update, setData } = useBoard(boardId);
  const can = usePermissions(board?.role ?? null);
  const action = useApiAction();

  const [tab, setTab] = useState<Tab>('tasks');
  const editModal = useModal();
  const deleteModal = useModal();

  const handleEdit = action(
    async (values: { name: string; description?: string }) =>
      update({ name: values.name, description: values.description || undefined }),
    { success: MESSAGES.success.boardUpdated },
  );

  const handleDelete = action(
    async () => {
      await boardService.remove(boardId);
      router.replace(ROUTES.boards);
    },
    { success: MESSAGES.success.boardDeleted },
  );

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-1/3 mb-3" />
        <Skeleton className="h-4 w-2/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }
  if (error || !board) {
    return (
      <PageContainer>
        <ErrorState
          title="Could not load this board"
          message={error ?? 'Board not found'}
          onRetry={() => void refetch()}
        />
      </PageContainer>
    );
  }

  const tabs: TabItem<Tab>[] = [
    { value: 'tasks', label: 'Tasks', count: board._count.tasks },
    { value: 'members', label: 'Members', count: board.members.length },
  ];

  const onMembersChange = (members: Member[]) => {
    setData((prev) =>
      prev ? { ...prev, members, _count: { ...prev._count, members: members.length } } : prev,
    );
  };

  return (
    <PageContainer>
      <BoardHeader
        board={board}
        canEdit={can.updateBoard()}
        canDelete={can.deleteBoard()}
        onEdit={() => editModal.show()}
        onDelete={() => deleteModal.show()}
      />

      <Tabs items={tabs} value={tab} onChange={setTab} className="mb-5" />

      {tab === 'tasks' && (
        <BoardTasksPanel boardId={boardId} role={board.role} members={board.members} />
      )}
      {tab === 'members' && (
        <BoardMembersPanel
          boardId={boardId}
          role={board.role}
          initialMembers={board.members}
          onMembersChange={onMembersChange}
        />
      )}

      <BoardFormModal
        open={editModal.open}
        onClose={editModal.hide}
        title="Edit board"
        submitLabel="Save changes"
        defaultValues={{ name: board.name, description: board.description ?? '' }}
        onSubmit={async (values) => {
          await handleEdit(values);
        }}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Delete board"
        description={
          <>
            Permanently delete <strong>{board.name}</strong>? All tasks and members will be removed.
          </>
        }
        destructive
        confirmLabel="Delete board"
        onConfirm={async () => {
          await handleDelete();
        }}
        onClose={deleteModal.hide}
      />
    </PageContainer>
  );
}
