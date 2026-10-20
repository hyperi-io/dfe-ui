import { TCreateOidcProviderResponse } from '@/core/hooks/useCreateOidcProvider/types';
import { TTestOidcProviderResponse } from '@/core/hooks/useTestOidcProvider/types';
import { TOidcProviderUpdateResponse } from '@/core/hooks/useUpdateOidcProvider/types';
import { TVerifyOidcLoginResponse } from '@/core/hooks/useVerifyOidcLogin/types';
import { TListOidcProvidersResponse } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { TSyncOidcProviderGroupsResponse } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const oidcProviders = {
  default: {
    mockedUrl: '/api/v1/auth/oidc-providers',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
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
                service_account_json_path: 'service_account_json_path',
                client_secret_path: 'client_secret_path',
                api_token_path: 'api_token_path',
                tenant_id: 'tenant_id',
              },
            },
          ],
          total: 1,
          page: 1,
          per_page: 10,
          total_pages: 1,
          next_page: 1,
          prev_page: 1,
        },
      }: {
        mockedResponse?: TListOidcProvidersResponse;
      } = {}) => {
        return http.get(oidcProviders.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.get(oidcProviders.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          name: 'string',
          display_name: 'string',
          enabled: true,
          type: 'generic',
          issuer: 'string',
          client_id_env: 'string',
          client_secret_env: 'string',
          created_at: 'string',
          last_sync_at: 'string',
          last_sync_status: 'string',
          sync_error: 'string',
          client_id: 'client_id',
          client_secret_path: 'client_secret_path',
          scopes: ['openid', 'email', 'profile'],
          groups: {
            mode: 'manual',
            claim_name: 'string',
            sync_interval: 1000,
            enrich_on_login: true,
            service_account_json_env: 'string',
            domain: 'string',
            tenant_id_env: 'string',
            client_secret_env: 'string',
            api_token_env: 'string',
            okta_domain: 'string',
            service_account_json_path: 'service_account_json_path',
            client_secret_path: 'client_secret_path',
            api_token_path: 'api_token_path',
            tenant_id: 'tenant_id',
          },
        },
      }: {
        mockedResponse?: TCreateOidcProviderResponse;
      } = {}) => {
        return http.post(oidcProviders.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.post(oidcProviders.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  provider: {
    mockedUrl: '/api/v1/auth/oidc-providers/{name}',
    get: {
      success: () => {
        return console.error('Not implemented');
      },
    },
    put: {
      success: ({
        mockedResponse = {
          name: 'name',
          display_name: 'display_name',
          enabled: true,
          type: 'type',
          issuer: 'issuer',
          client_id_env: 'client_id_env',
          client_secret_env: 'client_secret_env',
          client_id: 'client_id',
          client_secret_path: 'client_secret_path',
          scopes: ['openid', 'email', 'profile'],
          groups: {
            mode: 'mode',
            claim_name: 'claim_name',
            sync_interval: 1,
            enrich_on_login: true,
            service_account_json_env: 'service_account_json_env',
            domain: 'domain',
            tenant_id_env: 'tenant_id_env',
            client_secret_env: 'client_secret_env',
            api_token_env: 'api_token_env',
            okta_domain: 'okta_domain',
            service_account_json_path: 'service_account_json_path',
            client_secret_path: 'client_secret_path',
            api_token_path: 'api_token_path',
            tenant_id: 'tenant_id',
          },
          created_at: 'created_at',
          last_sync_at: 'last_sync_at',
          last_sync_status: 'last_sync_status',
          sync_error: 'sync_error',
        },
        name = 'name',
      }: {
        mockedResponse?: TOidcProviderUpdateResponse;
        name?: string;
      } = {}) => {
        return http.put(
          oidcProviders.provider.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.put(
          oidcProviders.provider.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({
        status = 204,
        name = 'name',
      }: { status?: number; name?: string } = {}) => {
        return http.delete(
          oidcProviders.provider.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.delete(
          oidcProviders.provider.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  syncGroups: {
    mockedUrl: '/api/v1/auth/oidc-providers/{name}/sync',
    /** One result per status, shaped as the engine's sync_provider returns it. */
    results: {
      ok: {
        created: 3,
        updated: 2,
        total: 5,
        groups_skipped: 0,
        error: null,
        skipped: null,
        status: 'ok',
      },
      partial: {
        created: 3,
        updated: 1,
        total: 4,
        groups_skipped: 2,
        error: null,
        skipped: null,
        status: 'partial',
      },
      error: {
        created: 0,
        updated: 0,
        total: 0,
        groups_skipped: 0,
        error:
          'The directory API could not use the configured credential: check it is current and valid; the engine log has the reason',
        skipped: null,
        status: 'error',
      },
      not_configured: {
        created: 0,
        updated: 0,
        total: 0,
        groups_skipped: 0,
        error: null,
        skipped:
          'The directory credential is not configured, so no groups were synced; configure it on the provider and sync again',
        status: 'not_configured',
      },
      user_token: {
        created: 0,
        updated: 0,
        total: 0,
        groups_skipped: 0,
        error: null,
        skipped:
          "Each login reads that user's groups with their own token, so there is no directory to sync",
        status: 'user_token',
      },
      skipped: {
        created: 0,
        updated: 0,
        total: 0,
        groups_skipped: 0,
        error: null,
        skipped: 'disabled',
        status: 'skipped',
      },
    } satisfies Record<
      TSyncOidcProviderGroupsResponse['status'],
      TSyncOidcProviderGroupsResponse
    >,
    post: {
      success: ({
        mockedResponse = {
          created: 1,
          updated: 1,
          total: 1,
          groups_skipped: 0,
          error: null,
          skipped: null,
          status: 'ok',
        },
        name = 'name',
      }: {
        mockedResponse?: TSyncOidcProviderGroupsResponse;
        name?: string;
      } = {}) => {
        return http.post(
          oidcProviders.syncGroups.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.post(
          oidcProviders.syncGroups.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  test: {
    mockedUrl: '/api/v1/auth/oidc-providers/{name}/test',
    get: {
      success: ({
        mockedResponse = {
          success: true,
          message: 'message',
        },
        name = 'name',
      }: {
        mockedResponse?: TTestOidcProviderResponse;
        name?: string;
      } = {}) => {
        return http.get(
          oidcProviders.test.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  verifyLogin: {
    mockedUrl: '/api/v1/auth/oidc-providers/{name}/verify-login',
    get: {
      success: ({
        mockedResponse = {
          ok: true,
          checks: [
            {
              name: 'name',
              ok: true,
              detail: 'detail',
            },
          ],
        },
        name = 'name',
      }: {
        mockedResponse?: TVerifyOidcLoginResponse;
        name?: string;
      } = {}) => {
        return http.get(
          oidcProviders.verifyLogin.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.get(
          oidcProviders.verifyLogin.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
