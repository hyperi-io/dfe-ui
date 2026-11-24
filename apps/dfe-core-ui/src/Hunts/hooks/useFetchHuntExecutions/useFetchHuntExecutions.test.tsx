import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchHuntExecutions } from '.';
import { THuntExecutionsResponse } from './types';
import { server } from './useFetchHuntExecutions.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchHuntExecutions', () => {
  describe('name is provided', () => {
    test('should return hunt executions', async () => {
      const { result } = renderHook(
        () =>
          useFetchHuntExecutions({
            name: 'name',
          }),
        { wrapper },
      );

      const response: THuntExecutionsResponse = {
        items: [
          {
            execution_id: 'execution_id',
            fire: 1,
            status: 'status',
            rows_returned: 1,
            execution_time_ms: 1000,
            cost_window_minutes: 10,
            cost_estimate: {
              estimated_rows: 1000,
              rows_in_window: 1000,
              projected_per_day: 1000,
              match_ratio: 1000,
              band: 'warn',
              window_minutes: 10,
              duration_ms: 1000,
            },
          },
        ],
        total_size: 1,
        next_page_token: null,
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
        () => useFetchHuntExecutions({ name: undefined }),
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
        () => useFetchHuntExecutions({ name: null }),
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
