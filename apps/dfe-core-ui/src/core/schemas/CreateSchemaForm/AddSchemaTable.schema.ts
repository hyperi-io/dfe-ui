import { columnNameValidator } from '@/core/schemas/CreateSchemaForm/utils';
import z from 'zod';

export const rowSchema = z.object({
  name: columnNameValidator,
  type: z.string().min(1, { message: 'Type is required' }),
  attribute: z.array(z.string()).optional(),
  use_case: z.string().optional(),
  expr: z.string().optional(),
  comment: z.string().optional(),
  /** Used for form control of uploaded schema */
  id: z.string(),
  imported: z.boolean().optional(),
});
