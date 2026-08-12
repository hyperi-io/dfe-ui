import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSetupStatus } from '.';
import { TFetchSetupStatusResponse } from './types';
import { server } from './useFetchSetupStatus.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSetupStatus', () => {
  test('should return data', async () => {
    const { result } = renderHook(() => useFetchSetupStatus(), { wrapper });

    const response: TFetchSetupStatusResponse = {
      initial_setup: {
        complete: false,
        current_step: null,
        steps: [],
        pending_steps: [],
        completed_steps: [],
        step_details: [],
      },
      oidc_providers: [],
      organisations: [],
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
