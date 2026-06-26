'use client';

import { useMemo } from 'react';
import { TASK_STATUS_VALUES, type TaskStatus } from '@/constants/status';
import type { Task } from '@/types/task';
import { TaskColumn } from './TaskColumn';
import type { TaskCardActions } from './TaskCard';

export type TaskBoardProps = {
  tasks: Task[];
  cardProps: TaskCardActions;
  visibleStatuses?: ReadonlySet<TaskStatus>;
};

const groupByStatus = (tasks: Task[]): Record<TaskStatus, Task[]> => {
  const acc: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
  for (const t of tasks) acc[t.status as TaskStatus]?.push(t);
  return acc;
};

export const TaskBoard = ({ tasks, cardProps, visibleStatuses }: TaskBoardProps) => {
  const grouped = useMemo(() => groupByStatus(tasks), [tasks]);
  const statuses = visibleStatuses
    ? TASK_STATUS_VALUES.filter((s) => visibleStatuses.has(s))
    : TASK_STATUS_VALUES;
  const cols = statuses.length === 1 ? 'md:grid-cols-1' : statuses.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  if (statuses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        No statuses selected.
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${cols}`}>
      {statuses.map((status) => (
        <TaskColumn key={status} status={status} tasks={grouped[status]} cardProps={cardProps} />
      ))}
    </div>
  );
};
