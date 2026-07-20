import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchGovernancePolicies } from '.';
import { TGovernancePoliciesResponse } from './types';
import { server } from './useFetchGovernancePolicies.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGovernancePolicies', () => {
  test('should return governance policies', async () => {
    const { result } = renderHook(() => useFetchGovernancePolicies(), {
      wrapper,
    });

    const response: TGovernancePoliciesResponse = ['string'];

    await waitFor(() => {
      expect(result.current).toEqual({
        data: response,
        isLoading: false,
        error: null,
      });
    });
  });
});
