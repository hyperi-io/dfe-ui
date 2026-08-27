import { DB_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import z from 'zod';

const RESERVED_NAMES = ['default', 'main'];
export const sourceNameValidator = z
  .string({ message: 'Source is required' })
  .min(1, { message: 'Source is required' })
  .refine((value) => DB_NAME_VALIDATOR.regex.test(value), {
    message: DB_NAME_VALIDATOR.message('Source name'),
  })
  .refine((v) => !RESERVED_NAMES.includes(v), {
    message: 'Source name cannot be a reserved name',
  });
