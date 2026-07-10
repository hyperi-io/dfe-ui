import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchFieldMapDetail } from '.';
import { TSourceFieldMapResponse } from './types';
import { server } from './useFetchFieldMapDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchFieldMapDetail', () => {
  describe('only standard is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () => useFetchFieldMapDetail({ standard: 'standard' }),
        { wrapper },
      );

      const response: TSourceFieldMapResponse = {
        standard: 'standard',
        source: null,
        version: 'string',
        description: 'string',
        inherits: 'string',
        mappings: {
          additionalProp1: 'string',
          additionalProp2: 'string',
          additionalProp3: 'string',
        },
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

  describe('both standard and source are provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchFieldMapDetail({ standard: 'standard', source: 'source' }),
        { wrapper },
      );

      const response: TSourceFieldMapResponse = {
        standard: 'standard',
        source: 'source',
        version: 'string',
        description: 'string',
        inherits: 'string',
        mappings: {
          additionalProp1: 'string',
          additionalProp2: 'string',
          additionalProp3: 'string',
        },
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
});
