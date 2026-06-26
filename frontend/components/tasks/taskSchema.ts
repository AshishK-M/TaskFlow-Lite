import { z } from 'zod';
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from '@/constants/status';
import { VALIDATION } from '@/constants/validation';

export const taskSchema = z.object({
  title: z
    .string()
    .min(VALIDATION.taskTitle.min, 'Title is required')
    .max(VALIDATION.taskTitle.max),
  description: z.string().max(VALIDATION.taskDescription.max).optional().or(z.literal('')),
  status: z.enum(TASK_STATUS_VALUES as [string, ...string[]]),
  priority: z.enum(TASK_PRIORITY_VALUES as [string, ...string[]]),
  assigneeId: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
