'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { TASK_STATUS, TASK_STATUS_VALUES, type TaskStatus } from '@/constants/status';
import { MESSAGES } from '@/constants/messages';
import type { Role } from '@/constants/roles';
import { useApiAction } from '@/hooks/useApiErrorToast';
import { useModal } from '@/hooks/useModal';
import { usePermissions } from '@/hooks/usePermissions';
import { useTasks } from '@/hooks/useTasks';
import type { Member } from '@/types/member';
import type { Task } from '@/types/task';
import { StatusFilter } from './StatusFilter';
import { TaskBoard } from './TaskBoard';
import { TaskFormModal } from './TaskFormModal';
import type { TaskFormValues } from './taskSchema';

const normalizeFormValues = (values: TaskFormValues) => ({
  title: values.title.trim(),
  description: values.description?.trim() || undefined,
  status: values.status as TaskStatus,
  priority: values.priority as Task['priority'],
  assigneeId: values.assigneeId || null,
  dueDate: values.dueDate || null,
});

const ALL_STATUSES = new Set<TaskStatus>(TASK_STATUS_VALUES);

export type BoardTasksPanelProps = {
  boardId: string;
  role: Role;
  members: Member[];
};

export const BoardTasksPanel = ({ boardId, role, members }: BoardTasksPanelProps) => {
  const { data, loading, error, refetch, create, update, remove, moveTask } = useTasks(boardId);
  const action = useApiAction();
  const can = usePermissions(role);

  const createModal = useModal();
  const editModal = useModal<Task>();
  const deleteModal = useModal<Task>();
  const [visibleStatuses, setVisibleStatuses] = useState<Set<TaskStatus>>(ALL_STATUSES);

  const handleCreate = action(
    async (values: TaskFormValues) => create(normalizeFormValues(values)),
    { success: MESSAGES.success.taskCreated },
  );
  const handleUpdate = action(
    async (taskId: string, values: TaskFormValues) => update(taskId, normalizeFormValues(values)),
    { success: MESSAGES.success.taskUpdated },
  );
  const handleRemove = action(async (taskId: string) => remove(taskId), {
    success: MESSAGES.success.taskDeleted,
  });
  const handleMove = action(async (task: Task, status: TaskStatus) => moveTask(task.id, status));

  const editingTask = editModal.data;
  const deletingTask = deleteModal.data;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      );
    }
    if (error) return <ErrorState message={error} onRetry={() => void refetch()} />;
    if (!data || data.length === 0) {
      return (
        <EmptyState
          title="No tasks yet"
          description={MESSAGES.empty.tasks}
          action={
            can.createTask() ? (
              <Button onClick={() => createModal.show()}>Create task</Button>
            ) : undefined
          }
        />
      );
    }
    const filtered = data.filter((t) => visibleStatuses.has(t.status));
    const canEdit = can.updateTask();
    const canDelete = can.deleteTask();
    return (
      <TaskBoard
        tasks={filtered}
        visibleStatuses={visibleStatuses}
        cardProps={{
          onEdit: (task) => {
            if (canEdit) editModal.show(task);
          },
          onDelete: (task) => {
            if (canDelete) deleteModal.show(task);
          },
          onMove: (task, status) => {
            if (canEdit) void handleMove(task, status);
          },
          canEdit: () => canEdit,
          canDelete: () => canDelete,
          canMove: () => canEdit,
        }}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusFilter value={visibleStatuses} onChange={setVisibleStatuses} />
        {can.createTask() && <Button onClick={() => createModal.show()}>New task</Button>}
      </div>

      {renderContent()}

      <TaskFormModal
        open={createModal.open}
        onClose={createModal.hide}
        title="New task"
        submitLabel="Create"
        members={members}
        defaultValues={{ status: TASK_STATUS.TODO }}
        onSubmit={async (values) => {
          await handleCreate(values);
        }}
      />

      <TaskFormModal
        open={editModal.open}
        onClose={editModal.hide}
        title="Edit task"
        submitLabel="Save"
        members={members}
        defaultValues={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description ?? '',
                status: editingTask.status,
                priority: editingTask.priority,
                assigneeId: editingTask.assigneeId ?? '',
                dueDate: editingTask.dueDate ?? '',
              }
            : undefined
        }
        onSubmit={async (values) => {
          if (!editingTask) return;
          await handleUpdate(editingTask.id, values);
        }}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Delete task"
        description={
          deletingTask ? (
            <>
              Are you sure you want to delete <strong>{deletingTask.title}</strong>? This action
              cannot be undone.
            </>
          ) : null
        }
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletingTask) await handleRemove(deletingTask.id);
        }}
        onClose={deleteModal.hide}
      />
    </div>
  );
};
