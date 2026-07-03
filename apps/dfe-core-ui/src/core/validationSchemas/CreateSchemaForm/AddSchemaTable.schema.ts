import z from 'zod';
import { columnNameValidator } from './utils';

export const rowSchema = z.object({
  _field_type: z.string(),
  name: columnNameValidator,
  type: z.string().min(1, { message: 'Type is required' }),
  attribute: z.array(z.string()).optional(),
  use_case: z.string().optional(),
  expr: z.string().optional(),
  comment: z.string().optional(),
  /** Used for form control of uploaded schema */
  id: z.string(),
});

export type RowFormSchema = z.infer<typeof rowSchema>;
