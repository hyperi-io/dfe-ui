import { describe, expect, test } from 'vitest';
import { listItemFromPartial } from './AddSchemaTable.helpers';
import type { SchemaColumnRow } from './types';

describe('listItemFromPartial', () => {
  test('maps canonical row keys', () => {
    const column: SchemaColumnRow = {
      name: 'user_id',
      type: 'String',
      attribute: ['nullable'],
      use_case: 'id',
      expr: 'col',
      comment: 'pk',
    };
    expect(listItemFromPartial(column)).toEqual({
      name: 'user_id',
      type: 'String',
      attribute: ['nullable'],
      use_case: 'id',
      expr: 'col',
      comment: 'pk',
    });
  });

  test('reads PascalCase CSV-style keys (Name, Type, …)', () => {
    const column = {
      Name: 'count',
      Type: 'UInt64',
      Attribute: 'metric',
      'Use Case': 'count',
      Expr: 'count()',
      Comment: '',
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column)).toEqual({
      name: 'count',
      type: 'UInt64',
      attribute: ['metric'],
      use_case: 'count',
      expr: 'count()',
      comment: '',
    });
  });

  test('matches keys case-insensitively when exact alias is missing', () => {
    const column = {
      NAME: 'x',
      tYpE: 'Bool',
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column)).toMatchObject({
      name: 'x',
      type: 'Bool',
    });
  });

  test('prefers first non-empty lookup value across aliases', () => {
    const column = {
      name: '',
      Name: 'from_pascal',
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).name).toBe('from_pascal');
  });

  test('skips null and empty string when resolving lookup', () => {
    const column = {
      name: null,
      Name: '  ok  ',
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).name).toBe('  ok  ');
  });

  test('normalizes attribute from comma-separated string', () => {
    const column = {
      name: 'c',
      type: 'String',
      attribute: ' nullable , metric ',
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).attribute).toEqual([
      'nullable',
      'metric',
    ]);
  });

  test('normalizes attribute from non-comma string to single-element array', () => {
    const column = {
      name: 'c',
      type: 'String',
      attribute: '  only  ',
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).attribute).toEqual(['only']);
  });

  test('maps attribute array elements to strings', () => {
    const column = {
      name: 'c',
      type: 'String',
      attribute: [1, true],
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).attribute).toEqual(['1', 'true']);
  });

  test('falls back to typed column fields when lookup is empty', () => {
    const column: SchemaColumnRow = {
      name: 'n',
      type: 't',
      use_case: 'fallback_use',
      expr: 'e',
      comment: 'co',
    };
    expect(listItemFromPartial(column)).toMatchObject({
      name: 'n',
      type: 't',
      use_case: 'fallback_use',
      expr: 'e',
      comment: 'co',
    });
  });

  test('uses UseCase alias for use_case', () => {
    const column = { UseCase: 'dimension' } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).use_case).toBe('dimension');
  });

  test('uses empty strings for missing name and type', () => {
    expect(listItemFromPartial({})).toMatchObject({
      name: '',
      type: '',
      attribute: [],
      use_case: '',
      expr: '',
      comment: '',
    });
  });
});
