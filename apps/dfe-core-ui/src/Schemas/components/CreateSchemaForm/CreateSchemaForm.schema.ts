import z from 'zod';
import { rowSchema } from './AddSchemaTable';

const NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const GROUP_REGEX = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;
const VERSION_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+$/;

/** Used for building the request body */
const schemaDetails = {
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => NAME_REGEX.test(v), {
      message:
        'Name must contain only letters, numbers, underscores, and hyphens',
    }),
  path: z
    .string()
    .refine((v) => v && v.length > 0 && GROUP_REGEX.test(v), {
      message:
        'Groups must contain only letters, numbers, underscores, hyphens, and forward slashes',
    })
    .optional(),
  version: z
    .string()
    .min(1, { message: 'Version is required' })
    .refine((v) => VERSION_REGEX.test(v), {
      message: 'Version must be in the format x.x.x',
    }),
  type: z.enum(['model', 'addition', 'revision']),
  description: z.string().optional(),
};
const uploadedColumnsTabSchema = {
  uploadedColumns: z.array(rowSchema).optional(),
};
const schemaColumnsTabSchema = {
  schemaColumns: z.array(rowSchema).optional(),
};

/** Used for state management and form controls */
const formSchemaControls = {
  uploadType: z.enum(['csv', 'json']),
  file: z.instanceof(Object).optional(),
  invalidColumns: z.array(rowSchema).optional(),
};

export const formSchema = z.object({
  ...schemaDetails,
  ...uploadedColumnsTabSchema,
  ...schemaColumnsTabSchema,
  ...formSchemaControls,
});

export type CreateSchemaFormData = z.infer<typeof formSchema>;

const uploadedColumnsTabFormKeys = Object.keys(uploadedColumnsTabSchema);
const schemaColumnsTabFormKeys = Object.keys(schemaColumnsTabSchema);
const schemaDetailsFormKeys = Object.keys(schemaDetails);
const formSchemaControlsFormKeys = Object.keys(formSchemaControls);

export const SCHEMA_TAB_FORM_VALIDATION_KEY_MAP = {
  schemaDetails: schemaDetailsFormKeys,
  uploadedColumns: uploadedColumnsTabFormKeys,
  schemaColumns: schemaColumnsTabFormKeys,
  formSchemaControls: formSchemaControlsFormKeys,
};
export type SchemaFormValidationErrors = {
  [K in keyof typeof SCHEMA_TAB_FORM_VALIDATION_KEY_MAP]: string[];
};
