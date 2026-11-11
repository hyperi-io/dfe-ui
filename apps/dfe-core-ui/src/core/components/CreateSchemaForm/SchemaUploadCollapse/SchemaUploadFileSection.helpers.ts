import { asCardinality } from '@/core/components/CreateSchemaForm/AddSchemaTable/AddSchemaTable.helpers';
import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import {
  PreloadedSchema,
  UploadedSchemaRow,
} from '@/core/components/CreateSchemaForm/types';
import { v4 as uuidv4 } from 'uuid';

type UploadedSchemaImportSource = 'csv' | 'elastic';

const fieldTypeForImportRow = (
  value: PreloadedSchema[number],
  source: UploadedSchemaImportSource,
): string => {
  if (source === 'csv') {
    return SCHEMA_FIELD_TYPES.CSV_IMPORT;
  }
  const fromApi = value._field_type;
  return typeof fromApi === 'string' && fromApi.length > 0
    ? fromApi
    : SCHEMA_FIELD_TYPES.USER_DEFINED;
};

const textField = (value: PreloadedSchema[number], keys: string[]): string => {
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const found = record[key];
    if (typeof found === 'string') return found;
  }
  return '';
};

/**
 * A DFE CSV still writes the v1 compound type. The engine stores a primitive,
 * with the width on ch_override and low cardinality as a cardinality.
 */
const CSV_COMPOUND_TYPE: Record<
  string,
  { type: string; cardinality?: 'low'; ch_override?: string }
> = {
  string: { type: 'string' },
  string_fast: { type: 'string' },
  string_lowcardinality: { type: 'string', cardinality: 'low' },
  string_fast_lowcardinality: { type: 'string', cardinality: 'low' },
  text: { type: 'text' },
  json: { type: 'json' },
  int8: { type: 'integer', ch_override: 'Int8' },
  int16: { type: 'integer', ch_override: 'Int16' },
  int32: { type: 'integer', ch_override: 'Int32' },
  int64: { type: 'integer' },
  int128: { type: 'integer', ch_override: 'Int128' },
  int256: { type: 'integer', ch_override: 'Int256' },
  float32: { type: 'float', ch_override: 'Float32' },
  float64: { type: 'float' },
  boolean: { type: 'boolean' },
  timestamp: { type: 'timestamp' },
  datetime: { type: 'datetime' },
  ipv4: { type: 'ip', ch_override: 'IPv4' },
  ipv6: { type: 'ip' },
  ip_field: { type: 'ip' },
  geo_point: { type: 'geo_point' },
  uuid: { type: 'uuid' },
};

const csvColumnType = (
  rawType: string,
): { type: string; cardinality?: 'low'; ch_override?: string } =>
  CSV_COMPOUND_TYPE[rawType.trim().toLowerCase()] ?? { type: rawType };

export const transformDataToUploadedSchemaRow = (
  data: PreloadedSchema,
  source: UploadedSchemaImportSource,
): UploadedSchemaRow[] =>
  data.map((value) => {
    // A DFE CSV names the column in `column`; an Elastic row uses `name`.
    const name = textField(value, ['name', 'column']);
    const rawType = textField(value, ['type']);
    const mapped =
      source === 'csv' ? csvColumnType(rawType) : { type: rawType };
    const type = mapped.type;
    const attribute = Array.isArray(value.attribute)
      ? value.attribute
      : undefined;
    // A cardinality the file declares wins over the one a compound type implies.
    const cardinality =
      asCardinality((value as Record<string, unknown>).cardinality) ??
      ('cardinality' in mapped ? mapped.cardinality : undefined);
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
      ...(mapped.ch_override ? { ch_override: mapped.ch_override } : {}),
      attribute,
      ...(cardinality ? { cardinality } : {}),
      use_case,
      expr,
      comment,
    };
  });
