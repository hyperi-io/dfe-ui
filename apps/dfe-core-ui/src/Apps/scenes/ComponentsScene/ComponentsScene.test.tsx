import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ComponentsScene } from '.';
import { server } from './ComponentsScene.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  // Back to the vitest.setup.ts implementations
  vi.mocked(useRouter).mockReset();
  vi.mocked(useSearchParams).mockReset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

// The receiver, and HyperDX with a display name the tabs leave out
const twoPools = () =>
  API_CONFIG_MOCKS.apps.default.get.success({
    mockedResponse: [
      {
        service: 'dfe-receiver',
        display_name: null,
        scale_deployed: true,
        multiplicity: 'single',
        has_compiled_routing: true,
        routing_scope: 'stack',
        optional: false,
        offered: true,
        file_sets: [],
        instances: ['default'],
      },
      {
        service: 'hyperdx',
        display_name: 'Search',
        scale_deployed: false,
        multiplicity: 'single',
        has_compiled_routing: false,
        routing_scope: 'stack',
        optional: false,
        offered: true,
        file_sets: [],
        instances: ['default'],
      },
    ],
  });

const engine = { service: 'dfe-engine', instance: 'default' };

// The engine, the hunt runner deployed from its image, and the engine card's reads
const engineWithRunner = () => [
  API_CONFIG_MOCKS.apps.default.get.success({
    mockedResponse: [
      {
        service: 'dfe-engine',
        display_name: null,
        scale_deployed: false,
        multiplicity: 'single',
        has_compiled_routing: false,
        routing_scope: 'stack',
        optional: false,
        offered: true,
        file_sets: [],
        instances: ['default'],
        processes: ['dfe-hunt-runner'],
      },
    ],
  }),
  API_CONFIG_MOCKS.apps.status.get.success(engine),
  API_CONFIG_MOCKS.apps.metrics.get.success(engine),
  API_CONFIG_MOCKS.apps.metricsSeries.get.success(engine),
  API_CONFIG_MOCKS.apps.metricsTotals.get.success(engine),
  API_CONFIG_MOCKS.apps.history.get.success(engine),
];

