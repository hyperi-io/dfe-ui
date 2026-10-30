import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { useFetchSystemClickhouseStatus } from '.';
import { fetchSystemClickhouseStatusApi } from './api';
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

// Scaled down: an ordinary read gives up at 300 ms, this one at 1 s.
vi.mock('@/core/config/engineTimeout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/config/engineTimeout')>()),
  ENGINE_READ_DEADLINE_MS: 300,
  ENGINE_CLICKHOUSE_CLOUD_DEADLINE_MS: 1000,
}));

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

  test('still answers when the engine takes past the read deadline', async () => {
    server.use(
      http.get('/api/v1/system/clickhouse-cloud', async () => {
        await delay(600);
        return HttpResponse.json({ configured: false });
      }),
    );

    await expect(fetchSystemClickhouseStatusApi()).resolves.toEqual({
      configured: false,
    });
  });
});
