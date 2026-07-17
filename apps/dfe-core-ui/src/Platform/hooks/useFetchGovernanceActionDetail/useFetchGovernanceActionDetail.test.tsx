import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchGovernanceActionDetail } from '.';
import { TGovernanceActionDetailResponse } from './types';
import { server } from './useFetchGovernanceActionDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGovernanceActionDetail', () => {
  test('should return governance action detail', async () => {
    const { result } = renderHook(
      () => useFetchGovernanceActionDetail({ name: 'name' }),
      { wrapper },
    );

    const response: TGovernanceActionDetailResponse = {
      name: 'name',
      description: 'description',
      required_action: 'required_action',
      changes: [
        {
          cls: 'cls',
          name: 'name',
          path: 'path',
          value: 'value',
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
