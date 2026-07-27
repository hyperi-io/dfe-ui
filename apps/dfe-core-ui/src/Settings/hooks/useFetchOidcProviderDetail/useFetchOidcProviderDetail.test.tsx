import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchOidcProviderDetail } from '.';
import { TOidcProviderDetailResponse } from './types';
import { server } from './useFetchOidcProviderDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchOidcProviderDetail', () => {
  describe('name is provided', () => {
    test('should return oidc provider detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchOidcProviderDetail({
            name: 'name',
          }),
        { wrapper },
      );

      const response: TOidcProviderDetailResponse = {
        name: 'name',
        type: 'type',
        enabled: true,
        display_name: 'display_name',
        issuer: 'issuer',
        client_id_env: 'client_id_env',
        client_secret_env: 'client_secret_env',
        created_at: 'created_at',
        last_sync_at: 'last_sync_at',
        last_sync_status: 'last_sync_status',
        sync_error: 'sync_error',
        groups: {
          mode: 'mode',
          claim_name: 'claim_name',
          sync_interval: 1,
          enrich_on_login: false,
          service_account_json_env: 'service_account_json_env',
          admin_email: 'admin_email',
          domain: 'domain',
          tenant_id_env: 'tenant_id_env',
          client_secret_env: 'client_secret_env',
          api_token_env: 'api_token_env',
          okta_domain: 'okta_domain',
        },
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: response,
          isLoading: false,
          error: null,
        });
      });
    });
  });

  describe('name is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useFetchOidcProviderDetail({ name: undefined }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
        });
      });
    });

    test('should not fetch when name is null', async () => {
      const { result } = renderHook(
        () => useFetchOidcProviderDetail({ name: null }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
        });
      });
    });
  });
});
