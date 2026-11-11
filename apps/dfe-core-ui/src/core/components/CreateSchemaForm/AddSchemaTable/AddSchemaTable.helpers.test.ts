import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { RowFormSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import { describe, expect, test } from 'vitest';
import {
  foldRetiredAttributes,
  listItemFromPartial,
} from './AddSchemaTable.helpers';
import type { SchemaColumnRow } from './types';

describe('listItemFromPartial', () => {
  test('maps canonical row keys', () => {
    const column: SchemaColumnRow = {
      id: '1',
      name: 'user_id',
      type: 'String',
      attribute: ['nullable'],
      use_case: 'id',
      expr: 'col',
      comment: 'pk',
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    };

    const expectedResponse: RowFormSchema = {
      id: '1',
      name: 'user_id',
      type: 'String',
      attribute: ['nullable'],
      use_case: 'id',
      expr: 'col',
      comment: 'pk',
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    };
    expect(listItemFromPartial(column)).toEqual(expectedResponse);
  });

  test('reads PascalCase CSV-style keys (Name, Type, …)', () => {
    const column = {
      id: '1',
      Name: 'count',
      Type: 'UInt64',
      Attribute: 'metric',
      'Index Type': 'count',
      'Expression (CTE)': 'count()',
      Comment: '',
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column)).toEqual({
      id: '1',
      name: 'count',
      type: 'UInt64',
      attribute: ['metric'],
      use_case: 'count',
      expr: 'count()',
      comment: '',
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    });
  });

  test('matches keys case-insensitively when exact alias is missing', () => {
    const column = {
      NAME: 'x',
      tYpE: 'Bool',
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
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
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).attribute).toEqual(['only']);
  });

  test('maps attribute array elements to strings', () => {
    const column = {
      name: 'c',
      type: 'String',
      attribute: [1, true],
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    } as unknown as SchemaColumnRow;
    expect(listItemFromPartial(column).attribute).toEqual(['1', 'true']);
  });

  test('falls back to typed column fields when lookup is empty', () => {
    const column: SchemaColumnRow = {
      id: '1',
      name: 'n',
      type: 't',
      use_case: 'fallback_use',
      expr: 'e',
      comment: 'co',
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    };
    expect(listItemFromPartial(column)).toMatchObject({
      name: 'n',
      type: 't',
      use_case: 'fallback_use',
      expr: 'e',
      comment: 'co',
    });
  });

  test('uses empty strings for missing name and type', () => {
    expect(
      listItemFromPartial({
        id: '1',
        _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
      }),
    ).toMatchObject({
      id: '1',
      name: '',
      type: '',
      attribute: [],
      use_case: '',
      expr: '',
      comment: '',
    });
  });
});

describe('listItemFromPartial cardinality', () => {
  const column = (extra: Partial<SchemaColumnRow>): SchemaColumnRow => ({
    id: '1',
    name: 'host',
    type: 'string',
    _field_type: SCHEMA_FIELD_TYPES.USER_DEFINED,
    ...extra,
  });

  test('keeps a declared cardinality', () => {
    expect(
      listItemFromPartial(column({ cardinality: 'high' })).cardinality,
    ).toBe('high');
  });

  test('a cardinality the API does not know is dropped', () => {
    const row = listItemFromPartial(
      column({ cardinality: 'huge' } as unknown as Partial<SchemaColumnRow>),
    );

    expect(row.cardinality).toBeUndefined();
  });

  test('reads a Cardinality CSV-style key', () => {
    const row = listItemFromPartial({
      id: '1',
      Name: 'host',
      Type: 'string',
      Cardinality: 'low',
    } as unknown as SchemaColumnRow);

    expect(row.cardinality).toBe('low');
  });
});

describe('foldRetiredAttributes', () => {
  const retired = { lowcardinality: 'low' };

  test.each([
    [
      'a declared cardinality is kept',
      'high' as const,
      ['nullable'],
      'high',
      ['nullable'],
    ],
    [
      'the retired attribute reads as the cardinality it names',
      undefined,
      ['lowcardinality', 'not_null'],
      'low',
      ['not_null'],
    ],
    [
      'a declared cardinality wins and the attribute is left alone',
      'high' as const,
      ['lowcardinality'],
      'high',
      ['lowcardinality'],
    ],
    [
      'a column with neither has no cardinality',
      undefined,
      ['nullable'],
      undefined,
      ['nullable'],
    ],
  ])(
    '%s',
    (
      _label,
      cardinality,
      attribute,
      expectedCardinality,
      expectedAttribute,
    ) => {
      expect(foldRetiredAttributes(cardinality, attribute, retired)).toEqual({
        cardinality: expectedCardinality,
        attribute: expectedAttribute,
      });
    },
  );

  test('an attribute the engine has no meaning for stays', () => {
    expect(foldRetiredAttributes(undefined, ['lowcardinality'], {})).toEqual({
      cardinality: undefined,
      attribute: ['lowcardinality'],
    });
  });
});
