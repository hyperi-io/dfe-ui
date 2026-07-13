import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import {
  PreloadedSchema,
  UploadedSchemaRow,
} from '@/core/components/CreateSchemaForm/types';
import { v4 as uuidv4 } from 'uuid';

export type UploadedSchemaImportSource = 'csv' | 'elastic';

const fieldTypeForImportRow = (
  value: PreloadedSchema[number],
  source: UploadedSchemaImportSource,
): string => {
  if (source === 'csv') {
    return SCHEMA_FIELD_TYPES.CSV_IMPORT;
  }
  const fromApi = (value as { _field_type?: string | null })._field_type;
  return typeof fromApi === 'string' && fromApi.length > 0
    ? fromApi
    : SCHEMA_FIELD_TYPES.USER_DEFINED;
};

export const transformDataToUploadedSchemaRow = (
  data: PreloadedSchema,
  source: UploadedSchemaImportSource,
): UploadedSchemaRow[] =>
  data.map((value) => {
    const name = typeof value.name === 'string' ? value.name : '';
    const type = typeof value.type === 'string' ? value.type : '';
    const attribute = Array.isArray(value.attribute)
      ? value.attribute
      : undefined;
    const use_case =
      typeof value.use_case === 'string' ? value.use_case : undefined;
    const expr = typeof value.expr === 'string' ? value.expr : undefined;
    const comment =
      typeof value.comment === 'string' ? value.comment : undefined;

    return {
      id: uuidv4(),
      _field_type: fieldTypeForImportRow(value, source),
      name,
      type,
      attribute,
      use_case,
      expr,
      comment,
    };
  });
