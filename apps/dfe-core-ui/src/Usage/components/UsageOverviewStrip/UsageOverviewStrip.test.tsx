import { RbacProtected } from '@/core/components/RbacProtected';
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TUsageOverview } from '@/Usage/hooks/useFetchUsageOverview/types';
import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UsageOverviewStrip, UsageOverviewTiles } from '.';
import { formatBytes, formatUsageValue } from './format';

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.usage.overview.get.success(),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const tile = (name: string) =>
  within(screen.getByRole('list', { name: 'Usage' })).getByRole('listitem', {
    name,
  });

describe('UsageOverviewStrip', () => {
  it('shows each metric at its highest in the last 7 days, and links the Overview dashboard', async () => {
    render(<UsageOverviewStrip />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: 'Overview' }),
    ).toBeInTheDocument();
    await screen.findByRole('list', { name: 'Usage' });
    expect(tile('Cores deployed')).toHaveTextContent('12');
    expect(tile('Cores deployed')).toHaveTextContent(
      'Highest in the last 7 days, 22 Oct',
    );
    expect(tile('Data ingested')).toHaveTextContent('1.25 GB/day');
    expect(tile('Events per second')).toHaveTextContent('4,321.5/s');
    expect(screen.getByRole('link', { name: 'Open Overview' })).toHaveAttribute(
      'href',
      '/observe/dashboards/default',
    );
  });

  it('says why a number is missing rather than showing a zero', () => {
    const overview: TUsageOverview = {
      orgs: ['acme'],
      from: '2026-09-25',
      to: '2026-10-24',
      highest_7d_label: 'Highest in the last 7 days',
      metrics: [
        {
          metric: 'cores_deployed',
          label: 'Cores deployed',
          unit: 'cores',
          status: 'not_permitted',
          highest_7d: null,
          latest: null,
          series: [],
        },
        {
          metric: 'events_per_second',
          label: 'Events per second',
          unit: 'events/s',
          status: 'not_measured',
          highest_7d: null,
          latest: null,
          series: [],
        },
      ],
    };
    render(<UsageOverviewTiles overview={overview} />, { wrapper });

    expect(tile('Cores deployed')).toHaveTextContent('Not available');
    expect(tile('Cores deployed')).not.toHaveTextContent('0');
    expect(tile('Events per second')).toHaveTextContent('Not measured');
  });

  it('shows nothing to a caller who may not read usage, and never asks', async () => {
    let overviewReads = 0;
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: { ...ADMIN_MOCKED_RESPONSE, permissions: [] },
      }),
      http.get('/api/v1/usage/overview', () => {
        overviewReads += 1;
        return HttpResponse.json({});
      }),
    );
    // The strip renders nothing while permissions load too, so the probe says when they have.
    const PermissionsLoaded = () => {
      const { isLoading } = RbacProtected.useRbac({
        action: RbacProtected.rbacActions.usage_read,
      });
      return isLoading ? null : <span>permissions loaded</span>;
    };
    render(
      <>
        <div data-testid="strip">
          <UsageOverviewStrip />
        </div>
        <PermissionsLoaded />
      </>,
      { wrapper },
    );

    await screen.findByText('permissions loaded');
    expect(screen.getByTestId('strip')).toBeEmptyDOMElement();
    expect(overviewReads).toBe(0);
  });
});

describe('usage formatting', () => {
  it('reads bytes in the decimal units GB/day is licensed in', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(999)).toBe('999 B');
    expect(formatBytes(1_250_000_000)).toBe('1.25 GB');
    expect(formatBytes(512_000_000_000_000)).toBe('512 TB');
  });

  it('keeps cores to one decimal place', () => {
    expect(formatUsageValue({ unit: 'cores' }, 7.25)).toBe('7.3');
    expect(formatUsageValue({ unit: 'cores' }, 64)).toBe('64');
  });

  it('reads ingested bytes as a day and events as a rate', () => {
    expect(formatUsageValue({ unit: 'bytes' }, 3_700)).toBe('3.7 KB/day');
    expect(formatUsageValue({ unit: 'events/s' }, 0.25)).toBe('0.3/s');
  });
});
