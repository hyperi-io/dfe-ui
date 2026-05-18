import type { FieldError } from '@rc-component/form/es/interface';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import type { InvalidColumns } from './CreateSchemaForm.context.d';
import {
  UPLOADED_ROW_FIELD_KEYS,
  allColumnTabListValidatePaths,
  changedValuesMayAffectTabLists,
  changedValuesMayAffectUploadedColumns,
  createEmptyValidationErrors,
  mergeImportInvalidIntoUploadedTab,
  rowListFieldValidatePaths,
  transformFieldErrorsToTabErrors,
  uploadedAndInvalidColumnListValidatePaths,
} from './CreateSchemaForm.context.helpers';

const emptyTabErrors = createEmptyValidationErrors();

const makeInvalidColumn = (messages: string[]): InvalidColumns[] =>
  messages.map(
    (message) =>
      ({
        success: false,
        error: new z.ZodError([
          {
            code: 'custom',
            path: [],
            message,
          },
        ]),
        data: {} as InvalidColumns['data'],
      }) as InvalidColumns,
  );

describe('rowListFieldValidatePaths', () => {
  test('returns empty list for non-positive row count', () => {
    expect(rowListFieldValidatePaths('invalidColumns', 0)).toEqual([]);
    expect(rowListFieldValidatePaths('invalidColumns', -1)).toEqual([]);
  });

  test('returns one path per row field in column order', () => {
    expect(rowListFieldValidatePaths('invalidColumns', 1)).toEqual(
      UPLOADED_ROW_FIELD_KEYS.map((k) => ['invalidColumns', 0, k]),
    );
    expect(rowListFieldValidatePaths('uploadedColumns', 2).length).toBe(
      UPLOADED_ROW_FIELD_KEYS.length * 2,
    );
  });
});

describe('uploadedAndInvalidColumnListValidatePaths', () => {
  test('concatenates uploaded and invalid list paths', () => {
    const a = uploadedAndInvalidColumnListValidatePaths(1, 1);
    expect(a).toEqual([
      ...rowListFieldValidatePaths('uploadedColumns', 1),
      ...rowListFieldValidatePaths('invalidColumns', 1),
    ]);
  });
});

describe('allColumnTabListValidatePaths', () => {
  test('includes schemaColumns paths after uploaded and invalid', () => {
    const p = allColumnTabListValidatePaths(1, 0, 2);
    expect(p).toEqual([
      ...rowListFieldValidatePaths('uploadedColumns', 1),
      ...rowListFieldValidatePaths('invalidColumns', 0),
      ...rowListFieldValidatePaths('schemaColumns', 2),
    ]);
  });
});

describe('changedValuesMayAffectUploadedColumns', () => {
  test('returns false for null, non-objects, primitives, and empty nested objects without uploadedColumns', () => {
    expect(changedValuesMayAffectUploadedColumns(null)).toBe(false);
    expect(changedValuesMayAffectUploadedColumns(undefined)).toBe(false);
    expect(changedValuesMayAffectUploadedColumns('x')).toBe(false);
    expect(changedValuesMayAffectUploadedColumns(1)).toBe(false);
    expect(changedValuesMayAffectUploadedColumns({})).toBe(false);
    expect(changedValuesMayAffectUploadedColumns({ a: 1 })).toBe(false);
  });

  test('returns true when uploadedColumns is present at any depth', () => {
    expect(changedValuesMayAffectUploadedColumns({ uploadedColumns: [] })).toBe(
      true,
    );
    expect(
      changedValuesMayAffectUploadedColumns({
        wrapper: { uploadedColumns: [1] },
      }),
    ).toBe(true);
  });

  test('returns true when any array entry needs uploadedColumns', () => {
    expect(
      changedValuesMayAffectUploadedColumns([1, { uploadedColumns: {} }]),
    ).toBe(true);
    expect(
      changedValuesMayAffectUploadedColumns([[{ uploadedColumns: 1 }]]),
    ).toBe(true);
  });
});

describe('changedValuesMayAffectTabLists', () => {
  test('returns false for nullish and non-objects', () => {
    expect(changedValuesMayAffectTabLists(null)).toBe(false);
    expect(changedValuesMayAffectTabLists(undefined)).toBe(false);
    expect(changedValuesMayAffectTabLists('tab')).toBe(false);
  });

  test('returns true for schemaColumns, uploadedColumns, or invalidColumns keys', () => {
    expect(changedValuesMayAffectTabLists({ schemaColumns: [] })).toBe(true);
    expect(changedValuesMayAffectTabLists({ uploadedColumns: [] })).toBe(true);
    expect(changedValuesMayAffectTabLists({ invalidColumns: [] })).toBe(true);
  });

  test('recurses into nested objects but not primitives', () => {
    expect(changedValuesMayAffectTabLists({ x: 1 })).toBe(false);
    expect(
      changedValuesMayAffectTabLists({ outer: { schemaColumns: [] } }),
    ).toBe(true);
  });

  test('handles arrays of changed value entries', () => {
    expect(changedValuesMayAffectTabLists([{ invalidColumns: [] }])).toBe(true);
  });
});

