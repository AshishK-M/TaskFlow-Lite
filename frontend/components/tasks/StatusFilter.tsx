'use client';

import { TASK_STATUS_LABELS, TASK_STATUS_VALUES, type TaskStatus } from '@/constants/status';
import { statusAccent } from '@/utils/statusColor';
import { cn } from '@/lib/cn';

export type StatusFilterProps = {
  value: ReadonlySet<TaskStatus>;
  onChange: (next: Set<TaskStatus>) => void;
};

export const StatusFilter = ({ value, onChange }: StatusFilterProps) => {
  const toggle = (status: TaskStatus) => {
    const next = new Set(value);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    onChange(next);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {TASK_STATUS_VALUES.map((status) => {
        const active = value.has(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => toggle(status)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition',
              active
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', statusAccent[status])} />
            {TASK_STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
};
