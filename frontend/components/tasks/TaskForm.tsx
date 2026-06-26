'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextarea } from '@/components/forms/FormTextarea';
import {
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_VALUES,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_VALUES,
  type TaskPriority,
  type TaskStatus,
} from '@/constants/status';
import type { Member } from '@/types/member';
import { toDateInputValue } from '@/utils/formatDate';
import { taskSchema, type TaskFormValues } from './taskSchema';

export type TaskFormProps = {
  defaultValues?: Partial<TaskFormValues>;
  members: Member[];
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
};

const statusOptions = TASK_STATUS_VALUES.map((value) => ({
  value,
  label: TASK_STATUS_LABELS[value as TaskStatus],
}));
const priorityOptions = TASK_PRIORITY_VALUES.map((value) => ({
  value,
  label: TASK_PRIORITY_LABELS[value as TaskPriority],
}));

export const TaskForm = ({
  defaultValues,
  members,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
}: TaskFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.MEDIUM,
      assigneeId: '',
      ...defaultValues,
      dueDate: toDateInputValue(defaultValues?.dueDate ?? null) || '',
    },
  });

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m.userId, label: m.user.name })),
  ];

  return (
    <form onSubmit={handleSubmit(async (values) => onSubmit(values))} className="space-y-4">
      <FormInput
        label="Title"
        placeholder="Short summary"
        required
        {...register('title')}
        error={errors.title?.message}
      />
      <FormTextarea
        label="Description"
        rows={3}
        placeholder="Optional details"
        {...register('description')}
        error={errors.description?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          label="Status"
          options={statusOptions}
          {...register('status')}
          error={errors.status?.message}
        />
        <FormSelect
          label="Priority"
          options={priorityOptions}
          {...register('priority')}
          error={errors.priority?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          label="Assignee"
          options={memberOptions}
          {...register('assigneeId')}
          error={errors.assigneeId?.message}
        />
        <FormInput
          label="Due date"
          type="date"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
