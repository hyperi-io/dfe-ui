import { type AddSchemaTableProps } from '@/core/components/CreateSchemaForm/AddSchemaTable';
import { CreateSchemaFormProvider } from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import type {
  CreateSchemaFormContextValue,
  InvalidColumns,
} from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context.d';
import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { UploadedSchemaRow } from '@/core/components/CreateSchemaForm/types';
import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { rowSchema } from '@/core/validationSchemas/CreateSchemaForm/AddSchemaTable.schema';
import { render, screen } from '@testing-library/react';
import type { FormInstance, FormRule } from 'antd';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { UploadedSchemaTable } from './index';

const bypassFormValidation = {
  validator: async () => Promise.resolve(),
} as FormRule;

const addSchemaTableSpy = vi.fn((props: AddSchemaTableProps) => (
  <div data-testid="add-schema-table" data-name={props.name} />
));

vi.mock(
  '@/core/components/CreateSchemaForm/AddSchemaTable',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/core/components/CreateSchemaForm/AddSchemaTable')
      >();
    return {
      ...actual,
      AddSchemaTable: (props: AddSchemaTableProps) => addSchemaTableSpy(props),
    };
  },
);

vi.mock('@/core/components/CreateSchemaForm/InvalidColumnsTable', () => ({
  InvalidColumnsTable: () => <div data-testid="invalid-columns-table" />,
}));

let contextPatch: Partial<CreateSchemaFormContextValue> | null = null;

const useCreateSchemaFormContextActual = vi.hoisted(() => ({
  current: null as (() => CreateSchemaFormContextValue) | null,
}));

vi.mock(
  '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context')
      >();
    useCreateSchemaFormContextActual.current =
      actual.useCreateSchemaFormContext;
    return {
      ...actual,
      useCreateSchemaFormContext: () => {
        const value = useCreateSchemaFormContextActual.current!();
        return contextPatch ? { ...value, ...contextPatch } : value;
      },
    };
  },
);

const { wrapper } = buildTestWrapper().withTheme();

const validUploadedColumn: UploadedSchemaRow = {
  id: 'up-1',
  name: 'field_a',
  type: 'string',
  attribute: [],
  use_case: '',
  expr: '',
  comment: '',
  _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
};

const renderUploadedSchemaTable = (form?: FormInstance) => {
  const FormShell = () => {
    const [innerForm] = Form.useForm();
    const activeForm = form ?? innerForm;
    return (
      <CreateSchemaFormProvider>
        <Form form={activeForm}>
          <UploadedSchemaTable />
        </Form>
      </CreateSchemaFormProvider>
    );
  };
  return render(<FormShell />, { wrapper });
};

describe('UploadedSchemaTable', () => {
  const handleRemoveUploadedSchemaColumn = vi.fn();

  beforeEach(() => {
    contextPatch = {
      formValidation: bypassFormValidation,
      uploadedSchemaColumns: [validUploadedColumn],
      invalidUploadedSchemaColumns: [],
      handleRemoveUploadedSchemaColumn,
    };
    addSchemaTableSpy.mockClear();
    handleRemoveUploadedSchemaColumn.mockClear();
  });

  test('renders only the valid columns table when there are no invalid columns', () => {
    renderUploadedSchemaTable();

    expect(
      screen.queryByTestId('invalid-columns-table'),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Uploaded Columns')).not.toBeInTheDocument();
    expect(screen.getByTestId('add-schema-table')).toHaveAttribute(
      'data-name',
      'uploadedColumns',
    );
    expect(addSchemaTableSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'uploadedColumns',
        initialValues: [validUploadedColumn],
        formValidation: bypassFormValidation,
        config: {
          defaultEditFields: false,
          defaultAddColumns: false,
          defaultRemoveColumns: true,
        },
        pagination: {
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
        },
      }),
    );
  });

  test('renders invalid columns section and uploaded columns label when invalid columns exist', () => {
    const invalidParse = rowSchema.safeParse({
      ...validUploadedColumn,
      name: 'bad id!',
    });
    if (invalidParse.success) {
      throw new Error('expected invalid row');
    }

    contextPatch = {
      ...contextPatch,
      invalidUploadedSchemaColumns: [
        {
          success: false,
          error: invalidParse.error,
          data: validUploadedColumn,
        },
      ] as InvalidColumns[],
    };

    renderUploadedSchemaTable();

    expect(screen.getByTestId('invalid-columns-table')).toBeInTheDocument();
    expect(screen.getByText('Uploaded Columns')).toBeInTheDocument();
    expect(screen.getByTestId('add-schema-table')).toBeInTheDocument();
  });

  test('forwards string row ids to handleRemoveUploadedSchemaColumn', () => {
    renderUploadedSchemaTable();

    const { onRemoveRow } = addSchemaTableSpy.mock.calls[0][0];
    onRemoveRow?.({ id: 'row-abc' });

    expect(handleRemoveUploadedSchemaColumn).toHaveBeenCalledWith('row-abc');
  });

  test('passes undefined when remove row id is not a string', () => {
    renderUploadedSchemaTable();

    const { onRemoveRow } = addSchemaTableSpy.mock.calls[0][0];

    // @ts-expect-error - test data
    onRemoveRow?.({ id: 42 });
    onRemoveRow?.({ id: undefined });
    onRemoveRow?.({});

    expect(handleRemoveUploadedSchemaColumn).toHaveBeenCalledWith(undefined);
    expect(handleRemoveUploadedSchemaColumn).toHaveBeenCalledTimes(3);
  });
});
