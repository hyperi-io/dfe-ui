import z from 'zod';
import { rowSchema } from '.';
import { SchemaColumnRow } from './types';

const rowLookup = (column: SchemaColumnRow, ...aliases: string[]): unknown => {
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
  column: SchemaColumnRow,
): z.infer<typeof rowSchema> => {
  const name = String(rowLookup(column, 'name', 'Name') ?? '');
  const type = String(rowLookup(column, 'type', 'Type') ?? '');
  const attributeRaw =
    rowLookup(column, 'attribute', 'Attribute') ?? column.attribute;
  const use_case = String(
    rowLookup(column, 'use_case', 'Use Case', 'UseCase') ??
      column.use_case ??
      '',
  );
  const expr = String(rowLookup(column, 'expr', 'Expr') ?? column.expr ?? '');
  const comment = String(
    rowLookup(column, 'comment', 'Comment') ?? column.comment ?? '',
  );

  return {
    id: column.id ?? '',
    imported: column.imported ?? false,
    name,
    type,
    attribute: normalizeAttribute(attributeRaw),
    use_case,
    expr,
    comment,
  };
};
