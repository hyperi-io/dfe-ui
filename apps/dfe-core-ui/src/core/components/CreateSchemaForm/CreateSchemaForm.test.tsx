import { CreateSchemaReviewProvider } from '@/core/contexts/CreateSchemaReviewContext';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CreateSchemaForm } from './index';

vi.mock('@/core/contexts/ListSchemasContext', () => ({
  useListSchemasContext: vi.fn(() => ({
    schemaTypesScope: ['meta'],
  })),
}));

vi.mock('./SchemaUploadCollapse', () => ({
  SchemaUploadCollapse: () => (
    <div data-testid="schema-upload-collapse">Upload section</div>
  ),
}));

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withWrapper(({ children }) => (
    <CreateSchemaReviewProvider>{children}</CreateSchemaReviewProvider>
  ));

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
  });

  test('renders schema detail fields, upload section, and submit control', () => {
    render(<CreateSchemaForm />, { wrapper });

    expect(screen.getByLabelText(/^Path/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Version/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument();
    expect(screen.getByTestId('schema-upload-collapse')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
