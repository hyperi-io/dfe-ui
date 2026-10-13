import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { OidcProviderCard } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const GOOGLE: TOidcProviderListItem = {
  name: 'google',
  type: 'google',
  enabled: true,
  display_name: 'Google Workspace',
  issuer: 'https://accounts.google.com',
  client_id: 'client-id',
  client_id_env: '',
  client_secret_env: '',
  client_secret_path: 'oidc/google/client_secret',
  scopes: ['openid', 'email', 'profile'],
  groups: {
    mode: 'api',
    claim_name: '',
    sync_interval: 3600,
    enrich_on_login: true,
    service_account_json_env: '',
    service_account_json_path: '',
    domain: 'example.com',
    tenant_id_env: '',
    client_secret_env: '',
    client_secret_path: '',
    api_token_env: '',
    api_token_path: '',
    okta_domain: '',
    tenant_id: '',
  },
  created_at: '2026-09-01T00:00:00Z',
  last_sync_at: '2026-10-10T08:30:00Z',
  last_sync_status: 'user_token',
  sync_error: '',
};

const lastSync = () =>
  Array.from(document.querySelectorAll('dt')).find(
    (term) => term.textContent === 'Last Sync:',
  );

const openActions = async (mode: TOidcProviderListItem['groups']['mode']) => {
  const user = userEvent.setup();
  render(
    <OidcProviderCard
      oidcProvider={{ ...GOOGLE, groups: { ...GOOGLE.groups, mode } }}
    />,
    { wrapper },
  );
  await user.click(
    screen.getByRole('button', { name: 'OIDC Provider actions' }),
  );
  return screen.findAllByRole('listitem');
};

describe('OidcProviderCard last sync', () => {
  test('shows how the last sync ended, user_token included', () => {
    render(<OidcProviderCard oidcProvider={GOOGLE} />, { wrapper });

    expect(lastSync()).toBeDefined();
    expect(screen.getByText('Read at login')).toBeVisible();
    expect(screen.queryByText('user_token')).not.toBeInTheDocument();
  });

  test('names the group mode as the forms do', () => {
    render(<OidcProviderCard oidcProvider={GOOGLE} />, { wrapper });

    expect(screen.getByText('API')).toBeVisible();
    expect(screen.queryByText('api')).not.toBeInTheDocument();
  });

  test('a provider that has never synced shows no last sync', () => {
    render(
      <OidcProviderCard
        oidcProvider={{ ...GOOGLE, last_sync_at: '', last_sync_status: '' }}
      />,
      { wrapper },
    );

    expect(lastSync()).toBeUndefined();
  });
});

describe('OidcProviderCard actions', () => {
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
});

describe('OidcProviderCard enabled status', () => {
  test.each([
    [true, 'Provider is enabled'],
    [false, 'Provider is disabled'],
  ])('enabled=%s shows "%s"', async (enabled, status) => {
    const user = userEvent.setup();
    render(<OidcProviderCard oidcProvider={{ ...GOOGLE, enabled }} />, {
      wrapper,
    });

    await user.hover(screen.getByRole('img', { name: status }));

    expect(
      await screen.findByRole('tooltip', { name: status }),
    ).toBeInTheDocument();
  });

  test('the status sits inside the heading, which stays one run of text', () => {
    render(<OidcProviderCard oidcProvider={GOOGLE} />, { wrapper });

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Google Workspace (google)');
    expect(heading).not.toHaveClass('flex');
    expect(
      within(heading).getByRole('img', { name: 'Provider is enabled' }),
    ).toBeInTheDocument();
  });

  test('the status is not a control', () => {
    render(<OidcProviderCard oidcProvider={GOOGLE} />, { wrapper });

    const heading = screen.getByRole('heading', { level: 3 });
    expect(within(heading).queryByRole('button')).not.toBeInTheDocument();
    expect(
      within(heading).getByRole('img', { name: 'Provider is enabled' }),
    ).not.toHaveAttribute('tabindex');
  });
});
