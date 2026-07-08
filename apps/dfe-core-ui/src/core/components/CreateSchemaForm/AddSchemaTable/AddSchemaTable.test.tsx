import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { UploadedSchemaRow } from '@/core/components/CreateSchemaForm/types';
import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { rowSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormInstance, FormRule } from 'antd';
import { Form as AntdForm } from 'antd';
import { useEffect } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AddSchemaTable,
  type AddSchemaTableProps,
  isBlankSchemaListRow,
  type RowSchema,
} from './index';

const bypassFormValidation = {
  validator: async () => Promise.resolve(),
} as FormRule;

const { wrapper } = buildTestWrapper();

const validRow = (overrides: Partial<RowSchema> = {}): RowSchema => ({
  id: 'row-1',
  name: 'user_id',
  type: 'string',
  attribute: [],
  use_case: '',
  expr: '',
  comment: '',
  _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
  ...overrides,
});

const FormColumnsProbe = ({
  listName,
  onColumns,
}: {
  listName: string;
  onColumns: (columns: unknown) => void;
}) => {
  const form = Form.useFormInstance();
  const columns = Form.useWatch(listName, form);
  useEffect(() => {
    onColumns(columns);
  }, [columns, listName, onColumns]);
  return null;
};

const CaptureFormInstance = ({
  onForm,
}: {
  onForm: (form: FormInstance) => void;
}) => {
  const form = Form.useFormInstance();
  useEffect(() => {
    onForm(form);
  }, [form, onForm]);
  return null;
};

const headerAddColumnButton = (table: HTMLElement) =>
  within(table.querySelector('.ant-table-thead') as HTMLElement).getByRole(
    'button',
  );

const rowRemoveColumnButton = (table: HTMLElement) =>
  within(table.querySelector('.ant-table-body') as HTMLElement).getAllByRole(
    'button',
  )[0];

const renderAddSchemaTable = (
  props: Partial<AddSchemaTableProps> = {},
  options?: {
    form?: FormInstance;
    initialFormValues?: Record<string, unknown>;
    listName?: string;
    onColumns?: (columns: unknown) => void;
  },
) => {
  const listName = props.name ?? options?.listName ?? 'columns';
  const form = options?.form;
  const onMount = props.onMount ?? vi.fn();
  const onRemoveRow = 'onRemoveRow' in props ? props.onRemoveRow : vi.fn();
  const onColumns = options?.onColumns ?? vi.fn();
  const { onMount: _om, onRemoveRow: _orr, ...tableProps } = props;

  const view = render(
    <Form
      form={form}
      initialValues={
        options?.initialFormValues ?? {
          [listName]: [],
        }
      }
    >
      <FormColumnsProbe listName={listName} onColumns={onColumns} />
      <AddSchemaTable
        formValidation={bypassFormValidation}
        lockedColumns={['_field_type', '__rowId', 'main_action', 'name']}
        visibleColumns={[
          'name',
          'type',
          '__rowId',
          'main_action',
          'expr',
          'comment',
        ]}
        onMount={onMount}
        {...('onRemoveRow' in props ? { onRemoveRow } : {})}
        {...tableProps}
      />
    </Form>,
    { wrapper },
  );

  return { ...view, onMount, onRemoveRow, onColumns, listName, form };
};

describe('rowSchema', () => {
  test('accepts a valid row', () => {
    expect(rowSchema.safeParse(validRow()).success).toBe(true);
  });

  test('rejects empty name and invalid identifier', () => {
    expect(rowSchema.safeParse(validRow({ name: '' })).success).toBe(false);
    expect(rowSchema.safeParse(validRow({ name: 'bad id!' })).success).toBe(
      false,
    );
  });

  test('requires type', () => {
    expect(rowSchema.safeParse(validRow({ type: '' })).success).toBe(false);
  });
});

