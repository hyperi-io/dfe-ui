import {
  schemaGroupValidator,
  schemaNameValidator,
  schemaVersionValidator,
} from '@/core/validationSchemas/CreateSchemaForm/utils';
import { INDEX_USE_CASES } from '@/Schemas/constants/indexUseCase';
import z from 'zod';

const selectEntrySchema = z.object({
  name: z.string().min(1, { message: 'Column name is required' }),
  index: z.enum(INDEX_USE_CASES).optional(),
});

export const formSchema = z.object({
  name: schemaNameValidator,
  path: schemaGroupValidator.optional(),
  version: schemaVersionValidator,
  description: z.string().min(1, { message: 'Description is required' }),
  base: z
    .string({ message: 'Base meta schema is required' })
    .min(1, { message: 'Base meta schema is required' }),
  base_version: z
    .string({ message: 'Base version is required' })
    .min(1, { message: 'Base version is required' }),
  select: z
    .array(selectEntrySchema)
    .min(1, { message: 'Select at least one column from the base schema' }),
});

export type CreateDerivedSchemaFormData = z.infer<typeof formSchema>;
