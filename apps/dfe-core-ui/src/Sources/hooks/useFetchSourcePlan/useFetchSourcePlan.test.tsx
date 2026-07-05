import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSourcePlan } from '.';
import { SourcePlanResponse } from './types';
import { server } from './useFetchSourcePlan.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSourcePlan', () => {
  describe('source_name is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchSourcePlan({
            source_name: 'source',
            version: '1.0.0',
          }),
        { wrapper },
      );

      const expectedResponse: SourcePlanResponse = {
        source_name: 'string',
        version: 'string',
        planned_at: 'string',
        table_exists: true,
        validation_errors: ['string'],
        statements: ['string'],
        ddl: {
          source_name: 'string',
          create_table: 'string',
          views: {
            view1: 'string',
            view2: 'string',
          },
        },
        ready: true,
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          isLoading: false,
          error: null,
        });
      });
    });
  });
});
