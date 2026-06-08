import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSourceColumns } from '.';
import { UseFetchSourceColumnsResponse } from './types';
import { server } from './useFetchSourceColumns.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSourceColumns', () => {
  describe('source_name is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () => useFetchSourceColumns({ source_name: 'source' }),
        { wrapper },
      );

      const response: UseFetchSourceColumnsResponse = [
        {
          name: 'string',
          type: 'string',
          use_case: '',
          attribute: '',
          description: '',
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

  describe('source_name is not provided', () => {
    test('should not fetch data', async () => {
      const { result } = renderHook(
        () => useFetchSourceColumns({ source_name: '' }),
        { wrapper },
      );

      expect(result.current).toEqual({
        data: undefined,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('onError', () => {
    test('should return error', async () => {
      server.use(API_CONFIG_MOCKS.schemas.sourceColumns.get.error());
      const { result } = renderHook(
        () => useFetchSourceColumns({ source_name: 'source' }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: expect.objectContaining({
            message: 'An unexpected error occurred',
          }),
        });
      });
    });
  });
});
