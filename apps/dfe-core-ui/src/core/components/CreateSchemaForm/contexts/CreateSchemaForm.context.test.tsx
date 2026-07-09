import type { RowSchema } from '@/core/components/CreateSchemaForm/AddSchemaTable';
import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import type { UploadedSchemaRow } from '@/core/components/CreateSchemaForm/types';
import type { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
// Used by antd form
import type { FieldError } from '@rc-component/form/es/interface';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FormInstance } from 'antd';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import {
  CreateSchemaFormProvider,
  useCreateSchemaFormContext,
} from './CreateSchemaForm.context';
import type {
  CreateSchemaFormContextValue,
  InvalidColumns,
} from './CreateSchemaForm.context.d';

const validRow = (
  id: string,
  overrides: Partial<RowSchema> = {},
): RowSchema => ({
  id,
  name: `col_${id}`,
  type: 'string',
  _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
  ...overrides,
});

/** Row name violates rowSchema identifier rule (no spaces). */
const invalidZodRow = (id: string): RowSchema =>
  ({
    id,
    name: 'bad id!',
    type: 'string',
  }) as RowSchema;

const fieldErr = (name: FieldError['name'], message: string): FieldError =>
  ({
    name,
    errors: [message],
  }) as FieldError;

afterEach(async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  vi.restoreAllMocks();
});

const TestHarness = ({
  children,
  initialValues,
}: {
  children: ReactNode;
  initialValues?: Partial<CreateSchemaFormData>;
}) => (
  <CreateSchemaFormProvider initialValues={initialValues}>
    {children}
  </CreateSchemaFormProvider>
);

const renderContext = (initialValues?: Partial<CreateSchemaFormData>) =>
  renderHook(() => useCreateSchemaFormContext(), {
    wrapper: ({ children }) => (
      <TestHarness initialValues={initialValues}>{children}</TestHarness>
    ),
  });

const renderContextWithTestValue = (
  testValue: Partial<CreateSchemaFormContextValue>,
) =>
  renderHook(() => useCreateSchemaFormContext(), {
    wrapper: ({ children }) => (
      <CreateSchemaFormProvider testValue={testValue}>
        {children}
      </CreateSchemaFormProvider>
    ),
  });

const testValueInvalidColumns: InvalidColumns[] = [
  {
    success: false,
    error: new z.ZodError([
      { code: 'custom', path: [], message: 'testValue override' },
    ]),
    data: validRow('override-id'),
  } as InvalidColumns,
];

const setUploadedFormRows = (
  form: FormInstance<CreateSchemaFormData>,
  rows: CreateSchemaFormData['uploadedColumns'],
) => {
  act(() => {
    form.setFieldsValue({ uploadedColumns: rows });
  });
};

describe('useCreateSchemaFormContext', () => {
  test('throws when used outside CreateSchemaFormProvider', () => {
    expect(() => renderHook(() => useCreateSchemaFormContext())).toThrow(
      'useCreateSchemaFormContext must be used within CreateSchemaFormProvider',
    );
  });
});

