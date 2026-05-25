import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSchemaDetail } from '.';
import { MetaSchemaDetailResponse } from './types';
import { server } from './useFetchSchemaDetail.mock';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSchemaDetail', () => {
  const response: MetaSchemaDetailResponse = {
    path: 'string',
    current: 'string',
    versions: ['string'],
    selected: 'string',
    version: {
      date: 'string',
      type: 'string',
      summary: 'string',
      columns: {
        items: [],
        total: 0,
        page: 0,
        per_page: 0,
        total_pages: 0,
        next_page: 0,
        prev_page: 0,
      },
    },
  };

  describe('only schema_path is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchSchemaDetail({
            schema_path: 'path',
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: response,
          isLoading: false,
          error: null,
        });
      });
    });
  });

  describe('both schema_path and version are provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchSchemaDetail({
            schema_path: 'path',
            version: '1.0.0',
          }),
        { wrapper },
      );

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
