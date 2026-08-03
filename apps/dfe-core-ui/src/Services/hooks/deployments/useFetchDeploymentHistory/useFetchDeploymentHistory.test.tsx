import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchDeploymentHistory } from '.';
import { TFetchDeploymentHistoryResponse } from './types';
import { server } from './useFetchDeploymentHistory.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchDeploymentHistory', () => {
  describe('only service_instance is provided', () => {
    test('should not return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchDeploymentHistory({
            service_name: 'string',
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
          useFetchDeploymentHistory({
            service_name: null,
            service_instance: 'string',
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

  describe('both service_name and service_instance are provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchDeploymentHistory({
            service_name: 'string',
            service_instance: 'string',
          }),
        { wrapper },
      );

      const expectedResponse: TFetchDeploymentHistoryResponse = [
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
