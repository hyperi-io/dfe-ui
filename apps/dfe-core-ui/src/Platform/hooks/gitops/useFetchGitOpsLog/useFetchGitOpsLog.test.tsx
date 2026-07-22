import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { useFetchGitOpsLog } from '.';
import { server } from './useFetchGitOpsLog.mocks';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGitOpsLog', () => {
  test('should return git ops log entries', async () => {
    const { result } = renderHook(() => useFetchGitOpsLog(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data.entries).toHaveLength(1);
    expect(result.current.data.entries[0]?.sha).toBe('string');
    expect(result.current.error).toBeNull();
    expect(result.current.loadMoreRef).toBeDefined();
    expect(result.current.loadMoreRef).toHaveProperty('current');
  });
});
