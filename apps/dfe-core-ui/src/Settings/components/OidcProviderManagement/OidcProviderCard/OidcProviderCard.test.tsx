import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { render, screen } from '@testing-library/react';
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
