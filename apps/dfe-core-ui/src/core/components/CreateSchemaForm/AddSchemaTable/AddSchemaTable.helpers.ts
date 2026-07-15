import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { UploadedSchemaRow } from '@/core/components/CreateSchemaForm/types';
import { rowSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import z from 'zod';

const rowLookup = (
  column: Partial<UploadedSchemaRow>,
  ...aliases: string[]
): unknown => {
  const rec = column as Record<string, unknown>;
  for (const key of aliases) {
    const v = rec[key];
    if (v !== undefined && v !== '' && v !== null) return v;
  }
  const lowerMap = Object.keys(rec).reduce<Record<string, string>>((acc, k) => {
    acc[k.toLowerCase()] = k;
    return acc;
  }, {});
  for (const key of aliases) {
    const actual = lowerMap[key.toLowerCase()];
    if (actual === undefined) continue;
    const v = rec[actual];
    if (v !== undefined && v !== '' && v !== null) return v;
  }
  return undefined;
};

const normalizeAttribute = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.includes(',')) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  return [];
};

export const listItemFromPartial = (
  column: Partial<UploadedSchemaRow> & {
    _field_type?: string;
    ch_override?: string;
  },
): z.infer<typeof rowSchema> => {
  const name = String(rowLookup(column, 'name', 'Name') ?? '');
  const type = String(rowLookup(column, 'type', 'Type') ?? '');
  const attributeRaw =
    rowLookup(column, 'attribute', 'Attribute') ?? column.attribute;
  const use_case = String(
    rowLookup(column, 'use_case', 'Index Type') ?? column.use_case ?? '',
  );
  const expr = String(
    rowLookup(column, 'expr', 'Expression (CTE)') ?? column.expr ?? '',
  );
  const comment = String(
    rowLookup(column, 'comment', 'Comment') ?? column.comment ?? '',
  );

  const ch_override = String(
    rowLookup(column, 'ch_override', 'chOverride') ?? column.ch_override ?? '',
  );

  return {
    id: column.id ?? '',
    _field_type: column._field_type ?? SCHEMA_FIELD_TYPES.USER_DEFINED,
    name,
    type,
    ch_override: ch_override || undefined,
    attribute: normalizeAttribute(attributeRaw),
    use_case,
    expr,
    comment,
  };
};
