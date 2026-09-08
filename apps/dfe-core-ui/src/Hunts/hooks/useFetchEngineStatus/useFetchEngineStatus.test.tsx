import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchEngineStatus } from '.';
import { THuntEngineStatus } from './types';
import { server } from './useFetchEngineStatus.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchEngineStatus', () => {
  describe('username is provided', () => {
    test('should return account detail', async () => {
      const { result } = renderHook(() => useFetchEngineStatus(), { wrapper });

      const response: THuntEngineStatus = {
        running: true,
        runners: 1,
        hunt_count: 1,
        scheduling_mode: 'string',
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
