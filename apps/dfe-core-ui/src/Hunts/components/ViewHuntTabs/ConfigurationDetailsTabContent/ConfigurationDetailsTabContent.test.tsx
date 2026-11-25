import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import {
  formatEpochSecondsAgo,
  formatEpochSecondsLocal,
} from '@/core/helpers/date.helpers';
import type { THuntListItem } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { ConfigurationDetailsTabContent } from '.';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const listItem = (extra: Partial<THuntListItem> = {}) =>
  ({
    name: 'my_hunt',
    display_name: 'My Hunt',
    source_table: 'windows_audit',
    target_table: 'hunts',
    customer: 'org_a',
    cron: '0 * * * *',
    rules: [],
    running: false,
    too_aggressive: false,
    run_requested: false,
    enabled: true,
    auto_disabled_at: null,
    auto_disabled_reason: '',
    error: '',
    ...extra,
  }) satisfies THuntListItem;

const listing = (items: THuntListItem[]) =>
  server.use(
    http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, ({ request }) =>
      HttpResponse.json(pageOf(items, request)),
    ),
  );

// The value shown beside a label of the detail list.
const valueOf = (label: string) =>
  screen.getByText(label).nextElementSibling as HTMLElement;

const hunt = (cron: THuntDetailResponse['cron']): THuntDetailResponse => ({
  name: 'my_hunt',
  display_name: 'My Hunt',
  cron,
  log_buffer: 60,
  global_target_table_name: null,
  global_source_table_name: 'windows_audit',
  customers: ['org_a'],
  rules: [],
  customer_tenant_ids: {},
  checkpoint_timestamp_field: null,
  scheduling_mode: null,
  min_interval_seconds: null,
  explain_queries: null,
  enabled: true,
  auto_disabled_reason: '',
  error: '',
});

describe('ConfigurationDetailsTabContent cron', () => {
  beforeEach(() => listing([listItem()]));

  it.each([
    { case: 'a single expression', cron: '0 * * * *', shown: '0 * * * *' },
    {
      case: 'every expression of a list, apart',
      cron: ['0 * * * *', '0 0 * * *'],
      shown: '0 * * * *, 0 0 * * *',
    },
  ])('shows $case', ({ cron, shown }) => {
    render(<ConfigurationDetailsTabContent {...hunt(cron)} />, { wrapper });

    expect(screen.getByText(shown)).toBeInTheDocument();
  });

  it('shows None when the hunt has no expression', () => {
    render(<ConfigurationDetailsTabContent {...hunt([])} />, { wrapper });

    expect(screen.getAllByText('None').length).toBeGreaterThan(0);
  });
});

const RAN_AT = 1_790_516_564;

describe('ConfigurationDetailsTabContent run state', () => {
  it.each([
    {
      case: 'a hunt that never ran',
      items: [listItem({ last_run: null, last_run_rows: null })],
      lastRun: 'Never run',
      rows: 'None',
    },
    {
      case: 'a hunt that ran',
      items: [listItem({ last_run: RAN_AT, last_run_rows: 1234 })],
      lastRun: `${formatEpochSecondsLocal(RAN_AT)}${formatEpochSecondsAgo(RAN_AT)}`,
      rows: '1,234',
    },
    {
      case: 'a run that wrote no rows',
      items: [listItem({ last_run: RAN_AT, last_run_rows: 0 })],
      lastRun: `${formatEpochSecondsLocal(RAN_AT)}${formatEpochSecondsAgo(RAN_AT)}`,
      rows: '0',
    },
    {
      case: 'a run that is queued',
      items: [
        listItem({ last_run: RAN_AT, last_run_rows: 5, run_requested: true }),
      ],
      lastRun: `${formatEpochSecondsLocal(RAN_AT)}${formatEpochSecondsAgo(RAN_AT)}Run queued`,
      rows: '5',
    },
    {
      case: 'a run that is going',
      items: [listItem({ last_run: null, running: true })],
      lastRun: 'Never runRunning now',
      rows: 'None',
    },
    {
      case: 'a hunt the list does not carry',
      items: [listItem({ name: 'someone_else' })],
      lastRun: 'Not available',
      rows: 'Not available',
    },
  ])('shows $case', async ({ items, lastRun, rows }) => {
    listing(items);
    render(<ConfigurationDetailsTabContent {...hunt('0 * * * *')} />, {
      wrapper,
    });

    await waitFor(() =>
      expect(valueOf('Last Run:')).toHaveTextContent(lastRun),
    );
    expect(valueOf('Rows Written:')).toHaveTextContent(rows);
  });

  it('says Not available when the engine fails the read', async () => {
    server.use(API_CONFIG_MOCKS.hunts.default.get.error({ status: 500 }));
    render(<ConfigurationDetailsTabContent {...hunt('0 * * * *')} />, {
      wrapper,
    });

    await waitFor(() =>
      expect(valueOf('Last Run:')).toHaveTextContent('Not available'),
    );
  });
});
