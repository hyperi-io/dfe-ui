import {
  TUsageMetric,
  TUsageOverview,
} from '@/Usage/hooks/useFetchUsageOverview/types';
import { http, HttpResponse } from 'msw';

const metric = (
  overrides: Partial<TUsageMetric> & Pick<TUsageMetric, 'metric' | 'label'>,
): TUsageMetric => ({
  unit: 'cores',
  status: 'measured',
  highest_7d: { day: '2026-10-22', value: 12 },
  latest: { day: '2026-10-24', value: 10 },
  series: [
    { day: '2026-10-22', value: 12 },
    { day: '2026-10-23', value: 11 },
    { day: '2026-10-24', value: 10 },
  ],
  ...overrides,
});

const MOCK_USAGE_OVERVIEW: TUsageOverview = {
  orgs: [],
  from: '2026-09-25',
  to: '2026-10-24',
  highest_7d_label: 'Highest in the last 7 days',
  metrics: [
    metric({ metric: 'cores_deployed', label: 'Cores deployed' }),
    metric({
      metric: 'node_cores',
      label: 'Worker-node cores',
      highest_7d: { day: '2026-10-23', value: 64 },
    }),
    metric({
      metric: 'ingested_bytes',
      label: 'Data ingested',
      unit: 'bytes',
      highest_7d: { day: '2026-10-21', value: 1_250_000_000 },
    }),
    metric({
      metric: 'events_per_second',
      label: 'Events per second',
      unit: 'events/s',
      highest_7d: { day: '2026-10-24', value: 4321.5 },
    }),
  ],
};

export const usage = {
  overview: {
    mockedUrl: '/api/v1/usage/overview',
    get: {
      success: ({
        mockedResponse = MOCK_USAGE_OVERVIEW,
      }: { mockedResponse?: TUsageOverview } = {}) =>
        http.get(usage.overview.mockedUrl, () =>
          HttpResponse.json(mockedResponse),
        ),
      error: ({ status = 403 }: { status?: number } = {}) =>
        http.get(usage.overview.mockedUrl, () =>
          HttpResponse.json(
            { code: 'forbidden', message: 'Missing action usage:read' },
            { status },
          ),
        ),
    },
  },
};
