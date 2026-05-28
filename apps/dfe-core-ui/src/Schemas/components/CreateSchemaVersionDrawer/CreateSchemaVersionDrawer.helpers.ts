import { SchemaCreateRequest } from '@/core/hooks/useCreateSchema/types';
import { CreateSchemaFormData } from '@/core/schemas/CreateSchemaForm/CreateSchemaForm.schema';

/** Internal key for review UI only; not sent to the create-version API. */
export const REVIEW_PLACEHOLDER_VERSION = '__new_version__';

/**
 * transformFormDataToRequestBody - Transforms the form data to a request body for the create schema version API.
 * **Specific for Create Schema Version Drawer**
 * @param values - The form data to transform
 * @returns The transformed request body
 * @example
 * const requestBody = transformFormDataToRequestBody({
 *   type: 'model',
 *   description: 'Reads CloudTrail logs',
 *   uploadedColumns: [],
 *   schemaColumns: [],
 * });
 */
export const transformFormDataToRequestBody = (
  values: CreateSchemaFormData,
) => {
  const uploadedColumns = (values.uploadedColumns ?? []).map((column) => ({
    name: column.name,
    type: column.type,
    attribute: column.attribute,
    use_case: column.use_case,
    expr: column.expr,
  }));
  const schemaColumns = (values.schemaColumns ?? []).map((column) => ({
    name: column.name,
    type: column.type,
    attribute: column.attribute,
    use_case: column.use_case,
    expr: column.expr,
  }));

  return {
    type: values.type,
    summary: values.description,
    columns: [...uploadedColumns, ...schemaColumns],
  };
};

/**
 * Builds a SchemaCreateRequest-shaped payload for review table/YAML layouts.
 * The create-version API does not take a version number; this shape is display-only.
 */
export const transformFormDataToReviewRequestBody = (
  values: CreateSchemaFormData,
): { requestBody: SchemaCreateRequest } => {
  const versionPayload = transformFormDataToRequestBody(values);
  const path = values.path ? `${values.path}/${values.name}` : values.name;

  return {
    requestBody: {
      path,
      current: REVIEW_PLACEHOLDER_VERSION,
      versions: {
        [REVIEW_PLACEHOLDER_VERSION]: {
          date: new Date().toISOString(),
          type: versionPayload.type,
          summary: versionPayload.summary ?? '',
          columns: versionPayload.columns,
        },
      },
    },
  };
};
