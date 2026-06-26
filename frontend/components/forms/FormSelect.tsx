import { forwardRef, type ReactNode } from 'react';
import { Select, type SelectProps } from '@/components/ui/Select';
import { FormField } from './FormField';

export type FormSelectProps = SelectProps & {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
};

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  { label, error, hint, required, id, name, ...rest },
  ref,
) {
  const fieldId = id ?? name;
  return (
    <FormField label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <Select ref={ref} id={fieldId} name={name} invalid={!!error} {...rest} />
    </FormField>
  );
});
