import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSystemClickhouseStatus } from '.';
import { TSystemClickhouseStatusResponse } from './types';
import { server } from './useFetchSystemClickhouseStatus.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSystemClickhouseStatus', () => {
  test('should return system clickhouse status', async () => {
    const { result } = renderHook(() => useFetchSystemClickhouseStatus(), {
      wrapper,
    });

    const response: TSystemClickhouseStatusResponse = {
      configured: true,
      id: 'id',
      name: 'name',
      state: 'state',
      is_running: true,
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
