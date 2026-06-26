'use client';

import { BoardCard } from '@/components/boards/BoardCard';
import { BoardFormModal } from '@/components/boards/BoardFormModal';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { MESSAGES } from '@/constants/messages';
import { useApiAction } from '@/hooks/useApiErrorToast';
import { useBoards } from '@/hooks/useBoards';
import { useModal } from '@/hooks/useModal';

export default function BoardsPage() {
  const { data, loading, error, refetch, create } = useBoards();
  const modal = useModal();
  const action = useApiAction();

  const handleCreate = action(
    async (values: { name: string; description?: string }) => create(values),
    { success: MESSAGES.success.boardCreated },
  );

  return (
    <PageContainer>
      <SectionHeader
        title="Your boards"
        description="Switch between projects or spin up a new one."
        action={<Button onClick={() => modal.show()}>New board</Button>}
      />

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={() => void refetch()} />
      )}

      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="No boards yet"
          description={MESSAGES.empty.boards}
          action={<Button onClick={() => modal.show()}>Create your first board</Button>}
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      <BoardFormModal
        open={modal.open}
        onClose={modal.hide}
        title="Create a board"
        description="Boards group your tasks and team members."
        submitLabel="Create board"
        onSubmit={async (values) => {
          await handleCreate(values);
        }}
      />
    </PageContainer>
  );
}
