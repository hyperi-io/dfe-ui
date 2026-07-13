import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchJsonPaths } from '.';
import { TJsonPathsResponse } from './types';
import { server } from './useFetchJsonPaths.mocks';

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
          useFetchJsonPaths({
            source_name: 'source',
          }),
        { wrapper },
      );

      const response: TJsonPathsResponse = {
        source_name: 'source',
        table: 'string',
        json_column: 'string',
        paths: [
          {
            path: 'string',
            types: ['string'],
            is_consistent: true,
            promoted_to: 'string',
            column: {
              name: 'string',
              type: 'string',
              attribute: ['string'],
              use_case: 'string',
              expr: 'string',
              comment: 'string',
              _field_type: SCHEMA_FIELD_TYPES.PROMOTED,
            },
            coverage_pct: 100,
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
});
