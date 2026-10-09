import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { OidcProviderCard } from '@/Settings/components/OidcProviderManagement/OidcProviderCard';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

const PROVIDER: TOidcProviderListItem = {
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

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const openActions = async (mode: TOidcProviderListItem['groups']['mode']) => {
  const user = userEvent.setup();
  render(
    <OidcProviderCard
      oidcProvider={{ ...PROVIDER, groups: { ...PROVIDER.groups, mode } }}
    />,
    { wrapper },
  );
  await user.click(
    screen.getByRole('button', { name: 'OIDC Provider actions' }),
  );
  return screen.findAllByRole('listitem');
};

describe('OidcProviderCard', () => {
  test('an api provider offers to sync its groups', async () => {
    const actions = await openActions('api');

    expect(actions).toHaveLength(5);
    expect(
      await screen.findByRole(
        'button',
        { name: /Sync OIDC Provider Groups/ },
        { timeout: 15_000 },
      ),
    ).toBeEnabled();
  });

  test.each(['token_claim', 'manual'] as const)(
    'a %s provider has no sync action',
    async (mode) => {
      const actions = await openActions(mode);

      expect(actions).toHaveLength(4);
      expect(
        screen.queryByRole('button', { name: /Sync OIDC Provider Groups/ }),
      ).not.toBeInTheDocument();
    },
  );

  test.each([
    [true, 'Provider is enabled'],
    [false, 'Provider is disabled'],
  ])('enabled=%s shows "%s"', async (enabled, status) => {
    const user = userEvent.setup();
    render(<OidcProviderCard oidcProvider={{ ...PROVIDER, enabled }} />, {
      wrapper,
    });

    await user.hover(screen.getByRole('button', { name: status }));

    expect(
      await screen.findByRole('tooltip', { name: status }),
    ).toBeInTheDocument();
  });
});
