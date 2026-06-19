import { DB_NAME_REGEX } from '@/core/validationSchemas/CreateSchemaForm/utils';
import z from 'zod';

export const sourceNameValidator = z
  .string({ message: 'Source is required' })
  .min(1, { message: 'Source is required' })
  .refine((value) => DB_NAME_REGEX.test(value), {
    message:
      'Source can only contain lowercase alphanumeric characters and underscores, starting with a letter',
  });
