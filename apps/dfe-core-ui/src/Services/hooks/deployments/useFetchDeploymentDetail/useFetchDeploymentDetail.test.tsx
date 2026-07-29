import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchDeploymentDetail } from '.';
import { TDeploymentDetailResponse } from './types';
import { server } from './useFetchDeploymentDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchDeploymentDetail', () => {
  describe('service and instance are provided', () => {
    test('should return deployment detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchDeploymentDetail({
            service: 'string',
            instance: 'string',
          }),
        { wrapper },
      );

      const response: TDeploymentDetailResponse = {
        service: 'service',
        instance: 'instance',
        config: {
          size: 'small',
          replicas: 1,
          keda_enabled: true,
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

  describe('service and instance are not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchDeploymentDetail({ service: undefined, instance: undefined }),
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

    test('should not fetch when service and instance are null', async () => {
      const { result } = renderHook(
        () => useFetchDeploymentDetail({ service: null, instance: null }),
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
