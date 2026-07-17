import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchGovernanceActions } from '.';
import { TGovernanceActionsResponse } from './types';
import { server } from './useFetchGovernanceActions.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGovernanceActions', () => {
  test('should return governance actions', async () => {
    const { result } = renderHook(() => useFetchGovernanceActions(), {
      wrapper,
    });

    const response: TGovernanceActionsResponse = ['string'];

    await waitFor(() => {
      expect(result.current).toEqual({
        data: response,
        isLoading: false,
        error: null,
      });
    });
  });
});
