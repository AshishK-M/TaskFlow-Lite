import { z } from 'zod';
import { VALIDATION } from '@/constants/validation';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(VALIDATION.password.min, `Min ${VALIDATION.password.min} characters`),
});

export const signupSchema = z.object({
  name: z.string().min(VALIDATION.name.min, `Min ${VALIDATION.name.min} characters`).max(VALIDATION.name.max),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(VALIDATION.password.min, `Min ${VALIDATION.password.min} characters`),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