describe('UPLOADED_ROW_FIELD_KEYS', () => {
  test('lists expected editable row field keys', () => {
    expect([...UPLOADED_ROW_FIELD_KEYS]).toEqual([
      'name',
      'type',
      'use_case',
      'attribute',
      'expr',
      'comment',
      'id',
    ]);
  });
});

describe('createEmptyValidationErrors', () => {
  test('returns distinct empty arrays per tab bucket', () => {
    const a = createEmptyValidationErrors();
    const b = createEmptyValidationErrors();
    expect(a).toEqual({
      schemaDetails: [],
      uploadedColumns: [],
      schemaColumns: [],
      formSchemaControls: [],
    });
    expect(a.schemaDetails).not.toBe(b.schemaDetails);
  });
});

describe('mergeImportInvalidIntoUploadedTab', () => {
  test('returns the same object when there is nothing to merge', () => {
    const tabErrors = {
      ...emptyTabErrors,
      uploadedColumns: ['existing'],
    };
    expect(mergeImportInvalidIntoUploadedTab(tabErrors, [])).toBe(tabErrors);
  });

  test('appends unique issue messages and preserves other tab buckets', () => {
    const tabErrors = {
      ...emptyTabErrors,
      schemaDetails: ['keep'],
      uploadedColumns: ['a'],
    };
    const merged = mergeImportInvalidIntoUploadedTab(tabErrors, [
      ...makeInvalidColumn(['b', 'b', 'c']),
      ...makeInvalidColumn(['']),
    ]);
    expect(merged.uploadedColumns).toEqual(['a', 'b', 'c']);
    expect(merged.schemaDetails).toEqual(['keep']);
    expect(merged).not.toBe(tabErrors);
    expect(tabErrors.uploadedColumns).toEqual(['a']);
  });
});

describe('transformFieldErrorsToTabErrors', () => {
  const generateFieldError = (
    name: FieldError['name'] | string,
    errors: NonNullable<FieldError['errors']> = ['msg'],
  ): FieldError =>
    ({
      name: name as FieldError['name'],
      errors,
    }) as FieldError;

  test('ignores entries without a usable first error, message, or field root', () => {
    expect(
      transformFieldErrorsToTabErrors([
        generateFieldError('name', []),
        generateFieldError('name', [null as unknown as string]),
        generateFieldError('name', ['']),
        generateFieldError('name', ['  \t ']),
        generateFieldError([] as unknown as FieldError['name']),
        generateFieldError(['orphan']),
      ]),
    ).toEqual(emptyTabErrors);
  });

  test('buckets by schema detail keys (array and dotted string name paths)', () => {
    expect(
      transformFieldErrorsToTabErrors([
        generateFieldError(['name'], [' Name err ']),
        generateFieldError('version.field', ['v']),
      ]),
    ).toEqual({
      ...emptyTabErrors,
      schemaDetails: ['Name err', 'v'],
    });
  });

  test('maps uploadedColumns and invalidColumns roots to the uploaded tab', () => {
    expect(
      transformFieldErrorsToTabErrors([
        generateFieldError(['uploadedColumns', 0, 'name'], ['u1']),
        generateFieldError('invalidColumns.0.type', ['u2']),
      ]),
    ).toEqual({
      ...emptyTabErrors,
      uploadedColumns: ['u1', 'u2'],
    });
  });

  test('maps schemaColumns and form control fields', () => {
    expect(
      transformFieldErrorsToTabErrors([
        generateFieldError(['schemaColumns', 1], ['s']),
        generateFieldError('uploadType', ['t']),
        generateFieldError('file', ['f']),
      ]),
    ).toEqual({
      ...emptyTabErrors,
      schemaColumns: ['s'],
      formSchemaControls: ['t', 'f'],
    });
  });

  test('dedupes identical messages within the same tab', () => {
    expect(
      transformFieldErrorsToTabErrors([
        generateFieldError(['name'], ['dup']),
        generateFieldError(['path'], ['dup']),
      ]),
    ).toEqual({
      ...emptyTabErrors,
      schemaDetails: ['dup'],
    });
  });

  test('drops uncategorized field roots', () => {
    expect(
      transformFieldErrorsToTabErrors([
        generateFieldError(['notAFormKey'], ['orphan']),
      ]),
    ).toEqual(emptyTabErrors);
  });
});
