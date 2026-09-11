import z from 'zod';

// The engine's rule (dfe-engine source/models.py, validate_source_name): a
// source-bound app deploys one instance named for its source, so the name
// becomes an Argo Application and a set of Kubernetes object names, which is a
// DNS-1123 label of at most 40 characters.
export const SOURCE_NAME_VALIDATOR = {
  regex: /^[a-z]([a-z0-9-]*[a-z0-9])?$/,
  regexMessage: (fieldName: string = 'Name') =>
    `${fieldName} must be lowercase letters, numbers and hyphens, start with a letter and end with a letter or number`,
  maxLength: 40,
};

export const sourceNameValidator = z
  .string({ message: 'Source is required' })
  .min(1, { message: 'Source is required' })
  .max(SOURCE_NAME_VALIDATOR.maxLength, {
    message: `Source name must be at most ${SOURCE_NAME_VALIDATOR.maxLength} characters`,
  })
  .refine((value) => SOURCE_NAME_VALIDATOR.regex.test(value), {
    message: SOURCE_NAME_VALIDATOR.regexMessage('Source name'),
  });
