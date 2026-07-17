import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchGitOpsAutoMerge } from '.';
import { TGitOpsAutoMergeResponse } from './types';
import { server } from './useFetchGitOpsAutoMerge.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGitOpsAutoMerge', () => {
  test('should return git ops auto merge', async () => {
    const { result } = renderHook(() => useFetchGitOpsAutoMerge(), { wrapper });

    const response: TGitOpsAutoMergeResponse = {
      stored: true,
      effective: true,
      allowed: true,
      reason: 'string',
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
