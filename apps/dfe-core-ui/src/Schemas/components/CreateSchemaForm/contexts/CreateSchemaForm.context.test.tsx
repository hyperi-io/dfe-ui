import type { FieldError } from '@rc-component/form/es/interface';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FormInstance } from 'antd';
import type { ReactNode } from 'react';
import type { RowSchema } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import type { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import type { UploadedSchemaRow } from '@/Schemas/components/CreateSchemaForm/types';
import { describe, expect, test, vi, afterEach } from 'vitest';
import {
  CreateSchemaFormProvider,
  useCreateSchemaFormContext,
} from './CreateSchemaForm.context';

const validRow = (
  id: string,
  overrides: Partial<RowSchema> = {},
): RowSchema => ({
  id,
  name: `col_${id}`,
  type: 'string',
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

const createMockForm = () => {
  let fieldsError: FieldError[] = [];
  let uploadedColumnsValue: unknown = [];

  const form = {
    getFieldsError: vi.fn(() => fieldsError),
    setFieldsValue: vi.fn(),
    getFieldValue: vi.fn((key: string) =>
      key === 'uploadedColumns' ? uploadedColumnsValue : undefined,
    ),
    validateFields: vi.fn().mockResolvedValue(undefined),
  };

  return {
    form: form as unknown as FormInstance<CreateSchemaFormData>,
    setUploadedFormRows: (rows: unknown) => {
      uploadedColumnsValue = rows;
    },
    setFieldsError: (next: FieldError[]) => {
      fieldsError = next;
    },
    mocks: form,
  };
};

afterEach(async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
});

const TestHarness = ({
  form,
  children,
}: {
  form: FormInstance<CreateSchemaFormData>;
  children: ReactNode;
}) => (
  <CreateSchemaFormProvider form={form}>{children}</CreateSchemaFormProvider>
);

describe('useCreateSchemaFormContext', () => {
  test('throws when used outside CreateSchemaFormProvider', () => {
    expect(() => renderHook(() => useCreateSchemaFormContext())).toThrow(
      'useCreateSchemaFormContext must be used within CreateSchemaFormProvider',
    );
  });
});

describe('CreateSchemaFormProvider', () => {
  test('exposes context value and updates schema columns', () => {
    const { form } = createMockForm();
    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

    expect(result.current.schemaColumns).toEqual([]);
    expect(result.current.form).toBe(form);
    expect(result.current.formValidation).toBeDefined();

    act(() => {
      result.current.handleSetSchemaColumns([validRow('s1')]);
    });
    expect(result.current.schemaColumns).toEqual([validRow('s1')]);
  });

  test('changedValuesTriggerInvalidTabErrors reflects tab list keys', () => {
    const { form } = createMockForm();
    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

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
    const { form } = createMockForm();
    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

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
    const { form, setFieldsError } = createMockForm();
    setFieldsError([fieldErr(['uploadedColumns', 0, 'name'], 'from form')]);

    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

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

  test('handleValidate refreshes validationErrors asynchronously', async () => {
    const { form, setFieldsError } = createMockForm();
    setFieldsError([fieldErr(['name'], 'detail err')]);

    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

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
    const validateFields = vi.fn().mockResolvedValue(undefined);
    const form = {
      getFieldsError: vi.fn(() => []),
      setFieldsValue: vi.fn(),
      getFieldValue: vi.fn((key: string) => {
        if (key === 'uploadedColumns') return [validRow('u1')];
        if (key === 'invalidColumns') return [invalidZodRow('i1')];
        if (key === 'schemaColumns') return [validRow('s1')];
        return undefined;
      }),
      validateFields,
    } as unknown as FormInstance<CreateSchemaFormData>;

    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

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
    const { form, mocks } = createMockForm();
    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

    act(() => {
      result.current.handleSetUploadedSchemaColumns([]);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.validateFields.mock.calls.length).toBe(0);
  });

  test('layout effect validates with uploaded/invalid column list paths only', async () => {
    const { form, mocks } = createMockForm();
    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

    act(() => {
      result.current.handleSetUploadedSchemaColumns([
        validRow('u1'),
        invalidZodRow('i1'),
      ]);
    });

    await waitFor(() => {
      expect(mocks.validateFields).toHaveBeenCalled();
    });

    const listArg = mocks.validateFields.mock.calls[0]?.[0] as unknown;
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
    const { form } = createMockForm();
    const { result, unmount } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

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
    const { form, mocks } = createMockForm();
    mocks.validateFields.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useCreateSchemaFormContext(), {
      wrapper: ({ children }) => (
        <TestHarness form={form}>{children}</TestHarness>
      ),
    });

    act(() => {
      result.current.handleValidate();
    });

    await waitFor(() => {
      expect(mocks.getFieldsError).toHaveBeenCalled();
    });
  });

  describe('handleUpdateInvalidUploadedSchemaColumn', () => {
    test('appends and replaces invalid entries by row id', async () => {
      const { form } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

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
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('only')]);
      });

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(
          validRow('missing'),
        );
      });

      expect(mocks.setFieldsValue).not.toHaveBeenCalled();
    });

    test('promotes valid row: updates state, form fields, and survives validateFields rejection', async () => {
      const { form, mocks } = createMockForm();
      act(() => {
        mocks.validateFields.mockRejectedValueOnce(new Error('field invalid'));
      });

      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const broken = invalidZodRow('fix1');
      const fixed = validRow('fix1');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([broken]);
      });

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(fixed);
      });

      expect(result.current.uploadedSchemaColumns).toEqual([fixed]);
      expect(result.current.invalidUploadedSchemaColumns).toEqual([]);
      expect(mocks.setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: expect.any(Array),
        invalidColumns: [],
      });

      await waitFor(() => {
        expect(mocks.validateFields).toHaveBeenCalled();
      });
    });

    test('promoting one row sets invalidColumns when other invalid imports remain', async () => {
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const brokenA = invalidZodRow('a1');
      const brokenB = invalidZodRow('b1');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([brokenA, brokenB]);
      });

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(validRow('a1'));
      });

      expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
      expect(result.current.invalidUploadedSchemaColumns[0]?.data.id).toBe(
        'b1',
      );
      expect(mocks.setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: expect.arrayContaining([
          expect.objectContaining({ id: 'a1', name: 'col_a1' }),
          expect.objectContaining({ id: 'b1' }),
        ]),
        invalidColumns: [expect.objectContaining({ id: 'b1' })],
      });

      await waitFor(() => {
        expect(mocks.validateFields).toHaveBeenCalled();
      });
    });

    test('schedules validation when row remains invalid', async () => {
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('v')]);
      });

      const before = mocks.validateFields.mock.calls.length;

      act(() => {
        result.current.handleUpdateInvalidUploadedSchemaColumn(
          invalidZodRow('new'),
        );
      });

      await waitFor(() => {
        expect(mocks.validateFields.mock.calls.length).toBeGreaterThan(before);
      });
    });
  });

  describe('handleUpdateUploadedSchemaColumns', () => {
    test('returns when changed values do not mention uploaded columns tree', () => {
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({ file: 1 });
      });

      expect(mocks.getFieldValue).not.toHaveBeenCalled();
    });

    test('returns when form uploadedColumns is not an array', () => {
      const { form } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const broken = invalidZodRow('b1');
      act(() => {
        result.current.handleSetUploadedSchemaColumns([broken]);
      });

      vi.mocked(form.getFieldValue).mockReturnValueOnce({ not: 'array' });

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });
    });

    test('returns when there are no invalid imported rows tracked', () => {
      const { form, setUploadedFormRows } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('only')]);
      });

      setUploadedFormRows([{ id: 'only', name: 'col_only', type: 'string' }]);
      const gfv = vi.mocked(form.getFieldValue);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      expect(gfv).toHaveBeenCalledWith('uploadedColumns');
    });

    test('merges form row into invalid import and promotes when row becomes valid', async () => {
      const { form, setUploadedFormRows, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const badImport: UploadedSchemaRow = { id: 'm1', name: '', type: '' };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows([
        { id: 'm1', name: 'fixed_name', type: 'string', attribute: [] },
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
      expect(mocks.setFieldsValue).toHaveBeenCalled();
    });

    test('uses same-index form row when entries omit id so byFormId is undefined', async () => {
      const { form, setUploadedFormRows } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const badImport: UploadedSchemaRow = { id: 'rowKey', name: '', type: '' };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows([{ name: 'col_rowKey', type: 'string' }]);

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
      const { form, setUploadedFormRows } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const noId = { name: 'x', type: 'string' } as RowSchema;
      act(() => {
        result.current.handleSetUploadedSchemaColumns([noId]);
      });

      setUploadedFormRows([null, 1, { id: 'nope' }]);

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
      const { form, setUploadedFormRows } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const badImport: UploadedSchemaRow = { id: 'idx', name: '', type: '' };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows([
        undefined,
        { name: 'from_index', type: 'string', id: 'idx' },
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
      const { form, setUploadedFormRows } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const badImport: UploadedSchemaRow = { id: 'z1', name: '', type: '' };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows([{ id: 'z1', name: 'bad name!', type: 'string' }]);

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
    });

    test('queues tab error collection after processing', async () => {
      const { form, setUploadedFormRows, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const badImport: UploadedSchemaRow = { id: 'q1', name: '', type: '' };
      act(() => {
        result.current.handleSetUploadedSchemaColumns([badImport]);
      });

      setUploadedFormRows([{ id: 'q1', name: 'still', type: '' }]);

      const n = mocks.validateFields.mock.calls.length;

      act(() => {
        result.current.handleUpdateUploadedSchemaColumns({
          uploadedColumns: [],
        });
      });

      await waitFor(() => {
        expect(mocks.validateFields.mock.calls.length).toBeGreaterThan(n);
      });
    });
  });

  describe('handleRemoveUploadedSchemaColumn', () => {
    test('no-ops without column id', () => {
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn(undefined);
      });
      expect(mocks.setFieldsValue).not.toHaveBeenCalled();
    });

    test('no-ops when id is not in uploaded or invalid lists', () => {
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('a')]);
      });

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn('ghost');
      });
      expect(mocks.setFieldsValue).not.toHaveBeenCalled();
    });

    test('removing one invalid row maps invalidColumns for remaining invalid', async () => {
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      const invA = invalidZodRow('mx');
      const invB = invalidZodRow('my');

      act(() => {
        result.current.handleSetUploadedSchemaColumns([invA, invB]);
      });

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn('mx');
      });

      expect(result.current.uploadedSchemaColumns).toEqual([invB]);
      expect(result.current.invalidUploadedSchemaColumns).toHaveLength(1);
      expect(result.current.invalidUploadedSchemaColumns[0]?.data.id).toBe(
        'my',
      );
      expect(mocks.setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: [expect.objectContaining({ id: 'my' })],
        invalidColumns: [expect.objectContaining({ id: 'my' })],
      });

      await waitFor(() => {
        expect(mocks.validateFields).toHaveBeenCalled();
      });
    });

    test('removes from uploaded and clears invalid form list when none left', async () => {
      const { form, mocks } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

      act(() => {
        result.current.handleSetUploadedSchemaColumns([validRow('r1')]);
      });

      act(() => {
        result.current.handleRemoveUploadedSchemaColumn('r1');
      });

      expect(result.current.uploadedSchemaColumns).toEqual([]);
      expect(mocks.setFieldsValue).toHaveBeenCalledWith({
        uploadedColumns: [],
        invalidColumns: [],
      });

      await waitFor(() => {
        expect(mocks.validateFields).toHaveBeenCalled();
      });
    });

    test('removes invalid-only row', () => {
      const { form } = createMockForm();
      const { result } = renderHook(() => useCreateSchemaFormContext(), {
        wrapper: ({ children }) => (
          <TestHarness form={form}>{children}</TestHarness>
        ),
      });

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
});