describe('CreateSchemaFormProvider', () => {
  test('seeds uploaded and schema columns from initialValues on first render', () => {
    const uploaded = [validRow('u1')];
    const { result } = renderContext({ uploadedColumns: uploaded });

    expect(result.current.uploadedSchemaColumns).toEqual(uploaded);
    expect(result.current.uploadedSchemaColumns).toHaveLength(1);
  });

  test('exposes context value and updates schema columns', () => {
    const { result } = renderContext();
    const form = result.current.form;
    const setFieldsValueSpy = vi.spyOn(form, 'setFieldsValue');

    expect(result.current.schemaColumns).toEqual([]);
    expect(result.current.form).toBe(form);
    expect(result.current.formValidation).toBeDefined();

    act(() => {
      result.current.handleSetSchemaColumns([validRow('s1')]);
    });
    expect(result.current.schemaColumns).toEqual([validRow('s1')]);
    expect(setFieldsValueSpy).toHaveBeenCalled();
  });

  test('handleUpdateSchemaColumns syncs schemaColumns from form values', () => {
    const { result } = renderContext();

    const row = validRow('manual-1');
    act(() => {
      result.current.handleUpdateSchemaColumns({ schemaColumns: [row] }, {
        schemaColumns: [row],
      } as CreateSchemaFormData);
    });

    expect(result.current.schemaColumns).toEqual([row]);
  });

  test('changedValuesTriggerInvalidTabErrors reflects tab list keys', () => {
    const { result } = renderContext();

    expect(result.current.changedValuesTriggerInvalidTabErrors({ x: 1 })).toBe(
      false,
    );
    expect(
      result.current.changedValuesTriggerInvalidTabErrors({
        schemaColumns: [],
      }),
    ).toBe(true);
  });

  test('handleSetUploadedSchemaColumns keeps all rows and tracks zod-invalid rows', () => {
    const { result } = renderContext();

    const bad = invalidZodRow('i1');
    const good = validRow('g1');

    act(() => {
      result.current.handleSetUploadedSchemaColumns([good, bad]);
    });

    expect(result.current.uploadedSchemaColumns).toEqual([good, bad]);
    expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
    expect(result.current.invalidUploadedSchemaColumns[0]?.data).toEqual(bad);
  });

  test('recomputeValidationErrors merges field errors with import invalid state', async () => {
    const { result } = renderContext();
    vi.spyOn(result.current.form, 'getFieldsError').mockReturnValue([
      fieldErr(['uploadedColumns', 0, 'name'], 'from form'),
    ]);

    act(() => {
      result.current.handleSetUploadedSchemaColumns([invalidZodRow('x')]);
    });

    act(() => {
      result.current.recomputeValidationErrors();
    });

    await waitFor(() => {
      expect(
        result.current.validationErrors.uploadedColumns.length,
      ).toBeGreaterThan(0);
    });
  });

  test('recomputeValidationErrors clears tab errors when the form has no field errors', () => {
    const { result } = renderContext();
    const getFieldsError = vi.spyOn(result.current.form, 'getFieldsError');

    getFieldsError.mockReturnValue([
      fieldErr(['schemaColumns'], 'At least one schema column is required'),
    ]);

    act(() => {
      result.current.recomputeValidationErrors();
    });

    expect(result.current.validationErrors.schemaColumns).toContain(
      'At least one schema column is required',
    );

    getFieldsError.mockReturnValue([]);

    act(() => {
      result.current.recomputeValidationErrors();
    });

    expect(result.current.validationErrors.schemaColumns).toEqual([]);
  });

  test('handleValidate refreshes validationErrors asynchronously', async () => {
    const { result } = renderContext();
    vi.spyOn(result.current.form, 'getFieldsError').mockReturnValue([
      fieldErr(['name'], 'detail err'),
    ]);

    act(() => {
      result.current.handleValidate();
    });

    await waitFor(() => {
      expect(result.current.validationErrors.schemaDetails).toContain(
        'detail err',
      );
    });
  });

  test('handleValidateColumnListsOnly validates column tab lists only', async () => {
    const { result } = renderContext();
    const form = result.current.form;

    act(() => {
      form.setFieldsValue({
        uploadedColumns: [validRow('u1')],
        invalidColumns: [invalidZodRow('i1')],
        schemaColumns: [validRow('s1')],
      });
    });

    const validateFields = vi
      .spyOn(form, 'validateFields')
      .mockResolvedValue({} as never);

    act(() => {
      result.current.handleValidateColumnListsOnly();
    });

    await waitFor(() => {
      expect(validateFields).toHaveBeenCalled();
    });

    const paths = validateFields.mock.calls[0]?.[0] as (string | number)[][];
    expect(paths.every((p) => typeof p[0] === 'string')).toBe(true);
    const roots = new Set(paths.map((p) => p[0] as string));
    expect(roots).toEqual(
      new Set(['uploadedColumns', 'invalidColumns', 'schemaColumns']),
    );
    expect(paths).toContainEqual(['uploadedColumns', 0, 'name']);
  });

  test('layout validation effect no-ops when uploaded and invalid are both empty', async () => {
    const { result } = renderContext();
    const validateFields = vi.spyOn(result.current.form, 'validateFields');

    act(() => {
      result.current.handleSetUploadedSchemaColumns([]);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(validateFields.mock.calls.length).toBe(0);
  });

  test('layout effect validates with uploaded/invalid column list paths only', async () => {
    const { result } = renderContext();
    const validateFields = vi.spyOn(result.current.form, 'validateFields');

    act(() => {
      result.current.handleSetUploadedSchemaColumns([
        validRow('u1'),
        invalidZodRow('i1'),
      ]);
    });

    await waitFor(() => {
      expect(validateFields).toHaveBeenCalled();
    });

    const listArg = validateFields.mock.calls[0]?.[0] as unknown;
    expect(Array.isArray(listArg)).toBe(true);
    expect(listArg).toContainEqual(['uploadedColumns', 0, 'name']);
    expect(listArg).toContainEqual(['invalidColumns', 0, 'name']);
    expect(
      (listArg as (string | number)[][]).every(
        (p) => p[0] === 'uploadedColumns' || p[0] === 'invalidColumns',
      ),
    ).toBe(true);
  });

  test('layout effect validates after uploaded columns change and respects unmount cancellation', async () => {
    const { result, unmount } = renderContext();

    act(() => {
      result.current.handleSetUploadedSchemaColumns([validRow('u1')]);
    });

    unmount();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  });

  test('__internal_collectTabErrorsAfterValidate swallows validateFields rejection', async () => {
    const { result } = renderContext();
    const form = result.current.form;
    vi.spyOn(form, 'validateFields').mockRejectedValueOnce(new Error('fail'));
    const getFieldsError = vi.spyOn(form, 'getFieldsError');

    act(() => {
      result.current.handleValidate();
    });

    await waitFor(() => {
      expect(getFieldsError).toHaveBeenCalled();
    });
  });

  describe('handleUpdateInvalidUploadedSchemaColumn', () => {
    test('appends and replaces invalid entries by row id', async () => {
      const { result } = renderContext();

      const a = invalidZodRow('n1');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([a]);
      });

      const updated = { ...a, name: 'still bad!' };

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(updated);
      });

      expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
      expect(result.current.invalidUploadedSchemaColumns[0]?.data?.name).toBe(
        'still bad!',
      );
    });

    test('returns early when fixed row id is not present in uploaded list', () => {
      const { result } = renderContext();
      const setFieldsValue = vi.spyOn(result.current.form, 'setFieldsValue');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('only')]);
      });

      setFieldsValue.mockClear();

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(
          validRow('missing'),
        );
      });

      expect(setFieldsValue).not.toHaveBeenCalled();
    });

    test('promotes valid row: updates state, form fields, and survives validateFields rejection', async () => {
      const { result } = renderContext();
      const form = result.current.form;

      const broken = invalidZodRow('fix1');
      const fixed = validRow('fix1');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([broken]);
      });

      const setFieldsValue = vi.spyOn(form, 'setFieldsValue');
      vi.spyOn(form, 'validateFields').mockRejectedValueOnce(
        new Error('field invalid'),
      );

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(fixed);
      });

      expect(result.current.uploadedSchemaColumns).toEqual([
        { ...fixed, _field_type: SCHEMA_FIELD_TYPES.USER_DEFINED },
      ]);
      expect(result.current.invalidUploadedSchemaColumns).toEqual([]);
      expect(setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: expect.any(Array),
        invalidColumns: [],
      });

      await waitFor(() => {
        expect(form.validateFields).toHaveBeenCalled();
      });
    });

    test('promoting one row sets invalidColumns when other invalid imports remain', async () => {
      const { result } = renderContext();
      const form = result.current.form;
      const setFieldsValue = vi.spyOn(form, 'setFieldsValue');

      const brokenA = invalidZodRow('a1');
      const brokenB = invalidZodRow('b1');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([brokenA, brokenB]);
      });

      setFieldsValue.mockClear();

      const validateFields = vi.spyOn(form, 'validateFields');

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(validRow('a1'));
      });

      expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
      expect(result.current.invalidUploadedSchemaColumns[0]?.data.id).toBe(
        'b1',
      );
      expect(setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: expect.arrayContaining([
          expect.objectContaining({ id: 'a1', name: 'col_a1' }),
          expect.objectContaining({ id: 'b1' }),
        ]),
        invalidColumns: [expect.objectContaining({ id: 'b1' })],
      });

      await waitFor(() => {
        expect(validateFields).toHaveBeenCalled();
      });
    });

    test('schedules validation when row remains invalid', async () => {
      const { result } = renderContext();
      const form = result.current.form;
      const validateFields = vi.spyOn(form, 'validateFields');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('v')]);
      });

      const before = validateFields.mock.calls.length;

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(
          invalidZodRow('new'),
        );
      });

      await waitFor(() => {
        expect(validateFields.mock.calls.length).toBeGreaterThan(before);
      });
    });
  });

  describe('handleUpdateUploadedSchemaColumns', () => {
    test('returns when changed values do not mention uploaded columns tree', () => {
      const { result } = renderContext();
      const getFieldValue = vi.spyOn(result.current.form, 'getFieldValue');

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({ file: 1 });
      });

      expect(getFieldValue).not.toHaveBeenCalled();
    });

    test('returns when form uploadedColumns is not an array', () => {
      const { result } = renderContext();
      const form = result.current.form;

      const broken = invalidZodRow('b1');
      act(() => {
        result.current.handleSetUploadedSchemaColumns([broken]);
      });

      vi.spyOn(form, 'getFieldValue').mockImplementation((key) =>
        key === 'uploadedColumns' ? ({ not: 'array' } as never) : undefined,
      );

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });
    });

    test('does not clear seeded uploaded columns when form uploadedColumns is still empty', () => {
      const { result } = renderContext({ uploadedColumns: [validRow('seed')] });
      const form = result.current.form;

      vi.spyOn(form, 'getFieldValue').mockImplementation((key) =>
        key === 'uploadedColumns' ? [] : undefined,
      );

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      expect(result.current.uploadedSchemaColumns).toHaveLength(1);
      expect(result.current.uploadedSchemaColumns[0]?.id).toBe('seed');
    });

    test('syncs form uploadedColumns into context when there are no invalid imported rows', () => {
      const { result } = renderContext();
      const form = result.current.form;

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('only')]);
      });

      setUploadedFormRows(form, [
        {
          id: 'only',
          name: 'col_only',
          type: 'string',
          _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
        },
      ]);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      expect(result.current.uploadedSchemaColumns[0]?.name).toBe('col_only');
    });

    test('merges form row into invalid import and promotes when row becomes valid', async () => {
      const { result } = renderContext();
      const form = result.current.form;
      const setFieldsValue = vi.spyOn(form, 'setFieldsValue');

      const badImport: UploadedSchemaRow = {
        id: 'm1',
        name: '',
        type: '',
        _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
      };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows(form, [
        {
          id: 'm1',
          name: 'fixed_name',
          type: 'string',
          attribute: [],
          _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
        },
      ]);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          a: { uploadedColumns: [1] },
        });
      });

      await waitFor(() => {
        expect(result.current.invalidUploadedSchemaColumns).toEqual([]);
      });
      expect(result.current.uploadedSchemaColumns[0]?.name).toBe('fixed_name');
      expect(setFieldsValue).toHaveBeenCalled();
    });

    test('uses same-index form row when entries omit id so byFormId is undefined', async () => {
      const { result } = renderContext();
      const form = result.current.form;

      const badImport: UploadedSchemaRow = {
        id: 'rowKey',
        name: '',
        type: '',
        _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
      };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      // @ts-expect-error - test data
      setUploadedFormRows(form, [{ name: 'col_rowKey', type: 'string' }]);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      await waitFor(() => {
        expect(result.current.invalidUploadedSchemaColumns).toEqual([]);
      });
      expect(result.current.uploadedSchemaColumns[0]).toMatchObject({
        id: 'rowKey',
        name: 'col_rowKey',
        type: 'string',
      });
    });

    test('skips invalid entries without id or with non-object form rows', () => {
      const { result } = renderContext();
      const form = result.current.form;

      const noId = { name: 'x', type: 'string' } as RowSchema;
      act(() => {
        result.current.handleSetUploadedSchemaColumns([noId]);
      });

      // @ts-expect-error - test data
      setUploadedFormRows(form, [null, 1, { id: 'nope' }]);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      expect(
        result.current.invalidUploadedSchemaColumns.length,
      ).toBeGreaterThan(0);
    });

    test('still reconciles via row index when id is absent from form values array', async () => {
      const { result } = renderContext();
      const form = result.current.form;

      const badImport: UploadedSchemaRow = {
        id: 'idx',
        name: '',
        type: '',
        _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
      };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows(form, [
        // @ts-expect-error - test data
        undefined,
        {
          name: 'from_index',
          type: 'string',
          id: 'idx',
          _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
        },
      ]);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      await waitFor(() => {
        expect(result.current.invalidUploadedSchemaColumns).toEqual([]);
      });
    });

    test('leaves invalid row when merged object still fails rowSchema', () => {
      const { result } = renderContext();
      const form = result.current.form;

      const badImport: UploadedSchemaRow = {
        id: 'z1',
        name: '',
        type: '',
        _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
      };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows(form, [
        {
          id: 'z1',
          name: 'bad name!',
          type: 'string',
          _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
        },
      ]);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
    });

    test('queues tab error collection after processing', async () => {
      const { result } = renderContext();
      const form = result.current.form;
      const validateFields = vi.spyOn(form, 'validateFields');

      const badImport: UploadedSchemaRow = {
        id: 'q1',
        name: '',
        type: '',
        _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
      };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows(form, [
        {
          id: 'q1',
          name: 'still',
          type: '',
          _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
        },
      ]);

      const n = validateFields.mock.calls.length;

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      await waitFor(() => {
        expect(validateFields.mock.calls.length).toBeGreaterThan(n);
      });
    });
  });

  describe('handleRemoveUploadedSchemaColumn', () => {
    test('no-ops without column id', () => {
      const { result } = renderContext();
      const setFieldsValue = vi.spyOn(result.current.form, 'setFieldsValue');

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn(undefined);
      });
      expect(setFieldsValue).not.toHaveBeenCalled();
    });

    test('no-ops when id is not in uploaded or invalid lists', () => {
      const { result } = renderContext();
      const setFieldsValue = vi.spyOn(result.current.form, 'setFieldsValue');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('a')]);
      });

      setFieldsValue.mockClear();

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn('ghost');
      });
      expect(setFieldsValue).not.toHaveBeenCalled();
    });

    test('removing one invalid row maps invalidColumns for remaining invalid', async () => {
      const { result } = renderContext();
      const form = result.current.form;
      const setFieldsValue = vi.spyOn(form, 'setFieldsValue');

      const invA = invalidZodRow('mx');
      const invB = invalidZodRow('my');
      const validateFields = vi.spyOn(form, 'validateFields');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([invA, invB]);
      });

      setFieldsValue.mockClear();

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn('mx');
      });

      expect(result.current.uploadedSchemaColumns).toEqual([invB]);
      expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
      expect(result.current.invalidUploadedSchemaColumns[0]?.data.id).toBe(
        'my',
      );
      expect(setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: [expect.objectContaining({ id: 'my' })],
        invalidColumns: [expect.objectContaining({ id: 'my' })],
      });

      await waitFor(() => {
        expect(validateFields).toHaveBeenCalled();
      });
    });

    test('removes from uploaded and clears invalid form list when none left', async () => {
      const { result } = renderContext();
      const form = result.current.form;
      const setFieldsValue = vi.spyOn(form, 'setFieldsValue');
      const validateFields = vi.spyOn(form, 'validateFields');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('r1')]);
      });

      setFieldsValue.mockClear();

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn('r1');
      });

      expect(result.current.uploadedSchemaColumns).toEqual([]);
      expect(setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: [],
        invalidColumns: [],
      });

      await waitFor(() => {
        expect(validateFields).toHaveBeenCalled();
      });
    });

    test('removes invalid-only row', () => {
      const { result } = renderContext();

      const inv = invalidZodRow('onlyInv');
      act(() => {
        result.current.handleSetUploadedSchemaColumns([inv]);
      });

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn('onlyInv');
      });

      expect(result.current.uploadedSchemaColumns).toEqual([]);
      expect(result.current.invalidUploadedSchemaColumns).toEqual([]);
    });
  });

  describe('testValue', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    test('overrides context value when testValue is provided and NODE_ENV is test', () => {
      const { result } = renderContextWithTestValue({
        invalidUploadedSchemaColumns: testValueInvalidColumns,
      });

      expect(result.current.invalidUploadedSchemaColumns).toEqual(
        testValueInvalidColumns,
      );
    });

    test('does not override context value when testValue is provided and NODE_ENV is not test', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const { result } = renderContextWithTestValue({
        invalidUploadedSchemaColumns: testValueInvalidColumns,
      });

      expect(result.current.invalidUploadedSchemaColumns).toEqual([]);
    });

    test('merges testValue with live provider state for non-overridden fields', () => {
      const { result } = renderContextWithTestValue({
        invalidUploadedSchemaColumns: testValueInvalidColumns,
      });

      act(() => {
        result.current.handleSetSchemaColumns([validRow('live-col')]);
      });

      expect(result.current.schemaColumns).toEqual([validRow('live-col')]);
      expect(result.current.invalidUploadedSchemaColumns).toEqual(
        testValueInvalidColumns,
      );
    });
  });
});
