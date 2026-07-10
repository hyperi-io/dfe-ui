import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchAlertDetail } from '.';
import { AlertDetailResponse } from './types';
import { server } from './useFetchAlertDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchAlertDetail', () => {
  describe('name is provided', () => {
    test('should return alert detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchAlertDetail({
            name: 'name',
          }),
        { wrapper },
      );

      const response: AlertDetailResponse = {
        name: 'string',
        url: 'string',
        description: 'string',
        enabled: true,
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

  describe('name is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(() => useFetchAlertDetail({ name: null }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
        });
      });
    });

    test('should not fetch when name is null', async () => {
      const { result } = renderHook(
        () => useFetchAlertDetail({ name: undefined }),
        {
          wrapper,
        },
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
