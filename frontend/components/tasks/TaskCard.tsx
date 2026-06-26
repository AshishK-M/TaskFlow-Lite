'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { TASK_STATUS_LABELS, TASK_STATUS_VALUES, type TaskStatus } from '@/constants/status';
import { formatDate } from '@/utils/formatDate';
import { truncateText } from '@/utils/truncateText';
import type { Task } from '@/types/task';
import { PriorityBadge } from './PriorityBadge';

export type TaskCardActions = {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
  canEdit: (task: Task) => boolean;
  canDelete: (task: Task) => boolean;
  canMove: (task: Task) => boolean;
};

export type TaskCardProps = TaskCardActions & {
  task: Task;
};

export const TaskCard = ({
  task,
  canEdit,
  canDelete,
  canMove,
  onEdit,
  onDelete,
  onMove,
}: TaskCardProps) => {
  const editable = canEdit(task);
  const deletable = canDelete(task);
  const movable = canMove(task);

  const moveItems = movable
    ? TASK_STATUS_VALUES.filter((s) => s !== task.status).map((status) => ({
        label: `Move to ${TASK_STATUS_LABELS[status]}`,
        onClick: () => onMove(task, status),
      }))
    : [];

  const menuItems = [
    ...moveItems,
    ...(editable ? [{ label: 'Edit', onClick: () => onEdit(task) }] : []),
    ...(deletable
      ? [{ label: 'Delete', destructive: true, onClick: () => onDelete(task) }]
      : []),
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => editable && onEdit(task)}
          className="text-left flex-1 font-medium text-sm text-slate-900 hover:text-brand-700 disabled:cursor-default disabled:hover:text-slate-900"
          disabled={!editable}
        >
          {task.title}
        </button>
        {menuItems.length > 0 && (
          <Dropdown
            trigger={
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                aria-label="Task actions"
              >
                ⋯
              </span>
            }
            items={menuItems}
          />
        )}
      </div>
      {task.description && (
        <p className="mt-1 text-xs text-slate-500">{truncateText(task.description, 120)}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {task.dueDate && <span>{formatDate(task.dueDate)}</span>}
          {task.assignee ? (
            <Avatar name={task.assignee.name} size="xs" />
          ) : (
            <span className="text-slate-400">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
