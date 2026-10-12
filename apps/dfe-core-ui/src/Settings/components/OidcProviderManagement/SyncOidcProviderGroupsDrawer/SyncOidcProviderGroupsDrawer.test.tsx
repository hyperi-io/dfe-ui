import {
  ADMIN_MOCKED_RESPONSE,
  server,
} from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TSyncOidcProviderGroupsResponse } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { SyncOidcProviderGroupsDrawer } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const RESULTS = API_CONFIG_MOCKS.oidcProviders.syncGroups.results;

const sync = async (mockedResponse: TSyncOidcProviderGroupsResponse) => {
  server.use(
    API_CONFIG_MOCKS.oidcProviders.syncGroups.post.success({
      mockedResponse,
      name: 'okta',
    }),
  );
  render(<SyncOidcProviderGroupsDrawer oidcProviderName="okta" />, {
    wrapper,
  });
  await userEvent.click(
    await screen.findByRole('button', { name: 'Sync OIDC Provider Groups' }),
  );
};

const TITLES = {
  ok: 'Sync complete',
  partial: 'Sync partly complete',
  error: 'Sync failed',
  not_configured: 'Sync not run',
  user_token: 'No sync needed',
  skipped: 'Sync skipped',
} as const;

describe('SyncOidcProviderGroupsDrawer', () => {
  test.each([
    { status: 'ok', message: 'Every directory group synced.' },
    {
      status: 'partial',
      message:
        'Some directory groups were skipped and the rest synced. The provider details say why each was skipped.',
    },
    {
      status: 'not_configured',
      message:
        'The provider has no directory credential. Edit the provider to add one, then sync again.',
    },
    {
      status: 'user_token',
      message:
        "Each user's groups are read from their own token when they log in, so there is no directory to sync.",
    },
    {
      status: 'skipped',
      message:
        'The provider is disabled, or its group Mode is not API. To sync, enable it and set Mode to API.',
    },
  ] as const)(
    'a $status sync says what happened and what to do',
    async ({ status, message }) => {
      await sync(RESULTS[status]);

      expect(await screen.findByText(TITLES[status])).toBeVisible();
      expect(screen.getByText(message)).toBeVisible();
      expect(screen.queryByText(TITLES.error)).not.toBeInTheDocument();
    },
  );

  test.each(['not_configured', 'user_token', 'skipped'] as const)(
    'a %s sync shows the engine status, never its skipped text',
    async (status) => {
      await sync(RESULTS[status]);

      await screen.findByText(TITLES[status]);
      expect(
        screen.queryByText(RESULTS[status].skipped),
      ).not.toBeInTheDocument();
    },
  );

  test('a failed sync shows the engine error under its message', async () => {
    await sync(RESULTS.error);

    expect(await screen.findByText(TITLES.error)).toBeVisible();
    expect(screen.getByText('No groups changed.')).toBeVisible();
    expect(screen.getByText(RESULTS.error.error)).toBeVisible();
  });

  test('the error text reads only for a failed sync', async () => {
    await sync({
      ...RESULTS.ok,
      error: 'left over from an earlier run',
    });

    await screen.findByText(TITLES.ok);
    expect(
      screen.queryByText('left over from an earlier run'),
    ).not.toBeInTheDocument();
  });

  test('a sync that ran shows its counts', async () => {
    await sync(RESULTS.ok);

    expect(await screen.findByText('Groups Created')).toBeVisible();
    expect(screen.getByText('5')).toBeVisible();
    expect(screen.queryByText('Groups Skipped')).not.toBeInTheDocument();
  });

  test('a partial sync counts the groups it skipped', async () => {
    await sync(RESULTS.partial);

    expect(await screen.findByText('Groups Skipped')).toBeVisible();
    expect(
      screen.getByText('Groups Skipped').nextElementSibling,
    ).toHaveTextContent('2');
  });

  test('an account without oidc:write sees the sync action disabled', async () => {
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: {
          ...ADMIN_MOCKED_RESPONSE,
          permissions: ['oidc:read'],
        },
      }),
    );
    render(<SyncOidcProviderGroupsDrawer oidcProviderName="okta" />, {
      wrapper,
    });

    expect(
      await screen.findByRole('button', { name: 'Sync OIDC Provider Groups' }),
    ).toBeDisabled();
  });

  test.each(['error', 'not_configured', 'user_token', 'skipped'] as const)(
    'a %s sync that listed nothing shows no counts',
    async (status) => {
      await sync(RESULTS[status]);

      await screen.findByText(TITLES[status]);
      expect(screen.queryByText('Groups Created')).not.toBeInTheDocument();
    },
  );
});
