import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchServiceSurfaceDetail } from '.';
import { TServiceSurfaceDetailResponse } from './types';
import { server } from './useFetchServiceSurfaceDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchServiceSurfaceDetail', () => {
  describe('name is provided', () => {
    test('should return service surface detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchServiceSurfaceDetail({
            name: 'string',
          }),
        { wrapper },
      );

      const response: TServiceSurfaceDetailResponse = {
        service: 'string',
        description: 'string',
        manifest_url: 'string',
        discovered_at: 'string',
        config_surface: {
          string: {
            type: 'string',
            description: 'string',
            default: 'string',
          },
        },
        metrics_surface: [
          {
            name: 'string',
            type: 'string',
            description: 'string',
            unit: 'string',
            labels: ['string'],
            group: 'string',
          },
        ],
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
      const { result } = renderHook(
        () => useFetchServiceSurfaceDetail({ name: undefined }),
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

    test('should not fetch when name is null', async () => {
      const { result } = renderHook(
        () => useFetchServiceSurfaceDetail({ name: null }),
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
