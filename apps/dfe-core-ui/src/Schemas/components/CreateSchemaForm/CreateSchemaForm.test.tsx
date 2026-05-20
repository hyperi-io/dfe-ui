import type { RowSchema } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import type { CreateSchemaFormContextValue } from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context.d';
import type { InvalidColumns } from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context.d';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormRule } from 'antd';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { rowSchema } from './AddSchemaTable';
import { CreateSchemaForm } from './index';

const convertCsvMock = vi.hoisted(() => vi.fn());
const elasticConvertMutateMock = vi.hoisted(() => vi.fn());

vi.mock('@/Schemas/server/actions/convertCsv', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/Schemas/server/actions/convertCsv')
    >();
  return {
    ...actual,
    convertCsv: convertCsvMock,
  };
});

vi.mock('./UploadedSchemaTable', () => ({
  UploadedSchemaTable: () => <div data-testid="uploaded-schema-table" />,
}));

vi.mock('@/Schemas/hooks/useElasticConvert', () => ({
  useElasticConvert: ({
    onSuccess,
    onError,
  }: {
    onSuccess?: (data: unknown) => void;
    onError?: (error: Error) => void;
  }) => ({
    mutate: elasticConvertMutateMock.mockImplementation(
      ({ file }: { file: File }) => {
        if (file.name.endsWith('.bad.json')) {
          onError?.(new Error('Elastic conversion failed'));
          return;
        }
        onSuccess?.([
          {
            name: 'elastic_field',
            type: 'keyword',
            attribute: ['indexed'],
            use_case: 'search',
            expr: '',
          },
        ]);
      },
    ),
    isPending: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
  }),
}));

let contextPatch: Partial<CreateSchemaFormContextValue> | null = null;

const useCreateSchemaFormContextActual = vi.hoisted(() => ({
  current: null as (() => CreateSchemaFormContextValue) | null,
}));

vi.mock('./contexts/CreateSchemaForm.context', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('./contexts/CreateSchemaForm.context')
    >();
  useCreateSchemaFormContextActual.current = actual.useCreateSchemaFormContext;
  return {
    ...actual,
    useCreateSchemaFormContext: () => {
      const value = useCreateSchemaFormContextActual.current!();
      return contextPatch ? { ...value, ...contextPatch } : value;
    },
  };
});

const validRow = (
  id: string,
  overrides: Partial<RowSchema> = {},
): RowSchema => ({
  id,
  name: `col_${id}`,
  type: 'string',
  ...overrides,
});

const invalidZodRow = (id: string): RowSchema =>
  ({
    id,
    name: 'bad id!',
    type: 'string',
  }) as RowSchema;

const handleFormValuesChange = vi.fn();

const bypassFormValidation = {
  validator: async () => Promise.resolve(),
} as FormRule;

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const selectElasticUploadMode = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(screen.getByText('ELASTIC INDEX TEMPLATE'));
};

const getFileInput = (container: HTMLElement) => {
  const input = container.querySelector('input[type="file"]');
  if (!input) {
    throw new Error('file input not found');
  }
  return input as HTMLInputElement;
};

/** Bypass Upload `accept` filtering in jsdom (e.g. .txt while mode expects .csv). */
const uploadFileToInput = (
  container: HTMLElement,
  file: File,
) => {
  const input = getFileInput(container);
  fireEvent.change(input, { target: { files: [file] } });
};

