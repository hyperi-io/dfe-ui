import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchServiceConfigHistory } from '.';
import { TFetchServiceConfigHistoryResponse } from './types';
import { server } from './useFetchServiceConfigHistory.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchServiceConfigHistory', () => {
  describe('only service_name is provided', () => {
    test('should not return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchServiceConfigHistory({
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
          useFetchServiceConfigHistory({
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
          useFetchServiceConfigHistory({
            service_name: 'service',
            service_instance: 'instance',
          }),
        { wrapper },
      );

      const expectedResponse: TFetchServiceConfigHistoryResponse = [
        {
          commit: 'string',
          message: 'string',
          author: 'string',
          date: 'string',
        },
      ];
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
