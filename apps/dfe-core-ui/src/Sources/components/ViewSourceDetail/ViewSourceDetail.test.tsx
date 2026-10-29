import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { SourceDetailsProvider } from '@/Sources/contexts/SourceDetailsContext';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ViewSourceDetail } from '.';

const { searchParamsRef } = vi.hoisted(() => ({
  searchParamsRef: { current: new URLSearchParams() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => searchParamsRef.current,
  usePathname: () => '/sources',
}));

// The detail tabs reach the code editor, which a jsdom run has no ace for.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));
vi.mock('@/Sources/components/ViewSourceTabs', () => ({
  ViewSourceDetailTabs: () => null,
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const server = setupServer(
  http.get('/api/v1/sources', () =>
    HttpResponse.json({
      items: [
        {
          name: 'okta',
          current: '1.0.0',
          versions: ['1.0.0'],
          resource_type: 'custom',
          display_name: 'Okta',
          enabled: true,
        },
      ],
      objects: { items: [], children: {} },
      total: 1,
      page: 1,
      per_page: 10,
      total_pages: 1,
      next_page: null,
      prev_page: null,
    }),
  ),
  http.get('/api/v1/sources/:name/versions/:version', ({ params }) =>
    HttpResponse.json(
      { code: 'not_found', message: `Source ${String(params.name)} not found` },
      { status: 404 },
    ),
  ),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  searchParamsRef.current = new URLSearchParams();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withListSourcesProvider()
  .withWrapper(({ children }) => (
    <SourceDetailsProvider>{children}</SourceDetailsProvider>
  ));

describe('ViewSourceDetail', () => {
  it('asks for a pick, not for `main`, when the engine has no main source', async () => {
    render(<ViewSourceDetail />, { wrapper });

    expect(await screen.findByText('No source selected')).toBeInTheDocument();
    expect(screen.queryByText('Source main not found')).not.toBeInTheDocument();
  });

  it('still says so when a source the reader named is not there', async () => {
    searchParamsRef.current = new URLSearchParams('source_name=ghost');
    render(<ViewSourceDetail />, { wrapper });

    expect(
      await screen.findByText('Source ghost not found'),
    ).toBeInTheDocument();
    expect(screen.queryByText('No source selected')).not.toBeInTheDocument();
  });
});
