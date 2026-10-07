import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { SyncOidcProviderGroupsDrawer } from '@/Settings/components/OidcProviderManagement/SyncOidcProviderGroupsDrawer';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { TSyncOidcProviderGroupsResponse } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

const API_PROVIDER: TOidcProviderListItem = {
  name: 'okta',
  type: 'okta',
  enabled: true,
  display_name: 'Okta',
  issuer: 'https://example.okta.com',
  client_id: 'okta-client-id',
  client_id_env: 'OKTA_CLIENT_ID',
  client_secret_env: 'OKTA_CLIENT_SECRET',
  client_secret_path: '',
  groups: {
    mode: 'api',
    claim_name: 'groups',
    sync_interval: 3600,
    enrich_on_login: false,
    service_account_json_env: '',
    service_account_json_path: '',
    admin_email: '',
    domain: '',
    tenant_id_env: '',
    client_secret_env: '',
    client_secret_path: '',
    api_token_env: 'OKTA_API_TOKEN',
    api_token_path: '',
    okta_domain: 'example.okta.com',
    tenant_id: '',
  },
  created_at: '2026-09-01T00:00:00Z',
  last_sync_at: '',
  last_sync_status: '',
  sync_error: '',
};

const NOTHING_SYNCED: TSyncOidcProviderGroupsResponse = {
  created: 0,
  updated: 0,
  total: 0,
  groups_skipped: 0,
  error: null,
  skipped: null,
};

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const findSyncButton = () =>
  screen.findByRole(
    'button',
    { name: /Sync OIDC Provider Groups/ },
    { timeout: 15_000 },
  );

const syncWith = async (result: TSyncOidcProviderGroupsResponse) => {
  server.use(
    API_CONFIG_MOCKS.oidcProviders.syncGroups.post.success({
      mockedResponse: result,
      name: API_PROVIDER.name,
    }),
  );
  const user = userEvent.setup();
  render(<SyncOidcProviderGroupsDrawer oidcProvider={API_PROVIDER} />, {
    wrapper,
  });
  await user.click(await findSyncButton());
};

const countRows = () =>
  Object.fromEntries(
    Array.from(document.querySelectorAll('dt')).map((term) => [
      term.textContent,
      term.nextElementSibling?.textContent,
    ]),
  );

describe('SyncOidcProviderGroupsDrawer', () => {
  test('a sync that ran shows its counts', async () => {
    await syncWith({ ...NOTHING_SYNCED, created: 2, updated: 1, total: 5 });

    await screen.findByText('Groups Created', {}, { timeout: 15_000 });
    expect(countRows()).toEqual({
      'Groups Created': '2',
      'Groups Updated': '1',
      Total: '5',
    });
  });

  test('provider groups the sync left out are counted', async () => {
    await syncWith({ ...NOTHING_SYNCED, total: 4, groups_skipped: 3 });

    await screen.findByText('Groups Created', {}, { timeout: 15_000 });
    expect(countRows()['Groups Skipped']).toBe('3');
  });

  test('a skipped sync shows why and no counts', async () => {
    const reason =
      "groups mode is 'token_claim': groups come from each login's token, so there is no directory to sync; link a group to the IdP group by its source ID";
    await syncWith({ ...NOTHING_SYNCED, skipped: reason });

    expect(
      await screen.findByText(reason, {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sync skipped')).toBeInTheDocument();
    expect(screen.queryByText('Groups Created')).not.toBeInTheDocument();
  });

  test('a failed directory call shows the error and no counts', async () => {
    const error =
      "okta directory: GET '/api/v1/groups' returned HTTP 401: 'Invalid token provided'";
    await syncWith({ ...NOTHING_SYNCED, error });

    expect(
      await screen.findByText(error, {}, { timeout: 15_000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sync failed')).toBeInTheDocument();
    expect(screen.queryByText('Groups Created')).not.toBeInTheDocument();
  });

  test.each([
    [
      'a token-claim provider',
      {
        ...API_PROVIDER,
        groups: { ...API_PROVIDER.groups, mode: 'token_claim' },
      },
      "Groups come from each login's token, so there is no directory to sync. Link a DFE group to an IdP group by its source ID.",
    ],
    [
      'a manual provider',
      { ...API_PROVIDER, groups: { ...API_PROVIDER.groups, mode: 'manual' } },
      'Group membership is managed in DFE, so there is no directory to sync.',
    ],
    [
      'a disabled provider',
      { ...API_PROVIDER, enabled: false },
      'This provider is disabled, so there is nothing to sync.',
    ],
  ])(
    '%s says why it cannot sync instead of offering to',
    async (_label, oidcProvider, reason) => {
      const user = userEvent.setup();
      render(<SyncOidcProviderGroupsDrawer oidcProvider={oidcProvider} />, {
        wrapper,
      });

      const button = await findSyncButton();
      expect(button).toBeDisabled();
      await user.hover(button);

      expect(
        await screen.findByText(reason, {}, { timeout: 15_000 }),
      ).toBeInTheDocument();
    },
  );
});
