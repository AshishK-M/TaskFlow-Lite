import type { TaskPriority, TaskStatus } from '@/constants/status';
import type { User } from './auth';

export type Task = {
  id: string;
  boardId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  assigneeId: string | null;
  assignee: User | null;
  createdById: string;
  createdBy: User;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;
