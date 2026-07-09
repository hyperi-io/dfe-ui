import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { rowSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import {
  schemaGroupValidator,
  schemaNameValidator,
  schemaVersionValidator,
} from '@/core/validationSchemas/CreateSchemaForm/utils';
import z from 'zod';
/** Used for building the request body */
const schemaDetails = {
  schema_type: z.enum(['meta', 'common_header', 'hunts']),
  _field_type: z.enum([
    SCHEMA_FIELD_TYPES.BASE,
    SCHEMA_FIELD_TYPES.PROMOTED,
    SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    SCHEMA_FIELD_TYPES.CSV_IMPORT,
    SCHEMA_FIELD_TYPES.USER_DEFINED,
  ]),
  name: schemaNameValidator,
  path: schemaGroupValidator.optional(),
  version: schemaVersionValidator,
  type: z.enum(['model', 'addition', 'revision']),
  description: z.string().min(1, { message: 'Description is required' }),
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
