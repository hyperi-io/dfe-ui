import { joinSchemaApiPath } from '@/core/hooks/useCreateSchema/useCreateSchema.helpers';
import { CreateDerivedSchemaFormData } from '@/Schemas/validationSchemas/CreateDerivedSchemaForm.schema';
import { TCreateDerivedSchemaRequest } from './types';

/** Derived schemas live under their own top-level path segment, as meta schemas do. */
export const DERIVED_SCHEMA_TYPE = 'derived';

/** YYYY-MM-DD, the date form a schema version carries. */
export const versionDate = (now: Date = new Date()) =>
  now.toISOString().slice(0, 10);

export const derivedSchemaPath = (formData: {
  path?: string;
  name: string;
}): string =>
  joinSchemaApiPath({
    schema_type: DERIVED_SCHEMA_TYPE,
    path: formData.path ? `${formData.path}/${formData.name}` : formData.name,
  });

export const transformFormDataToRequestBody = (
  formData: CreateDerivedSchemaFormData,
  now: Date = new Date(),
): TCreateDerivedSchemaRequest => ({
  path: derivedSchemaPath(formData),
  base: formData.base,
  base_version: formData.base_version,
  current: formData.version,
  versions: {
    [formData.version]: {
      date: versionDate(now),
      summary: formData.description,
      select: formData.select,
    },
  },
});
