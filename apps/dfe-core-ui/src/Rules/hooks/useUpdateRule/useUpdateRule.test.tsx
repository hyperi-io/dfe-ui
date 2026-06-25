import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
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
  vi,
} from 'vitest';
import { useUpdateRule } from '.';
import { RuleUpdateRequest, RuleUpdateResponse } from './types';
import { server } from './useUpdateRule.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateRule', () => {
  const requestBody: RuleUpdateRequest = {
    display_name: 'string',
    severity: 'string',
    source: 'string',
    user_sql: 'string',
    cel_filter: 'string',
    hunt_name: 'string',
    estimate_cost: false,
    cost_window_minutes: 60,
  };

  const name = 'name';

  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateRule({ onSuccess, onError, name }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: RuleUpdateResponse = {
        rule: {
          display_name: 'string',
          name: 'string',
          severity: 'string',
          source_db: 'string',
          source_table: 'string',
          where_clause: 'string',
          cel_filter: 'string',
          original_sql: 'string',
          hunt_name: 'string',
          source: 'string',
          warnings: ['string'],
          created_at: 'string',
        },
        sanitize_summary: {
          additionalProp1: {},
        },
        sql_errors: [
          {
            message: 'string',
            position: 0,
            suggestion: 'string',
          },
        ],
        cost_estimate: {
          estimated_rows: 0,
          explain_plan: 'string',
          explain_duration_ms: 0,
          window_minutes: 60,
          warnings: ['string'],
        },
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          reset: expect.any(Function),
        });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(expectedResponse);
      });

      await waitFor(() => {
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.rules.rule.put.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateRule({ onSuccess, onError, name }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