describe('isBlankSchemaListRow', () => {
  test('returns false for non-objects', () => {
    expect(isBlankSchemaListRow(null)).toBe(false);
    expect(isBlankSchemaListRow(undefined)).toBe(false);
    expect(isBlankSchemaListRow('x')).toBe(false);
  });

  test('returns true for an empty schema list row', () => {
    expect(
      isBlankSchemaListRow({
        id: '',
        name: '',
        type: '',
        attribute: [],
        use_case: '',
        expr: '',
        comment: '',
        _field_type: SCHEMA_FIELD_TYPES.USER_DEFINED,
      }),
    ).toBe(true);
    expect(
      isBlankSchemaListRow({
        id: '',
        name: '',
        type: '',
        use_case: '',
        expr: '',
        comment: '',
        _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
      }),
    ).toBe(true);
  });

  test('returns true when _field_type is present', () => {
    expect(
      isBlankSchemaListRow({
        _field_type: SCHEMA_FIELD_TYPES.BASE,
      }),
    ).toBe(true);
  });

  test('returns false when any field is populated and ignores _field_type', () => {
    expect(isBlankSchemaListRow({ ...validRow(), name: 'x' })).toBe(false);
    expect(
      isBlankSchemaListRow({
        id: '',
        name: '',
        type: '',
        attribute: ['indexed'],
        use_case: '',
        expr: '',
        comment: '',
        _field_type: SCHEMA_FIELD_TYPES.USER_DEFINED,
      }),
    ).toBe(false);
    expect(
      isBlankSchemaListRow({
        id: '',
        name: '',
        type: '',
        attribute: undefined,
        use_case: '',
        expr: 'test',
        comment: '',
        _field_type: SCHEMA_FIELD_TYPES.BASE,
      }),
    ).toBe(false);
  });
});

