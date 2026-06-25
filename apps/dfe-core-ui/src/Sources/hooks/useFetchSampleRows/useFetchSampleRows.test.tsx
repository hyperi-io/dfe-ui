import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSampleRows } from '.';
import { SampleRowsResponse } from './types';
import { server } from './useFetchSampleRows.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSampleRows', () => {
  describe('source_name is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchSampleRows({
            source_name: 'source',
          }),
        { wrapper },
      );

      const response: SampleRowsResponse = {
        source_name: 'source',
        table: 'string',
        match_field: 'string',
        match_value: 'string',
        columns: ['string'],
        rows: [{ string: 'string' }],
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
