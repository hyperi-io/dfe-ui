import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchHelmFileVariables } from '.';
import { THelmFileVariablesResponse } from './types';
import { server } from './useFetchHelmFileVariables.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchHelmFileVariables', () => {
  test('should return helm file variables', async () => {
    const { result } = renderHook(
      () => useFetchHelmFileVariables({ name: 'name' }),
      { wrapper },
    );

    const response: THelmFileVariablesResponse = [
      {
        test: ['test'],
      },
    ];

    await waitFor(() => {
      expect(result.current).toEqual({
        data: response,
        isLoading: false,
        error: null,
      });
    });
  });
});
