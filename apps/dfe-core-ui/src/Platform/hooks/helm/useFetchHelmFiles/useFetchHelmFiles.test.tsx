import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchHelmFiles } from '.';
import { THelmFilesResponse } from './types';
import { server } from './useFetchHelmFiles.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchHelmFiles', () => {
  test('should return helm files', async () => {
    const { result } = renderHook(() => useFetchHelmFiles(), { wrapper });

    const response: THelmFilesResponse = ['string'];

    await waitFor(() => {
      expect(result.current).toEqual({
        data: response,
        isLoading: false,
        error: null,
      });
    });
  });
});