describe('AddSchemaTable', { timeout: 15_000 }, () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('calls onMount once', async () => {
    const onMount = vi.fn();
    renderAddSchemaTable({ onMount });

    await waitFor(() => {
      expect(onMount).toHaveBeenCalledTimes(1);
    });
  });

  test('syncs initialValues into the form list field', async () => {
    const column = {
      id: 'c1',
      Name: 'count',
      Type: 'UInt64',
      Attribute: 'metric',
      'Index Type': 'count',
      'Expression (CTE)': 'count()',
      Comment: 'note',
      _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
    } as unknown as UploadedSchemaRow;
    const onColumns = vi.fn();
    renderAddSchemaTable(
      {
        initialValues: [column],
        visibleColumns: [
          'name',
          'type',
          '__rowId',
          'main_action',
          'use_case',
          'attribute',
          'expr',
          'comment',
        ],
      },
      { onColumns },
    );

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last?.[0]).toMatchObject({
        id: 'c1',
        name: 'count',
        type: 'UInt64',
        attribute: ['metric'],
        use_case: 'count',
        expr: 'count()',
        comment: 'note',
      });
    });
  });

  test('clears the list when empty initialValues and resetListWhenEmpty', async () => {
    const onColumns = vi.fn();
    renderAddSchemaTable(
      { initialValues: [], resetListWhenEmpty: true, name: 'customList' },
      {
        initialFormValues: {
          customList: [validRow()],
        },
        listName: 'customList',
        onColumns,
      },
    );

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0];
      expect(last).toEqual([]);
    });
  });

  test('does not reset the list when resetListWhenEmpty is false', async () => {
    const onColumns = vi.fn();
    renderAddSchemaTable(
      { initialValues: [], resetListWhenEmpty: false, name: 'customList' },
      {
        initialFormValues: {
          customList: [validRow()],
        },
        listName: 'customList',
        onColumns,
      },
    );

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(1);
      expect(last?.[0]?.name).toBe('user_id');
    });
  });

  test('adds a row from the empty state and header controls', async () => {
    const user = userEvent.setup();
    const onColumns = vi.fn();
    const { container } = renderAddSchemaTable({}, { onColumns });

    await user.click(screen.getByRole('button', { name: 'Add Column' }));

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(1);
      expect(isBlankSchemaListRow(last?.[0])).toBe(true);
    });

    const table = container.querySelector('.ant-table');
    expect(table).toBeTruthy();
    await user.click(headerAddColumnButton(table as HTMLElement));

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(2);
    });
  });

  test('removes a row when list values are missing from the form store', async () => {
    const user = userEvent.setup();
    const onColumns = vi.fn();
    let capturedForm: FormInstance | undefined;
    const onForm = (f: FormInstance) => {
      capturedForm = f;
    };

    const Harness = () => {
      const [formInstance] = AntdForm.useForm<{ columns: RowSchema[] }>();
      return (
        <Form form={formInstance} initialValues={{ columns: [] }}>
          <CaptureFormInstance onForm={onForm} />
          <FormColumnsProbe listName="columns" onColumns={onColumns} />
          <AddSchemaTable
            formValidation={bypassFormValidation}
            initialValues={[validRow({ id: 'ghost' })]}
          />
        </Form>
      );
    };

    const harnessView = render(<Harness />, { wrapper });
    const table = harnessView.container.querySelector('.ant-table');

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(1);
      expect(capturedForm).toBeDefined();
    });

    vi.spyOn(capturedForm!, 'getFieldValue').mockReturnValue(undefined);

    await user.click(rowRemoveColumnButton(table as HTMLElement));

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(0);
    });
  });

  test('removes a row without onRemoveRow callback', async () => {
    const user = userEvent.setup();
    const onColumns = vi.fn();
    const { container } = renderAddSchemaTable(
      {
        initialValues: [validRow()],
        onRemoveRow: undefined,
      },
      { onColumns },
    );

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(1);
    });

    const table = container.querySelector('.ant-table');
    await user.click(rowRemoveColumnButton(table as HTMLElement));

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(0);
    });
  });

  test('removes a row and forwards the removed snapshot', async () => {
    const user = userEvent.setup();
    const onRemoveRow = vi.fn();
    const onColumns = vi.fn();
    const { container } = renderAddSchemaTable(
      {
        initialValues: [validRow({ id: 'remove-me', name: 'to_remove' })],
        onRemoveRow,
      },
      { onColumns },
    );

    await waitFor(() => {
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(1);
    });

    const table = container.querySelector('.ant-table');
    await user.click(rowRemoveColumnButton(table as HTMLElement));

    await waitFor(() => {
      expect(onRemoveRow).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'remove-me', name: 'to_remove' }),
      );
      const last = onColumns.mock.calls.at(-1)?.[0] as RowSchema[] | undefined;
      expect(last).toHaveLength(0);
    });
  });

  test('hides add/remove controls when disabled in config', async () => {
    const user = userEvent.setup();
    const { container } = renderAddSchemaTable({
      config: {
        defaultAddColumns: false,
        defaultRemoveColumns: false,
        defaultEditFields: false,
      },
      initialValues: [validRow()],
    });

    expect(
      screen.queryByRole('button', { name: 'Add Column' }),
    ).not.toBeInTheDocument();

    const row = container.querySelector('.ant-table-tbody tr');
    const deleteCell = row?.querySelectorAll('td')[0];
    expect(deleteCell?.querySelectorAll('button')).toHaveLength(0);
    expect(
      container
        .querySelector('.ant-table-thead .ant-table-cell')
        ?.querySelectorAll('button'),
    ).toHaveLength(0);

    expect(screen.getByText('user_id')).toBeInTheDocument();
    await user.click(screen.getByText('user_id'));
  });

  test('opens default edit fields from config', async () => {
    renderAddSchemaTable({
      initialValues: [validRow({ name: 'editable', comment: 'note' })],
      config: {
        defaultEditFields: [
          'name',
          'type',
          'use_case',
          'attribute',
          'expr',
          'comment',
        ],
        defaultAddColumns: true,
        defaultRemoveColumns: true,
      },
    });

    await waitFor(() => {
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });
  });

  test('defaults name and type to editing when defaultEditFields is true', async () => {
    renderAddSchemaTable({
      initialValues: [validRow({ name: 'auto_edit' })],
      config: { defaultEditFields: true },
    });

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(
        inputs.some((el) => (el as HTMLInputElement).value === 'auto_edit'),
      ).toBe(true);
    });
  });

  test('forwards table props to the underlying table', () => {
    renderAddSchemaTable({ className: 'custom-schema-table' });

    expect(document.querySelector('.custom-schema-table')).toBeInTheDocument();
    expect(screen.getByText('Add columns to your schema')).toBeInTheDocument();
  });
});
