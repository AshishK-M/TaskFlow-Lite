'use client';

import { TASK_STATUS_LABELS, type TaskStatus } from '@/constants/status';
import { statusAccent } from '@/utils/statusColor';
import type { Task } from '@/types/task';
import { TaskCard, type TaskCardActions } from './TaskCard';

export type TaskColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  emptyHint?: string;
  cardProps: TaskCardActions;
};

export const TaskColumn = ({ status, tasks, emptyHint, cardProps }: TaskColumnProps) => (
  <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60">
    <div className="px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${statusAccent[status]}`} />
        <h3 className="text-sm font-semibold text-slate-700">{TASK_STATUS_LABELS[status]}</h3>
      </div>
      <span className="text-xs text-slate-500">{tasks.length}</span>
    </div>
    <div className="flex-1 px-2 pb-3 space-y-2 min-h-[6rem]">
      {tasks.length === 0 ? (
        <div className="px-3 py-6 text-center text-xs text-slate-400">
          {emptyHint ?? 'No tasks'}
        </div>
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} {...cardProps} />)
      )}
    </div>
  </div>
);
