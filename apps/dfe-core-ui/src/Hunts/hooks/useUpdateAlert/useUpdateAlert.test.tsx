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
import { useUpdateAlert } from '.';
import { TAlertUpdateRequest, TAlertUpdateResponse } from './types';
import { server } from './useUpdateAlert.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateAlert', () => {
  const parameters: TAlertUpdateRequest = {
    name: 'string',
    url: 'string',
    description: 'string',
    enabled: true,
  };
  describe('onSuccess', () => {
    test('should call onSuccess when updating', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateAlert({ onSuccess, onError, name: 'alert_name' }),
        { wrapper },
      );

      result.current.mutate({
        name: parameters.name,
        url: parameters.url,
        description: parameters.description,
        enabled: parameters.enabled,
      });

      const expectedResponse: TAlertUpdateResponse = {
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
    const requestBody: TAlertUpdateRequest = {
      name: 'string',
      url: 'string',
      description: 'string',
      enabled: true,
    };

    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.alerts.destination.put.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateAlert({ onSuccess, onError, name: 'alert_name' }),
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
