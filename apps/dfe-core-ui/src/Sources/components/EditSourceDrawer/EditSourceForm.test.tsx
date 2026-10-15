import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { SourceDetailsProvider } from '@/Sources/contexts/SourceDetailsContext';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { TSourceUpdateRequestBody } from '@/Sources/hooks/useUpdateSource/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { EditSourceForm } from './EditSourceForm';

// The list provider picks the edited source and version off the URL.
vi.mock('next/navigation', () => {
  const searchParams = new URLSearchParams(
    'source_name=shared-probe&source_version=1.0.0',
  );
  const router = { replace: vi.fn() };
  return {
    useRouter: () => router,
    useSearchParams: () => searchParams,
    usePathname: () => '/sources',
  };
});

// Ace needs a real browser; the fetcher config editor is off this form's path.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

// jsdom has no IntersectionObserver; the source and field-map lists page on one.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const storedHeader = { type: 'common-header/timeseries', version: '1.0.0' };
const storedSchema = {
  meta_schema: null,
  meta_schema_version: null,
  ttl_days: 30,
  engine: '',
};

const sharedTableSource: TSourceVersionDetail = {
  source: 'shared-probe',
  resource_type: 'custom',
  display_name: 'Shared Probe',
  description: 'probe',
  enabled: true,
  current: '1.0.0',
  deployed_version: '1.0.0',
  selected: '1.0.0',
  versions: ['1.0.0'],
  state: 'active',
  current_table_topic_type: 'main',
  version: {
    origin: 'receiver',
    date_time: '2026-10-15',
    archive: false,
    header: storedHeader,
    schema: storedSchema,
    match: {
      field: 'data_stream.dataset',
      operator: 'equals',
      value: 'probe.log',
    },
  },
};

const sentBodies: TSourceUpdateRequestBody[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.sources.default.get.success(),
  API_CONFIG_MOCKS.fieldMaps.default.get.success(),
  API_CONFIG_MOCKS.sources.sourceVersion.get.success({
    mockedResponse: sharedTableSource,
    name: 'shared-probe',
    version: '1.0.0',
  }),
  http.put('/api/v1/sources/shared-probe', async ({ request }) => {
    sentBodies.push((await request.json()) as TSourceUpdateRequestBody);
    return HttpResponse.json({
      source: 'shared-probe',
      message: 'updated',
      current: '1.0.0',
      versions: ['1.0.0'],
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withListSourcesProvider({})
  .withWrapper(({ children }) => (
    <SourceDetailsProvider>{children}</SourceDetailsProvider>
  ));

describe('EditSourceForm', () => {
  it('saves a shared-table source with the header and schema it stores', async () => {
    const user = userEvent.setup();
    render(<EditSourceForm />, { wrapper });

    await screen.findByLabelText(/^Source Name/, {}, { timeout: 15_000 });
    expect(
      screen.queryByRole('tab', { name: 'Table Settings' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Update Source' }));

    await waitFor(() => expect(sentBodies).toHaveLength(1), {
      timeout: 10_000,
    });
    // A body without them reads as a clear to an older engine, and its pins must match the stored ones.
    expect(sentBodies[0]?.header).toEqual(storedHeader);
    expect(sentBodies[0]?.schema).toEqual(storedSchema);
  });
});
