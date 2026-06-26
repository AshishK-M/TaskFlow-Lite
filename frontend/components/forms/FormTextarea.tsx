import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from './FormField';

export type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
};

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  function FormTextarea({ label, error, hint, required, id, name, ...rest }, ref) {
    const fieldId = id ?? name;
    return (
      <FormField label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
        <Textarea ref={ref} id={fieldId} name={name} invalid={!!error} {...rest} />
      </FormField>
    );
  },
);
