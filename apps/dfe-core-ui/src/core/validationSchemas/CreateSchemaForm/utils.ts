import { DB_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import z from 'zod';

const GROUP_REGEX = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;
const VERSION_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+$/;

export const schemaNameValidator = z
  .string({ message: 'Name is required' })
  .min(1, { message: 'Name is required' })
  .refine((v) => DB_NAME_VALIDATOR.regex.test(v), {
    message: DB_NAME_VALIDATOR.message('Name'),
  });

export const schemaGroupValidator = z
  .string({ message: 'Group is required' })
  .refine((v) => v.length === 0 || GROUP_REGEX.test(v), {
    message:
      'Groups must contain only letters, numbers, underscores, hyphens, and forward slashes',
  });

export const schemaVersionValidator = z
  .string({ message: 'Version is required' })
  .min(1, { message: 'Version is required' })
  .refine((v) => VERSION_REGEX.test(v), {
    message: 'Version must be in the format x.x.x',
  });

export const columnNameValidator = z
  .string({ message: 'Name is required' })
  .min(1, { message: 'Name is required' })
  .refine((v) => DB_NAME_VALIDATOR.regex.test(v), {
    message: DB_NAME_VALIDATOR.message('Name'),
  });
