import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { transformFormDataToRequestBody } from './useCreateSchema.helpers';

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
    const { requestBody } = transformFormDataToRequestBody(baseFormData());
    expect(requestBody.path).toBe('my_schema');
    expect(requestBody.current).toBe('1.0.0');
    expect(requestBody.versions['1.0.0']).toMatchObject({
      date: '2024-06-15T12:00:00.000Z',
      type: 'model',
      summary: '',
    });
  });

  test('joins path and name when group path is set', () => {
    const { requestBody } = transformFormDataToRequestBody({
      ...baseFormData(),
      path: 'aws/cloudtrail',
    });
    expect(requestBody.path).toBe('aws/cloudtrail/my_schema');
  });

  test('moves description to version summary', () => {
    const { requestBody } = transformFormDataToRequestBody({
      ...baseFormData(),
      description: 'Reads CloudTrail logs',
    });
    expect(requestBody.versions['1.0.0'].summary).toBe('Reads CloudTrail logs');
  });

  test('uses empty string for summary when description is omitted', () => {
    const { requestBody } = transformFormDataToRequestBody(baseFormData());
    expect(requestBody.versions['1.0.0'].summary).toBe('');
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
    const { requestBody } = transformFormDataToRequestBody({
      ...baseFormData(),
      uploadedColumns: uploaded,
      schemaColumns: manual,
    });
    expect(requestBody.versions['1.0.0'].columns).toEqual([
      {
        name: 'col_a',
        type: 'String',
        attribute: ['nullable'],
        use_case: 'id',
        comment: 'note',
      },
      {
        name: 'col_b',
        type: 'UInt64',
        use_case: 'count',
        expr: 'count()',
        comment: undefined,
      },
    ]);
  });

  describe('outputs uploaded and schema columns', () => {
    test('outputs empty arrays when no columns are present', () => {
      const { uploadedColumns, schemaColumns } =
        transformFormDataToRequestBody(baseFormData());
      expect(uploadedColumns).toEqual([]);
      expect(schemaColumns).toEqual([]);
    });

    test('outputs uploaded columns when present', () => {
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
      const { uploadedColumns, schemaColumns } = transformFormDataToRequestBody(
        {
          ...baseFormData(),
          uploadedColumns: uploaded,
        },
      );
      expect(uploadedColumns).toEqual([
        {
          name: 'col_a',
          type: 'String',
          attribute: ['nullable'],
          use_case: 'id',
          comment: 'note',
        },
      ]);
      expect(schemaColumns).toEqual([]);
    });

    test('outputs schema columns when present', () => {
      const manual = [
        {
          id: '2',
          name: 'col_b',
          type: 'UInt64',
          attribute: [],
          use_case: 'count',
          expr: 'count()',
          comment: undefined,
        },
      ];
      const { uploadedColumns, schemaColumns } = transformFormDataToRequestBody(
        {
          ...baseFormData(),
          schemaColumns: manual,
        },
      );
      expect(uploadedColumns).toEqual([]);
      expect(schemaColumns).toEqual([
        {
          name: 'col_b',
          type: 'UInt64',
          use_case: 'count',
          expr: 'count()',
          comment: undefined,
        },
      ]);
    });

    test('handles the undefined case', () => {
      const { uploadedColumns, schemaColumns } = transformFormDataToRequestBody(
        {
          ...baseFormData(),
          uploadedColumns: undefined,
          schemaColumns: undefined,
        },
      );
      expect(uploadedColumns).toEqual([]);
      expect(schemaColumns).toEqual([]);
    });

    test('handles the null case', () => {
      const { uploadedColumns, schemaColumns } = transformFormDataToRequestBody(
        {
          ...baseFormData(),
          // @ts-expect-error - test case
          uploadedColumns: null,
          // @ts-expect-error - test case
          schemaColumns: null,
        },
      );
      expect(uploadedColumns).toEqual([]);
      expect(schemaColumns).toEqual([]);
    });
  });
});
