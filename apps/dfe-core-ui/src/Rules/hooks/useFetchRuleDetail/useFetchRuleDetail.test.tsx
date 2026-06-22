import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchRuleDetail } from '.';
import { RuleDetail } from './types';
import { server } from './useFetchRuleDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchRuleDetail', () => {
  describe('rule_id is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchRuleDetail({
            rule_id: 'rule_id',
          }),
        { wrapper },
      );

      const response: RuleDetail = {
        rule_id: 'string',
        name: 'string',
        severity: 'string',
        source: 'string',
        source_db: 'string',
        source_table: 'string',
        where_clause: 'string',
        cel_filter: 'string',
        original_sql: 'string',
        hunt_name: 'string',
        created_at: 'string',
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
