'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/forms/FormInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { boardSchema, type BoardFormValues } from './boardSchema';

export type BoardFormProps = {
  defaultValues?: Partial<BoardFormValues>;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: BoardFormValues) => Promise<void> | void;
};

export const BoardForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: BoardFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: { name: '', description: '', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(async (values) => onSubmit(values))} className="space-y-4">
      <FormInput
        label="Board name"
        placeholder="e.g. Q3 Roadmap"
        required
        {...register('name')}
        error={errors.name?.message}
      />
      <FormTextarea
        label="Description"
        placeholder="What is this board for?"
        rows={3}
        {...register('description')}
        error={errors.description?.message}
      />
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
