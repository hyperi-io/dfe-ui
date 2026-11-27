import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AppOperationalCard } from '.';
import { COMPONENT, server } from './AppOperationalCard.mocks';
import { TArgoSync } from './ArgoSyncStatus';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const statusOf = (reporting: boolean | null, sync?: TArgoSync | null) =>
  API_CONFIG_MOCKS.apps.status.get.success({
    ...COMPONENT,
    mockedResponse: {
      telemetry_name: 'dfe-ui',
      reporting,
      last_seen_epoch: null,
      started_epoch: null,
      uptime_seconds: null,
      ...(sync === undefined ? {} : { sync }),
    },
  });

describe('AppOperationalCard reporting tag', () => {
  it.each([
    {
      reporting: true,
      shown: 'reporting',
      hidden: ['not reporting', 'no telemetry'],
    },
    {
      reporting: false,
      shown: 'not reporting',
      hidden: ['reporting', 'no telemetry'],
    },
    {
      reporting: null,
      shown: 'no telemetry',
      hidden: ['reporting', 'not reporting'],
    },
  ])(
    'reads reporting=$reporting as "$shown"',
    async ({ reporting, shown, hidden }) => {
      server.use(statusOf(reporting));

      render(<AppOperationalCard {...COMPONENT} />, { wrapper });

      expect(await screen.findByText(shown)).toBeInTheDocument();
      hidden.forEach((text) =>
        expect(screen.queryByText(text)).not.toBeInTheDocument(),
      );
    },
  );
});

const REVISION = '4b24b1f3c0ffee4b24b1f3c0ffee4b24b1f3c0ff';

const syncOf = (
  status: string,
  health: string,
  conditions: TArgoSync['conditions'] = [],
): TArgoSync => ({
  status,
  revision: REVISION,
  health: { status: health },
  conditions,
});

// What Argo CD 3.4 wrote on an Application it refused for its release name
const REFUSED_MESSAGE =
  'Failed to load target state: failed to generate manifest for source 1 of 1: rpc error: code = Unknown desc = failed to execute helm template command: failed running helm: `helm template . --name-template dfe-ui-default-an-instance-name-well-past-the-fifty-three-limit --namespace default --kube-version 1.37.0 <api versions removed> --include-crds` failed exit status 1: Error: release name "dfe-ui-default-an-instance-name-well-past-the-fifty-three-limit": invalid release name, must match regex ^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$ and the length must not be longer than 53';

const REFUSED: TArgoSync = {
  status: 'Unknown',
  revision: 'HEAD',
  health: { status: 'Healthy' },
  conditions: [
    {
      type: 'ComparisonError',
      message: REFUSED_MESSAGE,
    },
  ],
};

describe('AppOperationalCard Argo CD state', () => {
  it('shows the condition Argo wrote on an Application it refused', async () => {
    server.use(statusOf(true, REFUSED));

    render(<AppOperationalCard {...COMPONENT} />, { wrapper });

    expect(await screen.findByText('ComparisonError')).toBeInTheDocument();
    expect(screen.getByText(REFUSED_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText('Sync unknown')).toBeInTheDocument();
    // Argo still reports Healthy on a refusal, which the card doesn't repeat
    expect(screen.getByText('Health unknown')).toBeInTheDocument();
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
  });

  it.each([
    { sync: 'Synced', health: 'Healthy', shown: ['Synced', 'Healthy'] },
    {
      sync: 'OutOfSync',
      health: 'Progressing',
      shown: ['Out of sync', 'Progressing'],
    },
    {
      sync: 'OutOfSync',
      health: 'Degraded',
      shown: ['Out of sync', 'Degraded'],
    },
    { sync: 'Synced', health: 'Suspended', shown: ['Synced', 'Suspended'] },
    { sync: 'OutOfSync', health: 'Missing', shown: ['Out of sync', 'Missing'] },
    // Argo adds values over time, so one this UI has not met shows as written
    { sync: 'Synced', health: 'Archived', shown: ['Synced', 'Archived'] },
  ])('reads sync $sync and health $health', async ({ sync, health, shown }) => {
    server.use(statusOf(true, syncOf(sync, health)));

    render(<AppOperationalCard {...COMPONENT} />, { wrapper });

    expect(await screen.findByText('Argo CD')).toBeInTheDocument();
    shown.forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());
    expect(
      screen.queryByRole('heading', { level: 3, name: /Error|Warning/ }),
    ).not.toBeInTheDocument();
  });

  it.each([
    { name: 'sync is null', sync: null },
    { name: 'sync is absent', sync: undefined },
  ])('shows no Argo CD state when $name', async ({ sync }) => {
    server.use(statusOf(true, sync));

    render(<AppOperationalCard {...COMPONENT} />, { wrapper });

    expect(await screen.findByText('reporting')).toBeInTheDocument();
    expect(screen.queryByText('Argo CD')).not.toBeInTheDocument();
  });

  it('shows Argo CD state for an app that emits no telemetry', async () => {
    server.use(statusOf(null, syncOf('OutOfSync', 'Healthy')));

    render(<AppOperationalCard {...COMPONENT} />, { wrapper });

    expect(await screen.findByText('no telemetry')).toBeInTheDocument();
    expect(screen.getByText('Out of sync')).toBeInTheDocument();
  });

  it.each([
    { revision: REVISION, hint: 'revision 4b24b1f' },
    { revision: '1.4.2', hint: 'revision 1.4.2' },
    { revision: null, hint: 'no revision yet' },
  ])(
    'says which revision the sync state is for: $hint',
    async ({ revision, hint }) => {
      server.use(statusOf(true, { ...syncOf('Synced', 'Healthy'), revision }));
      const user = userEvent.setup();

      render(<AppOperationalCard {...COMPONENT} />, { wrapper });
      await user.hover(await screen.findByText('Synced'));

      expect(
        await screen.findByText(`Argo CD sync state, ${hint}`),
      ).toBeInTheDocument();
    },
  );
});
