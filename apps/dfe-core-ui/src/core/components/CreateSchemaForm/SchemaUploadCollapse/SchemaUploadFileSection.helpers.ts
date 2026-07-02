import {
  PreloadedSchema,
  UploadedSchemaRow,
} from '@/core/components/CreateSchemaForm/types';
import { v4 as uuidv4 } from 'uuid';

export const transformDataToUploadedSchemaRow = (
  data: PreloadedSchema,
): UploadedSchemaRow[] =>
  data.map((value) => {
    const name = typeof value.name === 'string' ? value.name : undefined;
    const type = typeof value.type === 'string' ? value.type : undefined;
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
      _field_type: 'imported',
      name,
      type,
      attribute,
      use_case,
      expr,
      comment,
    };
  });
