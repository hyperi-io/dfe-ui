import {
  SchemaCreateRequest,
  SchemaCreateRequestColumn,
} from '@/Schemas/hooks/useCreateSchema/types';
import { CreateSchemaFormData } from './CreateSchemaForm';

/*
 * Transforms the form data to a request body for the create schema API.
 * columnsSource, file, uploadType are not used for submission
 * @param formData - The form data to transform
 * @returns The transformed request body
 */
export const transformFormDataToRequestBody = (
  formData: CreateSchemaFormData,
) => {
  const uploadedColumns: SchemaCreateRequestColumn[] = Object.values(
    formData.uploadedColumns ?? {},
  ).map((column) => ({
    name: column.name,
    type: column.type,
    attribute: column.attribute,
    use_case: column.use_case ?? '',
    expr: column.expr ?? '',
    comment: column.comment,
  }));

  const schemaColumns: SchemaCreateRequestColumn[] = Object.values(
    formData.schemaColumns ?? {},
  ).map((column) => ({
    name: column.name,
    type: column.type,
    attribute: column.attribute,
    use_case: column.use_case ?? '',
    expr: column.expr ?? '',
    comment: column.comment,
  }));

  const requestBody: SchemaCreateRequest = {
    path: formData.path ? `${formData.path}/${formData.name}` : formData.name,
    description: formData.description,
    current: formData.version,
    versions: {
      [formData.version]: {
        date: new Date().toISOString(),
        type: formData.type,
        summary: formData.description ?? '',
        columns: [...(uploadedColumns ?? []), ...(schemaColumns ?? [])],
      },
    },
  };

  return requestBody;
};
