import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { OidcProviderCard } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const GOOGLE: TOidcProviderListItem = {
  name: 'google',
  org: '',
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
  trusted_email_domains: [],
  sync_error: '',
};

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
  // The card's own tags are list items too, so the actions are read from the menu alone.
  const menu = await waitFor(() => {
    const popover = document.querySelector<HTMLElement>('.ant-popover');
    expect(popover).not.toBeNull();
    return popover as HTMLElement;
  });
  return within(menu).findAllByRole('listitem');
};

describe('OidcProviderCard last sync', () => {
  test('a sync that ran shows its time on hover', async () => {
    const user = userEvent.setup();
    render(
      <OidcProviderCard oidcProvider={{ ...GOOGLE, last_sync_status: 'ok' }} />,
      { wrapper },
    );

    await user.hover(screen.getByText('OK'));
    expect(await screen.findByText(/^Last sync /)).toBeInTheDocument();
  });

  test('user_token reads Read at login, with no tooltip for a sync it never ran', async () => {
    const user = userEvent.setup();
    render(<OidcProviderCard oidcProvider={GOOGLE} />, { wrapper });

    expect(screen.getByText('Read at login')).toBeVisible();
    expect(screen.queryByText('user_token')).not.toBeInTheDocument();

    await user.hover(screen.getByText('Read at login'));
    await expect(
      screen.findByRole('tooltip', {}, { timeout: 500 }),
    ).rejects.toThrow();
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

    expect(screen.queryByText('Read at login')).not.toBeInTheDocument();
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

describe('OidcProviderCard heading', () => {
  test.each([
    { enabled: true, disabledTag: false },
    { enabled: false, disabledTag: true },
  ])(
    'enabled=$enabled heads the card with its display name',
    ({ enabled, disabledTag }) => {
      render(<OidcProviderCard oidcProvider={{ ...GOOGLE, enabled }} />, {
        wrapper,
      });

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent(
        disabledTag ? 'Google WorkspaceDisabled' : 'Google Workspace',
      );
      expect(screen.getByText('google')).toBeInTheDocument();
    },
  );

  test('shows enrich at login only where the provider does it', () => {
    const { rerender } = render(<OidcProviderCard oidcProvider={GOOGLE} />, {
      wrapper,
    });
    expect(screen.getByText('Enriched at login')).toBeVisible();

    rerender(
      <OidcProviderCard
        oidcProvider={{
          ...GOOGLE,
          groups: { ...GOOGLE.groups, enrich_on_login: false },
        }}
      />,
    );
    expect(screen.queryByText('Enriched at login')).not.toBeInTheDocument();
  });
});
