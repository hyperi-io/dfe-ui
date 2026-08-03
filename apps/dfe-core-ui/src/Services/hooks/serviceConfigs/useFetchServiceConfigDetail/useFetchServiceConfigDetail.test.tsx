import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchServiceConfigDetail } from '.';
import { TFetchServiceConfigDetailResponse } from './types';
import { server } from './useFetchServiceConfigDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchServiceConfigDetail', () => {
  describe('only service_name is provided', () => {
    test('should not return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchServiceConfigDetail({
            service_name: 'service',
            service_instance: null,
          }),
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

  describe('only service_instance is provided', () => {
    test('should not return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchServiceConfigDetail({
            service_name: null,
            service_instance: 'instance',
          }),
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

  describe('both standard and source are provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchServiceConfigDetail({
            service_name: 'service',
            service_instance: 'instance',
          }),
        { wrapper },
      );

      const expectedResponse: TFetchServiceConfigDetailResponse = {
        service: 'service',
        instance: 'instance',
        config: {},
      };
      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          isLoading: false,
          error: null,
        });
      });
    });
  });
});
