import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';

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
