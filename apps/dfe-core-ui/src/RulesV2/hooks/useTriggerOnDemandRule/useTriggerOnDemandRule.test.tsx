import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
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
import { useTriggerOnDemandRule } from '.';
import {
  TTriggerOnDemandRuleRequest,
  TTriggerOnDemandRuleResponse,
} from './types';
import { server } from './useTriggerOnDemandRule.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useTriggerOnDemandRule', () => {
  const requestBody: TTriggerOnDemandRuleRequest = {
    source: 'string',
    cost_window_minutes: 0,
    rule: { name: 'string' },
  };

  test('sends the source beside the rule it runs', async () => {
    let received: unknown;
    server.use(
      http.post(API_CONFIG_MOCKS.rulesV2.run.mockedUrl, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({});
      }),
    );
    const { result } = renderHook(() => useTriggerOnDemandRule({}), {
      wrapper,
    });

    result.current.mutate(requestBody);

    await waitFor(() =>
      expect(received).toEqual({
        source: 'string',
        cost_window_minutes: 0,
        rule: { name: 'string' },
      }),
    );
  });

  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useTriggerOnDemandRule({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TTriggerOnDemandRuleResponse = {
        source: 'string',
        source_db: 'string',
        source_table: 'string',
        cost_window_minutes: 0,
        cost_estimate: {
          estimated_rows: 0,
          rows_in_window: 0,
          projected_per_day: 0,
          match_ratio: 0,
          band: 'unmeasured',
          window_minutes: 0,
          duration_ms: 0,
          warnings: ['string'],
        },
        sql_errors: [
          {
            message: 'string',
            position: 0,
            suggestion: 'string',
          },
        ],
        columns: ['string'],
        results: [],
        execution_time_ms: 0,
        truncated: false,
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
      server.use(API_CONFIG_MOCKS.rulesV2.run.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useTriggerOnDemandRule({ onSuccess, onError }),
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
