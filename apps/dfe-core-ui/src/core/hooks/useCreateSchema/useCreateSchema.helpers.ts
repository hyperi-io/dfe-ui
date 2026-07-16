import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { TCreateSchemaRequestColumn } from '@/core/hooks/useCreateSchema/types';
import { RowFormSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';

/** Column shape sent on create / create-version (engine may accept ch_override ahead of type sync). */
export type TCreateSchemaRequestColumnPayload = TCreateSchemaRequestColumn;

export const mapFormColumnToRequestColumn = (
  column: RowFormSchema,
): TCreateSchemaRequestColumnPayload => ({
  name: column.name,
  type: column.type,
  _field_type: column._field_type ?? SCHEMA_FIELD_TYPES.USER_DEFINED,
  ...(column.ch_override ? { ch_override: column.ch_override } : {}),
  ...(column.attribute && column.attribute.length > 0
    ? { attribute: column.attribute }
    : {}),
  ...(column.use_case ? { use_case: column.use_case } : {}),
  ...(column.expr ? { expr: column.expr } : {}),
  ...(column.comment ? { comment: column.comment } : {}),
});

/*
 * Transforms the form data to a request body for the create schema API.
 * columnsSource, file, uploadType are not used for submission
 * @param formData - The form data to transform
 * @returns The transformed request body
 */
export const transformFormDataToRequestBody = (
  formData: CreateSchemaFormData,
) => {
  const uploadedColumns = (formData.uploadedColumns ?? []).map(
    mapFormColumnToRequestColumn,
  );

  const schemaColumns = (formData.schemaColumns ?? []).map(
    mapFormColumnToRequestColumn,
  );

  const requestBody = {
    schema_type: formData.schema_type,
    path: formData.path ? `${formData.path}/${formData.name}` : formData.name,
    current: formData.version,
    versions: {
      [formData.version]: {
        date: new Date().toISOString(),
        type: formData.type,
        summary: formData.description ?? '',
        columns: [...uploadedColumns, ...schemaColumns],
      },
    },
  };

  return { requestBody, uploadedColumns, schemaColumns };
};

export const joinSchemaApiPath = ({
  schema_type,
  path,
}: {
  schema_type?: string;
  path: string;
}) => {
  if (!schema_type) {
    return path;
  }
  if (!path) {
    return schema_type;
  }
  return `${schema_type}/${path}`;
};
