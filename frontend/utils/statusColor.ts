import { TASK_PRIORITY, TASK_STATUS, type TaskPriority, type TaskStatus } from '@/constants/status';
import type { Role } from '@/constants/roles';
import { ROLES } from '@/constants/roles';

export const statusColor: Record<TaskStatus, string> = {
  [TASK_STATUS.TODO]: 'bg-slate-100 text-slate-700 border-slate-200',
  [TASK_STATUS.IN_PROGRESS]: 'bg-amber-100 text-amber-800 border-amber-200',
  [TASK_STATUS.DONE]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const statusAccent: Record<TaskStatus, string> = {
  [TASK_STATUS.TODO]: 'bg-slate-400',
  [TASK_STATUS.IN_PROGRESS]: 'bg-amber-400',
  [TASK_STATUS.DONE]: 'bg-emerald-500',
};

export const priorityColor: Record<TaskPriority, string> = {
  [TASK_PRIORITY.LOW]: 'bg-sky-50 text-sky-700 border-sky-200',
  [TASK_PRIORITY.MEDIUM]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [TASK_PRIORITY.HIGH]: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const roleColor: Record<Role, string> = {
  [ROLES.OWNER]: 'bg-brand-100 text-brand-800 border-brand-200',
  [ROLES.ADMIN]: 'bg-violet-100 text-violet-800 border-violet-200',
  [ROLES.MEMBER]: 'bg-slate-100 text-slate-700 border-slate-200',
  [ROLES.VIEWER]: 'bg-slate-50 text-slate-600 border-slate-200',
};
