import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { useUpdateOidcProvider } from '.';
import {
  TOidcProviderUpdateRequestBody,
  TOidcProviderUpdateResponse,
} from './types';
import { server } from './useUpdateOidcProvider.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateOidcProvider', () => {
  const requestBody: TOidcProviderUpdateRequestBody = {
    display_name: 'string',
    enabled: true,
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateOidcProvider({
            name: 'name',
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TOidcProviderUpdateResponse = {
        name: 'name',
        display_name: 'display_name',
        enabled: true,
        type: 'type',
        issuer: 'issuer',
        client_id_env: 'client_id_env',
        groups: {
          mode: 'mode',
          claim_name: 'claim_name',
          sync_interval: 1,
          service_account_json_env: 'service_account_json_env',
          admin_email: 'admin_email',
          domain: 'domain',
          tenant_id_env: 'tenant_id_env',
          client_secret_env: 'client_secret_env',
          api_token_env: 'api_token_env',
          okta_domain: 'okta_domain',
        },
        created_at: 'created_at',
        last_sync_at: 'last_sync_at',
        last_sync_status: 'last_sync_status',
        sync_error: 'sync_error',
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          data: expectedResponse,
        });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(expectedResponse);
      });

      await waitFor(() => {
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.oidcProviders.provider.put.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateOidcProvider({
            name: 'name',
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
