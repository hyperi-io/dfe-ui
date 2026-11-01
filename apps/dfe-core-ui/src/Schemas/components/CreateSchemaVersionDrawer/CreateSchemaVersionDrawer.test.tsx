import { ListSchemasProvider } from '@/core/contexts/ListSchemasContext';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { CreateSchemaVersionDrawer } from '.';
import {
  BASE_SCHEMA_PATH,
  BASE_SCHEMA_VERSION,
  FILTERED_PAGE,
  fullRead,
  server,
} from './CreateSchemaVersionDrawer.mocks';

// The review step's YAML view loads the Ace editor, which needs a browser global.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  fullRead.fails = true;
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withWrapper(({ children }) => (
    <ListSchemasProvider schemaTypes={['custom']}>
      {children}
    </ListSchemasProvider>
  ));

const openDrawer = async (user: ReturnType<typeof userEvent.setup>) => {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(
      `schema_path=${BASE_SCHEMA_PATH}&schema_version=${BASE_SCHEMA_VERSION}`,
    ) as ReturnType<typeof useSearchParams>,
  );
  render(<CreateSchemaVersionDrawer schema={FILTERED_PAGE} />, { wrapper });
  await user.click(
    await screen.findByRole(
      'button',
      { name: 'Add Schema Version' },
      { timeout: 5000 },
    ),
  );
};

describe('CreateSchemaVersionDrawer', () => {
  it('does not offer the form on the filtered page when the full read fails', async () => {
    const user = userEvent.setup();
    await openDrawer(user);

    expect(
      await screen.findByText(
        /could not be read in full/i,
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Review Schema Version' }),
    ).not.toBeInTheDocument();
  });

  it('shows every column once Retry reads the schema in full', async () => {
    const user = userEvent.setup();
    await openDrawer(user);

    const retry = await screen.findByRole(
      'button',
      { name: 'Retry' },
      { timeout: 5000 },
    );
    fullRead.fails = false;
    await user.click(retry);

    await user.click(
      await screen.findByRole(
        'tab',
        { name: 'Schema Columns' },
        { timeout: 5000 },
      ),
    );
    expect(
      await screen.findByText('log_offset', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/could not be read in full/i)).toBeNull();
  });
});
