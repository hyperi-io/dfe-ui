import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
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
import { useCreateAlert } from '.';
import { AlertCreateRequest, AlertCreateResponse } from './types';
import { server } from './useCreateAlert.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCreateAlert', () => {
  const requestBody: AlertCreateRequest = {
    name: 'string',
    url: 'string',
    description: 'string',
    enabled: true,
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateAlert({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        name: requestBody.name,
        url: requestBody.url,
        description: requestBody.description,
        enabled: requestBody.enabled,
      });

      const expectedResponse: AlertCreateResponse = {
        name: 'string',
        url: 'string',
        description: 'string',
        enabled: true,
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
      server.use(API_CONFIG_MOCKS.alerts.destinations.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateAlert({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        name: requestBody.name,
        url: requestBody.url,
        description: requestBody.description,
        enabled: requestBody.enabled,
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
