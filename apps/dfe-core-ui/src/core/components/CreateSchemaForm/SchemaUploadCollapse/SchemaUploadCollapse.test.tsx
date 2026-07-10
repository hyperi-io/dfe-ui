import type { AddSchemaTableProps } from '@/core/components/CreateSchemaForm/AddSchemaTable';
import { CreateSchemaFormProvider } from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import type { CreateSchemaFormContextValue } from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context.d';
import { createEmptyValidationErrors } from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context.helpers';
import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormInstance, FormRule } from 'antd';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SchemaUploadCollapse } from './index';

const bypassFormValidation = {
  validator: async () => Promise.resolve(),
} as FormRule;

const tabLabelSpy = vi.fn(
  ({
    label,
    validationErrors,
  }: {
    label: string;
    validationErrors: string[];
  }) => (
    <span
      data-testid={`tab-label-${label.replace(/\s+/g, '-')}`}
      data-error-count={validationErrors.length}
    />
  ),
);

const addSchemaTableSpy = vi.fn((props: AddSchemaTableProps) => (
  <div data-testid="add-schema-table" data-name={props.name} />
));

vi.mock('@/core/components/TabLabel', () => ({
  TabLabel: (props: { label: string; validationErrors: string[] }) =>
    tabLabelSpy(props),
}));

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

vi.mock('@/core/components/CreateSchemaForm/UploadedSchemaTable', () => ({
  UploadedSchemaTable: () => <div data-testid="uploaded-schema-table" />,
}));

vi.mock('./SchemaUploadFileSection', () => ({
  SchemaUploadFileSection: () => (
    <div data-testid="schema-upload-file-section" />
  ),
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

const validUploadedColumn: CreateSchemaFormData['uploadedColumns'] = [
  {
    id: 'up-1',
    name: 'field_a',
    type: 'string',
    attribute: [] as string[],
    use_case: '',
    expr: '',
    comment: '',
    _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
  },
];

const renderSchemaUploadCollapse = (form?: FormInstance) => {
  const FormShell = () => {
    const [innerForm] = Form.useForm();
    const activeForm = form ?? innerForm;
    return (
      <CreateSchemaFormProvider>
        <Form form={activeForm}>
          <SchemaUploadCollapse />
        </Form>
      </CreateSchemaFormProvider>
    );
  };
  return render(<FormShell />, { wrapper });
};

const getCollapseToggleButton = (container: HTMLElement) => {
  const toggle = container.querySelector('button.absolute');
  if (!toggle) {
    throw new Error('collapse toggle button not found');
  }
  return toggle as HTMLButtonElement;
};

describe('SchemaUploadCollapse', () => {
  beforeEach(() => {
    contextPatch = { formValidation: bypassFormValidation };
    tabLabelSpy.mockClear();
    addSchemaTableSpy.mockClear();

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

  test('shows upload controls and manual schema columns when nothing is uploaded', () => {
    renderSchemaUploadCollapse();

    expect(screen.getByText('Upload from file')).toBeInTheDocument();
    expect(screen.getByText('DFE CSV')).toBeInTheDocument();
    expect(screen.getByText('ELASTIC INDEX TEMPLATE')).toBeInTheDocument();
    expect(
      screen.getByTestId('schema-upload-file-section'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-label-Schema-Columns')).toBeInTheDocument();
    expect(screen.getByTestId('add-schema-table')).toHaveAttribute(
      'data-name',
      'schemaColumns',
    );
    expect(
      screen.queryByTestId('tab-label-Uploaded-Columns'),
    ).not.toBeInTheDocument();
    expect(addSchemaTableSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'schemaColumns',
        formValidation: bypassFormValidation,
      }),
    );
  });

  test('toggles the file upload section with the chevron and title controls', async () => {
    const user = userEvent.setup();
    const { container } = renderSchemaUploadCollapse();

    expect(
      screen.getByTestId('schema-upload-file-section'),
    ).toBeInTheDocument();

    await user.click(getCollapseToggleButton(container));

    expect(
      screen.queryByTestId('schema-upload-file-section'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('DFE CSV')).not.toBeInTheDocument();

    await user.click(screen.getByText('Upload from file'));

    expect(
      screen.getByTestId('schema-upload-file-section'),
    ).toBeInTheDocument();
    expect(screen.getByText('DFE CSV')).toBeInTheDocument();
  });

  test('shows uploaded columns tab when provider initialValues include uploadedColumns', () => {
    contextPatch = {
      formValidation: bypassFormValidation,
      validationErrors: createEmptyValidationErrors(),
    };

    const FormShell = () => (
      <CreateSchemaFormProvider
        initialValues={{
          uploadedColumns: validUploadedColumn,
        }}
      >
        <Form>
          <SchemaUploadCollapse />
        </Form>
      </CreateSchemaFormProvider>
    );

    render(<FormShell />, { wrapper });

    expect(
      screen.getByTestId('tab-label-Uploaded-Columns'),
    ).toBeInTheDocument();
  });

  test('renders uploaded column tabs and passes validation errors to tab labels', async () => {
    const user = userEvent.setup();
    contextPatch = {
      uploadedSchemaColumns: validUploadedColumn,
      formValidation: bypassFormValidation,
      validationErrors: {
        ...createEmptyValidationErrors(),
        uploadedColumns: ['uploaded error'],
        schemaColumns: ['schema error'],
      },
    };

    renderSchemaUploadCollapse();

    expect(
      screen.queryByTestId('tab-label-Schema-Columns'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('tab-label-Uploaded-Columns'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('tab-label-Additional-Columns'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('uploaded-schema-table')).toBeInTheDocument();
    expect(screen.getAllByTestId('add-schema-table')).toHaveLength(1);

    await user.click(screen.getByTestId('tab-label-Additional-Columns'));

    expect(tabLabelSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Uploaded Columns',
        validationErrors: ['uploaded error'],
      }),
    );
    expect(tabLabelSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Additional Columns',
        validationErrors: ['schema error'],
      }),
    );
    expect(addSchemaTableSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'schemaColumns',
        formValidation: bypassFormValidation,
      }),
    );
  });

  test('defaults missing tab validation error buckets to empty arrays', () => {
    contextPatch = {
      uploadedSchemaColumns: validUploadedColumn,
      formValidation: bypassFormValidation,
      validationErrors: {
        ...createEmptyValidationErrors(),
        uploadedColumns: undefined as unknown as string[],
        schemaColumns: undefined as unknown as string[],
      },
    };

    renderSchemaUploadCollapse();

    expect(tabLabelSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Uploaded Columns',
        validationErrors: [],
      }),
    );
    expect(tabLabelSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Additional Columns',
        validationErrors: [],
      }),
    );
  });

  test('allows switching upload type while the upload section is expanded', async () => {
    const user = userEvent.setup();
    renderSchemaUploadCollapse();

    const uploadSection = screen.getByTestId('schema-upload-file-section');
    expect(
      within(uploadSection.parentElement as HTMLElement).getByText('DFE CSV'),
    ).toBeInTheDocument();

    await user.click(screen.getByText('ELASTIC INDEX TEMPLATE'));

    expect(screen.getByText('ELASTIC INDEX TEMPLATE')).toBeInTheDocument();
  });
});
