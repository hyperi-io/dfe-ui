import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchGovernancePolicyDetail } from '.';
import { TGovernancePolicyDetailResponse } from './types';
import { server } from './useFetchGovernancePolicyDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGovernancePolicyDetail', () => {
  test('should return governance policy detail', async () => {
    const { result } = renderHook(
      () => useFetchGovernancePolicyDetail({ name: 'name' }),
      { wrapper },
    );

    const response: TGovernancePolicyDetailResponse = {
      name: 'name',
      description: 'description',
      protected: ['protected'],
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
