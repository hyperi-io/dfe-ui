import { listItemFromPartial } from '@/core/components/CreateSchemaForm/AddSchemaTable/AddSchemaTable.helpers';
import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { SchemaCreateRequest } from '@/core/hooks/useCreateSchema/types';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { MetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { v4 as uuidv4 } from 'uuid';

const CREATE_SCHEMA_VERSION_TYPES = ['model', 'addition', 'revision'] as const;

type CreateSchemaVersionType = (typeof CREATE_SCHEMA_VERSION_TYPES)[number];

const toFormType = (type: string): CreateSchemaVersionType | undefined => {
  if (CREATE_SCHEMA_VERSION_TYPES.includes(type as CreateSchemaVersionType)) {
    return type as CreateSchemaVersionType;
  }
  return undefined;
};

/**
 * Maps schema detail (selected version) into create-schema-version form defaults.
 */
export const metaSchemaDetailToCreateVersionFormInitialValues = (
  schema: MetaSchemaDetailResponse | null | undefined,
  pathSegments: { path?: string; name?: string },
): Partial<CreateSchemaFormData> => {
  const base = {
    path: pathSegments.path,
    name: pathSegments.name,
  };

  if (!schema?.version) {
    return base;
  }

  const formType = toFormType(schema.version.type);
  const items = schema.version.columns?.items ?? [];
  const schemaColumns = items.map((column) =>
    listItemFromPartial({
      ...column,
      id: uuidv4(),
      _field_type: column._field_type ?? SCHEMA_FIELD_TYPES.USER_DEFINED,
    }),
  );

  return {
    ...base,
    ...(formType ? { type: formType } : {}),
    description: schema.version.summary ?? '',
    uploadedColumns: schemaColumns,
  };
};

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
    _field_type: column._field_type ?? SCHEMA_FIELD_TYPES.USER_DEFINED,
  }));
  const schemaColumns = (values.schemaColumns ?? []).map((column) => ({
    name: column.name,
    type: column.type,
    attribute: column.attribute,
    use_case: column.use_case,
    expr: column.expr,
    comment: column.comment,
    _field_type: column._field_type ?? SCHEMA_FIELD_TYPES.USER_DEFINED,
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
