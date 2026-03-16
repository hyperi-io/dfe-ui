import z from 'zod';

const SOURCE_NAME_REGEX = /^[a-z][a-z0-9_]*$/;
export const sourceNameValidator = z
  .string({ message: 'Source is required' })
  .min(1, { message: 'Source is required' })
  .refine((value) => SOURCE_NAME_REGEX.test(value), {
    message:
      'Source can only contain lowercase alphanumeric characters and underscores, starting with a letter',
  });
