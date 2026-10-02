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
import { useUpdateSystemDefaults } from '.';
import {
  TUpdateSystemDefaultsRequest,
  TUpdateSystemDefaultsResponse,
} from './types';
import { server } from './useUpdateDefaults.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateSystemDefaults', () => {
  const requestBody: TUpdateSystemDefaultsRequest = {
    ttl_days: 90,
    common_header_type: 'string',
    common_header_version: 'string',
    engine: 'string',
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateSystemDefaults({
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TUpdateSystemDefaultsResponse = {
        ttl_days: {
          effective: 90,
          stored: null,
          origin: 'deployment',
          deployment_default: 90,
        },
        common_header_type: {
          effective: 'string',
          stored: null,
          origin: 'deployment',
          deployment_default: 'string',
        },
        common_header_version: {
          effective: 'string',
          stored: null,
          origin: 'deployment',
          deployment_default: 'string',
        },
        engine: {
          effective: 'string',
          stored: null,
          origin: 'deployment',
          deployment_default: 'string',
        },
        editable: true,
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
      server.use(API_CONFIG_MOCKS.system.defaults.patch.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateSystemDefaults({
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
