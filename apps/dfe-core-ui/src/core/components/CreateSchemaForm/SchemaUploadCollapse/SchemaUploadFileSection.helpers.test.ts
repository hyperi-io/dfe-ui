import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { describe, expect, test, vi } from 'vitest';
import { transformDataToUploadedSchemaRow } from './SchemaUploadFileSection.helpers';

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('1'),
}));

describe('transformDataToUploadedSchemaRow', () => {
  test('reads a CSV column name and stores the v1 type as a primitive', () => {
    const data = [
      { column: 'alert_uid', type: 'string_fast' },
      { column: 'source_table', type: 'string_fast_lowcardinality' },
      { column: 'condidence_score', type: 'int16' },
    ];
    const result = transformDataToUploadedSchemaRow(data, 'csv');
    expect(result[0]).toMatchObject({
      name: 'alert_uid',
      type: 'string',
      _field_type: SCHEMA_FIELD_TYPES.CSV_IMPORT,
    });
    expect(result[1]).toMatchObject({
      name: 'source_table',
      type: 'string',
      attribute: ['lowcardinality'],
    });
    expect(result[2]).toMatchObject({
      name: 'condidence_score',
      type: 'integer',
      ch_override: 'Int16',
    });
  });

  test('maps CSV imports to csv_import field type', () => {
    const data = [{ name: 'col_a', type: 'String' }];
    const result = transformDataToUploadedSchemaRow(data, 'csv');
    expect(result[0]).toMatchObject({
      id: '1',
      name: 'col_a',
      type: 'string',
      _field_type: SCHEMA_FIELD_TYPES.CSV_IMPORT,
    });
  });

  test('preserves elastic converter _field_type when present', () => {
    const data = [
      { name: 'col_a', type: 'String', _field_type: SCHEMA_FIELD_TYPES.BASE },
    ];
    const result = transformDataToUploadedSchemaRow(data, 'elastic');
    expect(result[0]?._field_type).toBe(SCHEMA_FIELD_TYPES.BASE);
  });

  test('defaults elastic rows without _field_type to user_defined', () => {
    const data = [{ name: 'col_a', type: 'String' }];
    const result = transformDataToUploadedSchemaRow(data, 'elastic');
    expect(result[0]?._field_type).toBe(SCHEMA_FIELD_TYPES.USER_DEFINED);
  });
});
