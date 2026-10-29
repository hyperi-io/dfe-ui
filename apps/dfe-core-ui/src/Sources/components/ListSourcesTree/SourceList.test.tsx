import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
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
import { SourceList } from './SourceList';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/sources',
}));

// The Add Source drawer reaches the code editor, which a jsdom run has no ace for.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));
vi.mock('./hooks/useTransformSourceToTree', () => ({
  useTransformSourceToTree: () => ({
    tree: [],
    notificationContextHolder: null,
  }),
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withReactQuery()
  .withListSourcesProvider();

const refuse = (status: number, body: Record<string, string>) =>
  http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, () =>
    HttpResponse.json(body, { status }),
  );

describe('SourceList', () => {
  it('says why when the engine refuses the list with a 403', async () => {
    server.use(
      refuse(403, {
        code: 'forbidden',
        message: "Role 'viewer' lacks the scope 'source:read'",
      }),
    );
    render(<SourceList />, { wrapper });

    expect(
      await screen.findByText("Role 'viewer' lacks the scope 'source:read'"),
    ).toBeInTheDocument();
    expect(
      screen.getByText('You do not have sufficient permissions'),
    ).toBeInTheDocument();
    expect(screen.queryByText('No sources found')).not.toBeInTheDocument();
  });

  it('shows the engine reason, not an empty list, when the list fails otherwise', async () => {
    server.use(
      refuse(500, { code: 'internal_error', message: 'the registry is down' }),
    );
    render(<SourceList />, { wrapper });

    expect(await screen.findByText('the registry is down')).toBeInTheDocument();
    expect(
      screen.getByText('There was an unexpected error loading the sources'),
    ).toBeInTheDocument();
    expect(screen.queryByText('No sources found')).not.toBeInTheDocument();
  });

  it('says there are no sources when the engine answers with none', async () => {
    server.use(
      API_CONFIG_MOCKS.sources.default.get.success({
        mockedResponse: {
          items: [],
          objects: { items: [], children: {} },
          total: 0,
          page: 1,
          per_page: 10,
          total_pages: 1,
          next_page: null,
          prev_page: null,
        },
      }),
    );
    render(<SourceList />, { wrapper });

    expect(await screen.findByText('No sources found')).toBeInTheDocument();
  });
});
