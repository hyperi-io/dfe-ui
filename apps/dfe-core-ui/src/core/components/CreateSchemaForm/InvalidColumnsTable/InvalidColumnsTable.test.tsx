import {
  CreateSchemaFormProvider,
  useCreateSchemaFormContext,
} from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import type { CreateSchemaFormContextValue } from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context.d';
import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { Form } from '@/core/components/Form';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import z from 'zod';
import { InvalidColumnsTable } from './index';

const { wrapper } = buildTestWrapper()
  .withContext<Partial<CreateSchemaFormContextValue>>({
    provider: CreateSchemaFormProvider,
    value: {
      invalidUploadedSchemaColumns: [
        {
          success: false,
          // @ts-expect-error - testValue override
          error: new z.ZodError([
            { code: 'custom', path: [], message: 'testValue override' },
          ]),
          data: {
            name: 'override-name',
            type: 'string',
            id: 'override-id',
            _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
          },
        },
      ],
    },
  })
  .withWrapper(({ children }) => {
    const { form } = useCreateSchemaFormContext();
    return <Form form={form}>{children}</Form>;
  });

describe('InvalidColumnsTable', () => {
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

  test('renders', () => {
    render(<InvalidColumnsTable />, { wrapper });

    expect(screen.getByText('Invalid Columns')).toBeInTheDocument();
  });
});
