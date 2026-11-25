/* import-scope-drift-disable - (exported for tests) */
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import type { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { http, HttpResponse } from 'msw';

/** A provider of *org* named *name*, every other field at its empty value. */
export const provider = (
  name: string,
  org: string,
  display_name = name,
): TOidcProviderListItem => ({
  name,
  org,
  type: 'okta',
  enabled: true,
  display_name,
  issuer: '',
  client_id_env: '',
  client_secret_env: '',
  created_at: '',
  last_sync_at: '',
  last_sync_status: '',
  trusted_email_domains: [],
  sync_error: '',
  client_id: '',
  client_secret_path: '',
  scopes: [],
  groups: {
    mode: 'claim',
    claim_name: 'groups',
    sync_interval: 0,
    enrich_on_login: false,
    service_account_json_env: '',
    domain: '',
    tenant_id_env: '',
    client_secret_env: '',
    api_token_env: '',
    okta_domain: '',
    service_account_json_path: '',
    client_secret_path: '',
    api_token_path: '',
    tenant_id: '',
  },
});

const org = (name: string, display_name: string) => ({
  name,
  display_name,
  org_ids: [name],
  enabled: true,
  created_at: '',
  updated_at: '',
});

// A platform provider, one of the deployment's own (hyperi) and customers' providers.
export const EVERY_PROVIDER = [
  provider('platform-okta', '', 'Platform Okta'),
  provider('hyperi-entra', 'hyperi', 'HyperI Entra'),
  provider('acme-entra', 'acme', 'Acme Entra'),
  provider('globex-okta', 'globex', 'Globex Okta'),
  provider('globex-google', 'globex', 'Globex Google'),
  provider('initech-okta', 'initech', 'Initech Okta'),
];

/** A platform admin of the deployment HyperI, with three customer organisations listed. */
export const PROVIDER_PAGE_HANDLERS = [
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
  http.get('/api/v1/orgs', ({ request }) =>
    HttpResponse.json(
      pageOf(
        [
          org('acme', 'Acme'),
          org('globex', 'Globex'),
          org('initech', 'Initech'),
        ],
        request,
      ),
    ),
  ),
];

/** Serves *providers* as the provider list. */
export const providersServed = (providers: TOidcProviderListItem[]) =>
  http.get(API_CONFIG_MOCKS.oidcProviders.default.mockedUrl, ({ request }) =>
    HttpResponse.json(pageOf(providers, request)),
  );
/* import-scope-drift-enable */
