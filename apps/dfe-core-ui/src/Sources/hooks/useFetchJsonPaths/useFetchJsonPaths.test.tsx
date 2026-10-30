import { SCHEMA_FIELD_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { sampleRows } from '@/Sources/hooks/useFetchSampleRows/api';
import { delay, http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { useFetchJsonPaths } from '.';
import { jsonPaths } from './api';
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

// Scaled down: an ordinary read gives up at 300 ms, a table scan at 1 s.
vi.mock('@/core/config/engineTimeout', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/config/engineTimeout')>()),
  ENGINE_READ_DEADLINE_MS: 300,
  ENGINE_SCAN_DEADLINE_MS: 1000,
}));

// Both scan a whole ClickHouse table, so they outlast an ordinary read.
describe('a table scan held past the read deadline still answers', () => {
  test.each([
    [
      'json-paths',
      '/api/v1/schemas/source/json-paths',
      () => jsonPaths({ pathParams: { source_name: 'source' } }),
    ],
    [
      'sample-rows',
      '/api/v1/schemas/source/sample-rows',
      () => sampleRows({ pathParams: { source_name: 'source' } }),
    ],
  ])('%s', async (_case, path, call) => {
    server.use(
      http.get(path, async () => {
        await delay(600);
        return HttpResponse.json({ answered: true });
      }),
    );

    await expect(call()).resolves.toEqual({ answered: true });
  });
});

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
        version: 'string',
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
