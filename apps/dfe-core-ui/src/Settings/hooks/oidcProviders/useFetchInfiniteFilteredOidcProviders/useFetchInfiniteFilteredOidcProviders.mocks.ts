import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TOidcProviderListItem } from './types';

const OIDC_PROVIDER_ITEM: TOidcProviderListItem = {
  name: 'string',
  type: 'string',
  enabled: true,
  display_name: 'string',
  issuer: 'string',
  client_id_env: 'string',
  client_secret_env: 'string',
  created_at: 'string',
  last_sync_at: 'string',
  last_sync_status: 'string',
  sync_error: 'string',
  client_id: 'string',
  client_secret_path: 'string',
  scopes: ['openid', 'email', 'profile'],
  groups: {
    mode: 'string',
    claim_name: 'string',
    sync_interval: 1000,
    enrich_on_login: true,
    service_account_json_env: 'string',
    domain: 'string',
    tenant_id_env: 'string',
    client_secret_env: 'string',
    api_token_env: 'string',
    okta_domain: 'string',
    service_account_json_path: 'string',
    client_secret_path: 'string',
    api_token_path: 'string',
    tenant_id: 'string',
  },
} as const;

const TOTAL_ITEMS = 25;
const ALL_ITEMS = Array.from({ length: TOTAL_ITEMS }, () => ({
  ...OIDC_PROVIDER_ITEM,
}));

function createPaginatedOidcProvidersHandler() {
  return http.get(
    API_CONFIG_MOCKS.oidcProviders.default.mockedUrl,
    ({ request }) => {
      return HttpResponse.json(pageOf(ALL_ITEMS, request));
    },
  );
}

const handlers = [createPaginatedOidcProvidersHandler()];

export const server = setupServer(...handlers);
