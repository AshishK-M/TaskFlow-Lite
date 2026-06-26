'use client';

import { Modal } from '@/components/ui/Modal';
import type { Member } from '@/types/member';
import { TaskForm } from './TaskForm';
import type { TaskFormValues } from './taskSchema';

export type TaskFormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  members: Member[];
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

export const TaskFormModal = ({
  open,
  onClose,
  title,
  submitLabel,
  members,
  defaultValues,
  onSubmit,
}: TaskFormModalProps) => (
  <Modal open={open} onClose={onClose} title={title} size="md">
    <TaskForm
      members={members}
      defaultValues={defaultValues}
      submitLabel={submitLabel}
      onCancel={onClose}
      onSubmit={async (values) => {
        await onSubmit(values);
        onClose();
      }}
    />
  </Modal>
);
