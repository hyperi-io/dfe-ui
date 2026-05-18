import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { transformFormDataToRequestBody } from './CreateSchemaDrawer.helpers';

const baseFormData = (): CreateSchemaFormData => ({
  name: 'my_schema',
  version: '1.0.0',
  type: 'model',
  uploadType: 'csv',
  file: new File([], 'test.csv'),
  uploadedColumns: [],
  schemaColumns: [],
});

describe('transformFormDataToRequestBody', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('uses name-only path when group path is omitted', () => {
    const result = transformFormDataToRequestBody(baseFormData());
    expect(result.path).toBe('my_schema');
    expect(result.current).toBe('1.0.0');
    expect(result.description).toBeUndefined();
    expect(result.versions['1.0.0']).toMatchObject({
      date: '2024-06-15T12:00:00.000Z',
      type: 'model',
      summary: '',
      columns: [],
    });
  });

  test('joins path and name when group path is set', () => {
    const result = transformFormDataToRequestBody({
      ...baseFormData(),
      path: 'aws/cloudtrail',
    });
    expect(result.path).toBe('aws/cloudtrail/my_schema');
  });

  test('copies description to top-level and version summary', () => {
    const result = transformFormDataToRequestBody({
      ...baseFormData(),
      description: 'Reads CloudTrail logs',
    });
    expect(result.description).toBe('Reads CloudTrail logs');
    expect(result.versions['1.0.0'].summary).toBe('Reads CloudTrail logs');
  });

  test('uses empty string for summary when description is omitted', () => {
    const result = transformFormDataToRequestBody(baseFormData());
    expect(result.versions['1.0.0'].summary).toBe('');
  });

  test('maps uploaded columns then manual columns', () => {
    const uploaded = [
      {
        id: '1',
        name: 'col_a',
        type: 'String',
        attribute: ['nullable'],
        use_case: 'id',
        expr: '',
        comment: 'note',
        imported: true,
      },
    ];
    const manual = [
      {
        id: '2',
        name: 'col_b',
        type: 'UInt64',
        attribute: [] as string[],
        use_case: 'count',
        expr: 'count()',
        comment: undefined as string | undefined,
      },
    ];
    const result = transformFormDataToRequestBody({
      ...baseFormData(),
      uploadedColumns: uploaded,
      schemaColumns: manual,
    });
    expect(result.versions['1.0.0'].columns).toEqual([
      {
        name: 'col_a',
        type: 'String',
        attribute: ['nullable'],
        use_case: 'id',
        expr: '',
        comment: 'note',
        imported: true,
      },
      {
        name: 'col_b',
        type: 'UInt64',
        attribute: [],
        use_case: 'count',
        expr: 'count()',
        comment: undefined,
      },
    ]);
  });
});
