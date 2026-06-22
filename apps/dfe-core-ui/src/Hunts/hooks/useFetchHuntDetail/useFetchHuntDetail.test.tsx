import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchHuntDetail } from '.';
import { HuntDetailResponse } from './types';
import { server } from './useFetchHuntDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchHuntDetail', () => {
  describe('hunt_id is provided', () => {
    test('should return hunt detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchHuntDetail({
            hunt_id: 'hunt_id',
          }),
        { wrapper },
      );

      const response: HuntDetailResponse = {
        hunt_id: 'string',
        config: {
          name: 'string',
          cron: 'string',
          log_buffer: 0,
          global_target_table_name: 'string',
          global_source_table_name: 'string',
          customers: ['string'],
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

  describe('hunt_id is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useFetchHuntDetail({ hunt_id: undefined }),
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

    test('should not fetch when hunt_id is null', async () => {
      const { result } = renderHook(
        () => useFetchHuntDetail({ hunt_id: null }),
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
