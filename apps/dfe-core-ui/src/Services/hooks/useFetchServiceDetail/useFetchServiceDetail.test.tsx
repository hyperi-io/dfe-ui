import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchServiceDetail } from '.';
import { server } from './useFetchServiceDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchServiceDetail', () => {
  describe('only service_name is provided', () => {
    test('should not return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchServiceDetail({
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
          useFetchServiceDetail({
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
          useFetchServiceDetail({
            service_name: 'service',
            service_instance: 'instance',
          }),
        { wrapper },
      );

      const response = {
        service: 'service',
        instance: 'instance',
        updated_at: '2021-01-01T00:00:00Z',
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
});
