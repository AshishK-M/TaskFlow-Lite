import { z } from 'zod';
import { VALIDATION } from '@/constants/validation';

export const boardSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.boardName.min, 'Name is required')
    .max(VALIDATION.boardName.max),
  description: z
    .string()
    .max(VALIDATION.boardDescription.max, 'Too long')
    .optional()
    .or(z.literal('')),
});

export type BoardFormValues = z.infer<typeof boardSchema>;
