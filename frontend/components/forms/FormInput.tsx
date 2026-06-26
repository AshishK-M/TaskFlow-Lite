import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Input } from '@/components/ui/Input';
import { FormField } from './FormField';

export type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { label, error, hint, required, id, name, ...rest },
  ref,
) {
  const fieldId = id ?? name;
  return (
    <FormField label={label} htmlFor={fieldId} error={error} hint={hint} required={required}>
      <Input ref={ref} id={fieldId} name={name} invalid={!!error} {...rest} />
    </FormField>
  );
});
