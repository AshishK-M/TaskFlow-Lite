'use client';

import { Modal } from '@/components/ui/Modal';
import { BoardForm } from './BoardForm';
import type { BoardFormValues } from './boardSchema';

export type BoardFormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  submitLabel: string;
  defaultValues?: Partial<BoardFormValues>;
  onSubmit: (values: BoardFormValues) => Promise<void>;
};

export const BoardFormModal = ({
  open,
  onClose,
  title,
  description,
  submitLabel,
  defaultValues,
  onSubmit,
}: BoardFormModalProps) => (
  <Modal open={open} onClose={onClose} title={title} description={description}>
    <BoardForm
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
