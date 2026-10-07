import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { vi } from 'vitest';

const OKTA_PROVIDER: TOidcProviderListItem = {
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
    mode: 'token_claim',
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
    api_token_env: '',
    api_token_path: '',
    okta_domain: '',
    tenant_id: '',
  },
  created_at: '2026-09-01T00:00:00Z',
  last_sync_at: '',
  last_sync_status: '',
  sync_error: '',
};

const ENTRA_PROVIDER: TOidcProviderListItem = {
  ...OKTA_PROVIDER,
  name: 'entra',
  type: 'entra_id',
  display_name: 'Entra ID',
  issuer: 'https://login.microsoftonline.com/tenant/v2.0',
};

// The infinite-query hooks behind the form's selects observe a sentinel row.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// A drawer flow through the antd selects and their lookups measured 15s alone under coverage, close to the 20s default.
export const GROUP_DRAWER_TEST_TIMEOUT_MS = 60_000;

export const stubIntersectionObserver = () =>
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

/** Every lookup the group form makes before it can be submitted. */
export const GROUP_FORM_HANDLERS = [
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.roles.default.get.success({
    mockedResponse: {
      items: [
        {
          name: 'viewer',
          description: 'Read-only access',
          permissions: ['source:read'],
          scoped: false,
          resource_type: 'system',
        },
      ],
      total: 1,
      page: 1,
      per_page: 20,
      total_pages: 1,
      next_page: null,
      prev_page: null,
    },
  }),
  API_CONFIG_MOCKS.accounts.default.get.success(),
  API_CONFIG_MOCKS.oidcProviders.default.get.success({
    mockedResponse: {
      items: [OKTA_PROVIDER, ENTRA_PROVIDER],
      total: 2,
      page: 1,
      per_page: 10,
      total_pages: 1,
      next_page: null,
      prev_page: null,
    },
  }),
];
