import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useFeatureFlagStore } from '@/core/stores/system/featureFlagStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { useFetchFeatureFlags } from '.';
import { TFeatureFlagsResponse } from './types';
import { server } from './useFetchFeatureFlags.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
beforeEach(() => {
  useFeatureFlagStore.getState().reset();
});
afterEach(() => {
  server.resetHandlers();
  useFeatureFlagStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const expectedFeatures: TFeatureFlagsResponse = { feature: true };

describe('.useFetchFeatureFlags', () => {
  describe('onSuccess', () => {
    test('fetches features when store is empty and writes features', async () => {
      const { result } = renderHook(() => useFetchFeatureFlags(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedFeatures,
          isLoading: false,
          error: null,
        });
      });

      expect(useFeatureFlagStore.getState().features).toEqual(expectedFeatures);
    });

    test('returns store data without refetching when already set', async () => {
      useFeatureFlagStore.getState().setFeatures(expectedFeatures);

      const { result } = renderHook(() => useFetchFeatureFlags(), {
        wrapper,
      });

      expect(result.current).toEqual({
        data: expectedFeatures,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.clientConfig.features.get.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useFetchFeatureFlags(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
      // No client-side fallback stands in for the engine's answer.
      expect(result.current.data).toBeUndefined();
      expect(useFeatureFlagStore.getState().features).toBeNull();
    });
  });
});
