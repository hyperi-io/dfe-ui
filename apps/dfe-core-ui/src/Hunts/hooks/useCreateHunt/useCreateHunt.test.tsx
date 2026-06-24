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
import { useCreateHunt } from '.';
import { HuntCreateRequest, HuntCreateResponse } from './types';
import { server } from './useCreateHunt.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCreateHunt', () => {
  const requestBody: HuntCreateRequest = {
    hunt_id: 'string',
    name: 'string',
    cron: 'string',
    log_buffer: 0,
    global_target_table_name: 'string',
    global_source_table_name: 'string',
    customers: ['string'],
    rules: ['string'],
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateHunt({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        name: requestBody.name,
        cron: requestBody.cron,
        log_buffer: requestBody.log_buffer,
        global_target_table_name: requestBody.global_target_table_name,
        global_source_table_name: requestBody.global_source_table_name,
        customers: requestBody.customers,
        rules: requestBody.rules,
        hunt_id: requestBody.hunt_id,
      });

      const expectedResponse: HuntCreateResponse = {
        hunt_id: 'string',
        name: 'string',
        cron: 'string',
        log_buffer: 0,
        global_target_table_name: 'string',
        global_source_table_name: 'string',
        customers: ['string'],
        rules: [
          {
            rule_name: 'string',
            target_table_name: 'string',
            source: 'string',
            initial_checkpoint_lookback_minutes: 0,
          },
        ],
        customer_filters: {
          string: {
            filters: ['string'],
          },
        },
        checkpoint_timestamp_field: 'string',
        scheduling_mode: 'string',
        min_interval_seconds: 0,
        explain_queries: false,
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          data: expectedResponse,
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
      server.use(API_CONFIG_MOCKS.hunts.default.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateHunt({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        name: requestBody.name,
        cron: requestBody.cron,
        log_buffer: requestBody.log_buffer,
        global_target_table_name: requestBody.global_target_table_name,
        global_source_table_name: requestBody.global_source_table_name,
        customers: requestBody.customers,
        rules: requestBody.rules,
        hunt_id: requestBody.hunt_id,
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
