import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useSystemDefaultsStore } from '@/core/stores/systemDefaultsStore';
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
import { useFetchSystemDefaults } from '.';
import { TSystemDefaults } from './types';
import { server } from './useFetchSystemDefaults.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
  useSystemDefaultsStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const expectedDefaults: TSystemDefaults = {
  default_ttl_days: 90,
  default_engine: 'MergeTree',
  default_header_type: 'common-header/timeseries',
  default_header_version: '1.0.1',
};

describe('.useFetchSystemDefaults', () => {
  describe('onSuccess', () => {
    test('fetches settings when store is empty and writes defaults', async () => {
      const { result } = renderHook(() => useFetchSystemDefaults(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedDefaults,
          isLoading: false,
          error: null,
        });
      });

      expect(useSystemDefaultsStore.getState().defaults).toEqual(
        expectedDefaults,
      );
    });

    test('returns store data without refetching when already set', async () => {
      useSystemDefaultsStore.getState().setDefaults(expectedDefaults);

      const { result } = renderHook(() => useFetchSystemDefaults(), {
        wrapper,
      });

      expect(result.current).toEqual({
        data: expectedDefaults,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.system.settings.get.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useFetchSystemDefaults(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });
});
