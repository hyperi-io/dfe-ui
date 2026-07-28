import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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
  groups: {
    mode: 'string',
    claim_name: 'string',
    sync_interval: 1000,
    enrich_on_login: true,
    service_account_json_env: 'string',
    admin_email: 'string',
    domain: 'string',
    tenant_id_env: 'string',
    client_secret_env: 'string',
    api_token_env: 'string',
    okta_domain: 'string',
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
      const url = new URL(request.url);
      const page = Math.max(
        1,
        parseInt(url.searchParams.get('page') ?? '1', 10),
      );
      const perPage =
        parseInt(url.searchParams.get('per_page') ?? '10', 10) || 10;

      const start = (page - 1) * perPage;
      const items = ALL_ITEMS.slice(start, start + perPage);
      const totalPages = Math.ceil(TOTAL_ITEMS / perPage);

      return HttpResponse.json({
        items,
        total: TOTAL_ITEMS,
        page,
        per_page: perPage,
        total_pages: totalPages,
        next_page: page < totalPages ? page + 1 : 0,
        prev_page: page > 1 ? page - 1 : 0,
      });
    },
  );
}

const handlers = [createPaginatedOidcProvidersHandler()];

export const server = setupServer(...handlers);
