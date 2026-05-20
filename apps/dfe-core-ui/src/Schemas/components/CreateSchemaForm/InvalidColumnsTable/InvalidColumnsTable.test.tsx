import {
  CreateSchemaFormProvider,
  useCreateSchemaFormContext,
} from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import type { CreateSchemaFormContextValue } from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context.d';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
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
