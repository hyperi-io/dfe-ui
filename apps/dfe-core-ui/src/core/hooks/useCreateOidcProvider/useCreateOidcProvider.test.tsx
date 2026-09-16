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
import { useCreateOidcProvider } from '.';
import {
  TCreateOidcProviderRequest,
  TCreateOidcProviderResponse,
} from './types';
import { server } from './useCreateOidcProvider.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCreateOidcProvider', () => {
  const requestBody: TCreateOidcProviderRequest = {
    name: 'string',
    type: 'generic',
    display_name: 'string',
    issuer: 'string',
    client_id_env: 'string',
    client_secret_env: 'string',
    client_id: 'string',
    client_secret: 'string',
    groups: {
      mode: 'manual',
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
      service_account_json: 'string',
      client_secret: 'string',
      api_token: 'string',
    },
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateOidcProvider({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TCreateOidcProviderResponse = {
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
        groups: {
          mode: 'manual',
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
          service_account_json_path: 'service_account_json_path',
          client_secret_path: 'client_secret_path',
          api_token_path: 'api_token_path',
        },
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
      server.use(API_CONFIG_MOCKS.oidcProviders.default.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateOidcProvider({ onSuccess, onError }),
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
