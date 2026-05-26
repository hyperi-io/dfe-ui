import z from 'zod';

const NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const GROUP_REGEX = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;
const VERSION_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+$/;

export const schemaNameValidator = z
  .string()
  .min(1, { message: 'Name is required' })
  .refine((v) => NAME_REGEX.test(v), {
    message:
      'Name must contain only letters, numbers, underscores, and hyphens',
  });

export const schemaGroupValidator = z
  .string()
  .refine((v) => v && v.length > 0 && GROUP_REGEX.test(v), {
    message:
      'Groups must contain only letters, numbers, underscores, hyphens, and forward slashes',
  });

export const schemaVersionValidator = z
  .string()
  .min(1, { message: 'Version is required' })
  .refine((v) => VERSION_REGEX.test(v), {
    message: 'Version must be in the format x.x.x',
  });