describe('ComponentsScene', () => {
  it('opens the component the URL names', async () => {
    server.use(twoPools());
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('component=hyperdx') as ReturnType<
        typeof useSearchParams
      >,
    );

    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByRole('tab', { name: /^hyperdx/, selected: true }),
    ).toBeInTheDocument();
  });

  it('puts the chosen component in the URL', async () => {
    const replace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ ...useRouter(), replace });
    server.use(twoPools());
    const user = userEvent.setup();

    render(<ComponentsScene />, { wrapper });
    await user.click(await screen.findByRole('tab', { name: /^hyperdx/ }));

    expect(replace).toHaveBeenCalledWith('/?component=hyperdx');
  });

  it('lists the fleet-wide pools and excludes the per-source apps', async () => {
    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByRole('tab', { name: /dfe-receiver/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /dfe-transform-vrl/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /dfe-transform-elastic/ }),
    ).not.toBeInTheDocument();
  });

  it('labels each pool by its service id, never its display name', async () => {
    server.use(twoPools());

    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByRole('tab', { name: /^hyperdx/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /Search/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /^dfe-receiver/ }),
    ).toBeInTheDocument();
  });

  it('shows status, metrics and history, and links to the settings', async () => {
    render(<ComponentsScene />, { wrapper });

    expect(await screen.findByText('Status')).toBeInTheDocument();
    expect(await screen.findByText('Metrics')).toBeInTheDocument();
    expect(await screen.findByText('History')).toBeInTheDocument();
    expect(await screen.findByText('reporting')).toBeInTheDocument();
    // Totals sit under the Usage range, an hour by default
    expect(
      await screen.findByRole('button', { name: 'Usage range' }),
    ).toHaveTextContent('Last Hour');
    expect(await screen.findByText('Totals')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Settings' }),
    ).toHaveAttribute(
      'href',
      '/settings/platform/components?component=dfe-receiver',
    );
    // Scaling and settings are edited under Platform settings
    expect(screen.queryByText('Scaling')).not.toBeInTheDocument();
  });

  it('puts CPU time on its resources row rather than among the totals', async () => {
    const receiver = { service: 'dfe-receiver', instance: 'default' };
    server.use(
      API_CONFIG_MOCKS.apps.metricsSeries.get.success({
        ...receiver,
        mockedResponse: {
          telemetry_name: 'dfe-receiver',
          window_seconds: 3600,
          bucket_seconds: 0,
          buckets: [
            {
              metric: 'process_cpu_seconds_total',
              bucket_epoch: 1756500000,
              minimum: 0.01,
              maximum: 0.03,
              average: 0.02,
              p95: 0.03,
              samples: 60,
            },
          ],
        },
      }),
      API_CONFIG_MOCKS.apps.metricsTotals.get.success({
        ...receiver,
        mockedResponse: {
          telemetry_name: 'dfe-receiver',
          window_seconds: 3600,
          totals: { process_cpu_seconds_total: 74, records_received_total: 23 },
        },
      }),
    );

    render(<ComponentsScene />, { wrapper });

    expect(await screen.findByText('cpu_used (1m total)')).toBeInTheDocument();
    expect(screen.queryByText(/^cpu_used 1m/)).not.toBeInTheDocument();
  });

  it("gives a process deployed from the engine's image a tab after the engine's", async () => {
    const asked: string[] = [];
    const record = ({ request }: { request: Request }) => {
      const url = new URL(request.url);
      if (url.pathname.endsWith('/status')) {
        asked.push(url.searchParams.get('process') ?? '');
      }
    };
    server.events.on('request:start', record);
    server.use(...engineWithRunner());
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(
        'component=dfe-engine&process=dfe-hunt-runner',
      ) as ReturnType<typeof useSearchParams>,
    );

    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByRole('tab', {
        name: /^dfe-hunt-runner/,
        selected: true,
      }),
    ).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(tabs).toEqual([
      'dfe-engineInstance default',
      'dfe-hunt-runnerUses the dfe-engine image',
    ]);
    // Settings and history belong to the engine's tab alone
    expect(
      await screen.findAllByRole('link', { name: 'Settings', hidden: true }),
    ).toHaveLength(1);
    expect(screen.getAllByText('History')).toHaveLength(1);
    await waitFor(() => expect(asked.sort()).toEqual(['', 'dfe-hunt-runner']));
    server.events.removeListener('request:start', record);
  });

  it('keeps the receiver routing rules off this page', async () => {
    render(<ComponentsScene />, { wrapper });

    await screen.findByText('Status');
    expect(
      screen.queryByRole('heading', { name: /routing/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps the components whose name matches and says so when none do', async () => {
    const user = userEvent.setup();
    const hyperdx = { service: 'hyperdx', instance: 'default' };
    server.use(
      API_CONFIG_MOCKS.apps.status.get.success(hyperdx),
      API_CONFIG_MOCKS.apps.metrics.get.success(hyperdx),
      API_CONFIG_MOCKS.apps.metricsSeries.get.success(hyperdx),
      API_CONFIG_MOCKS.apps.metricsTotals.get.success(hyperdx),
      API_CONFIG_MOCKS.apps.history.get.success(hyperdx),
      twoPools(),
    );

    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByRole('tab', { name: /^dfe-receiver/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^hyperdx/ })).toBeInTheDocument();

    const search = screen.getByRole('searchbox', { name: 'Search components' });
    await user.type(search, 'receiver');

    expect(
      screen.getByRole('tab', { name: /^dfe-receiver/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /^hyperdx/ }),
    ).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'HYPERDX');

    expect(screen.getByRole('tab', { name: /^hyperdx/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /^dfe-receiver/ }),
    ).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'no-such-component');

    expect(
      screen.getByText('No components match this search.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('says so plainly when nothing is deployed yet', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.default.get.success({ mockedResponse: [] }),
    );

    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByText('No components are deployed'),
    ).toBeInTheDocument();
  });
});
