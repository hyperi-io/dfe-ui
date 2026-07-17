import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchGitOpsLog } from '.';
import { TGitOpsLogResponse } from './types';
import { server } from './useFetchGitOpsLog.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGitOpsLog', () => {
  test('should return git ops log', async () => {
    const { result } = renderHook(() => useFetchGitOpsLog(), { wrapper });

    const response: TGitOpsLogResponse = {
      entries: [
        {
          sha: 'string',
          timestamp: 0,
          ctype: 'string',
          scope: 'string',
          summary: 'string',
          actor: 'string',
          role: 'string',
          action: 'string',
          request_id: 'string',
          files: ['string'],
          resources: ['string'],
          conforming: true,
          state: 'string',
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