describe('CreateSchemaForm', () => {
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

    contextPatch = null;
    handleFormValuesChange.mockClear();
    convertCsvMock.mockReset();
    elasticConvertMutateMock.mockClear();
  });

  const expectFileFieldError = async (message: string) => {
    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
    expect(screen.queryByText('Uploaded Columns')).not.toBeInTheDocument();
  };

  test('renders form fields, upload section, and default submit label', () => {
    render(<CreateSchemaForm />, { wrapper });

    expect(screen.getByLabelText('Path')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Upload from file')).toBeInTheDocument();
    expect(screen.getByText('DFE CSV')).toBeInTheDocument();
    expect(screen.getByLabelText('CSV File')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reset Form' }),
    ).not.toBeInTheDocument();
  });

  test('renders custom button label, reset control, and pending state', () => {
    render(
      <CreateSchemaForm buttonLabel="Create schema" hasReset isPending />,
      { wrapper },
    );

    const submit = screen.getByText('Create schema').closest('button');
    const reset = screen.getByRole('button', { name: 'Reset Form' });

    expect(submit).toBeTruthy();
    expect(submit).toBeDisabled();
    expect(reset).toBeDisabled();
  });

  test('clears form error and forwards value changes to context', async () => {
    const user = userEvent.setup();
    contextPatch = {
      uploadedSchemaColumns: [invalidZodRow('u1')],
      handleFormValuesChange,
      formValidation: bypassFormValidation,
    };

    render(<CreateSchemaForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      screen.getByText(
        'There are validation errors in the uploaded columns. Please fix them and try again.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter name'), {
      target: { value: 'schema_x' },
    });

    await waitFor(() => {
      expect(
        screen.queryByText(
          'There are validation errors in the uploaded columns. Please fix them and try again.',
        ),
      ).not.toBeInTheDocument();
    });
    expect(handleFormValuesChange).toHaveBeenCalled();
  });

  test('shows uploaded columns error when invalidUploadedSchemaColumns is non-empty', async () => {
    const user = userEvent.setup();
    const invalidParse = rowSchema.safeParse(invalidZodRow('u1'));
    if (invalidParse.success) {
      throw new Error('expected invalid row');
    }
    contextPatch = {
      uploadedSchemaColumns: [validRow('u1')],
      invalidUploadedSchemaColumns: [
        {
          success: false,
          error: invalidParse.error,
          data: validRow('u1'),
        },
      ] as InvalidColumns[],
      formValidation: bypassFormValidation,
    };

    render(<CreateSchemaForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByText(
        'There are validation errors in the uploaded columns. Please fix them and try again.',
      ),
    ).toBeInTheDocument();
  });

  test('shows schema columns error when manual columns fail validation', async () => {
    const user = userEvent.setup();
    contextPatch = {
      schemaColumns: [invalidZodRow('s1')],
      formValidation: bypassFormValidation,
    };

    render(<CreateSchemaForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByText(
        'There are validation errors in the schema columns. Please fix them and try again.',
      ),
    ).toBeInTheDocument();
  });

  test('calls onFinish with parsed columns when validation passes', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    const uploaded = validRow('up-1');
    const manual = validRow('man-1');
    contextPatch = {
      uploadedSchemaColumns: [uploaded],
      schemaColumns: [
        manual,
        {
          id: '',
          name: '',
          type: '',
          attribute: [],
          use_case: '',
          expr: '',
          comment: '',
          imported: false,
        } as RowSchema,
      ],
      formValidation: bypassFormValidation,
    };

    render(<CreateSchemaForm onFinish={onFinish} />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadedColumns: [uploaded],
        schemaColumns: [manual],
      }),
    );
  });

  test('submit succeeds without onFinish handler', async () => {
    const user = userEvent.setup();

    render(<CreateSchemaForm />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.queryByText(/There are validation errors/),
    ).not.toBeInTheDocument();
  });

  describe('file upload', () => {
    test('imports schema columns from a DFE CSV file', async () => {
      const user = userEvent.setup();
      convertCsvMock.mockResolvedValue([
        { name: 'csv_field', type: 'string', attribute: ['dim'] },
      ]);

      const { container } = render(<CreateSchemaForm />, { wrapper });

      const csvFile = new File(['name,type\nfoo,string'], 'schema.csv', {
        type: 'text/csv',
      });
      await user.upload(getFileInput(container), csvFile);

      await waitFor(() => {
        expect(convertCsvMock).toHaveBeenCalledWith(csvFile);
      });

      await waitFor(() => {
        expect(screen.getByText('Uploaded Columns')).toBeInTheDocument();
        expect(screen.getByTestId('uploaded-schema-table')).toBeInTheDocument();
      });
    });

    test('imports schema columns from an Elastic index template JSON file', async () => {
      const user = userEvent.setup();

      const { container } = render(<CreateSchemaForm />, { wrapper });

      await selectElasticUploadMode(user);

      expect(screen.getByLabelText('JSON File')).toBeInTheDocument();

      const jsonFile = new File(['{"index_patterns":[]}'], 'template.json', {
        type: 'application/json',
      });
      await user.upload(getFileInput(container), jsonFile);

      await waitFor(() => {
        expect(elasticConvertMutateMock).toHaveBeenCalledWith({
          file: jsonFile,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Uploaded Columns')).toBeInTheDocument();
        expect(screen.getByTestId('uploaded-schema-table')).toBeInTheDocument();
      });
    });

    test('shows validation error when a non-CSV file is uploaded in CSV mode', async () => {
      convertCsvMock.mockRejectedValue(
        new Error('Upload must be a CSV file (text/csv or a .csv filename).'),
      );

      const { container } = render(<CreateSchemaForm />, { wrapper });

      const textFile = new File(['not csv'], 'notes.txt', {
        type: 'text/plain',
      });
      uploadFileToInput(container, textFile);

      await expectFileFieldError(
        'Upload must be a CSV file (text/csv or a .csv filename).',
      );
      expect(convertCsvMock).toHaveBeenCalledWith(textFile);
    });

    test('shows validation error when CSV conversion fails', async () => {
      const user = userEvent.setup();
      convertCsvMock.mockRejectedValue(
        new Error('Could not parse CSV content.'),
      );

      const { container } = render(<CreateSchemaForm />, { wrapper });

      const csvFile = new File(['bad'], 'schema.csv', { type: 'text/csv' });
      await user.upload(getFileInput(container), csvFile);

      await expectFileFieldError('Could not parse CSV content.');
    });

    test('shows validation error when a non-JSON file is uploaded in elastic template mode', async () => {
      const user = userEvent.setup();

      const { container } = render(<CreateSchemaForm />, { wrapper });

      await selectElasticUploadMode(user);

      await waitFor(() => {
        expect(screen.getByLabelText('JSON File')).toBeInTheDocument();
      });

      const textFile = new File(['not json'], 'notes.txt', {
        type: 'text/plain',
      });
      uploadFileToInput(container, textFile);

      await expectFileFieldError(
        'Upload must be a JSON file (text/json or a .json filename).',
      );
      expect(elasticConvertMutateMock).not.toHaveBeenCalled();
    });

    test('shows validation error when elastic index template conversion fails', async () => {
      const user = userEvent.setup();

      const { container } = render(<CreateSchemaForm />, { wrapper });

      await selectElasticUploadMode(user);

      const jsonFile = new File(['{}'], 'template.bad.json', {
        type: 'application/json',
      });
      await user.upload(getFileInput(container), jsonFile);

      await expectFileFieldError('Elastic conversion failed');
    });
  });
});
