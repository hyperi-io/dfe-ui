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
import { useUpdateHunt } from '.';
import { HuntUpdateRequest, HuntUpdateResponse } from './types';
import { server } from './useUpdateHunt.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateHunt', () => {
  const parameters: HuntUpdateRequest = {
    display_name: 'string',
    cron: 'string',
    log_buffer: 0,
    global_target_table_name: 'string',
    global_source_table_name: 'string',
    customers: ['string'],
    rules: ['string'],
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
  describe('onSuccess', () => {
    test('should call onSuccess when updating', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateHunt({ onSuccess, onError, name: 'name' }),
        { wrapper },
      );

      result.current.mutate({
        display_name: parameters.display_name,
        cron: parameters.cron,
        log_buffer: parameters.log_buffer,
        global_target_table_name: parameters.global_target_table_name,
        global_source_table_name: parameters.global_source_table_name,
        customers: parameters.customers,
        rules: parameters.rules,
        customer_filters: parameters.customer_filters,
        checkpoint_timestamp_field: parameters.checkpoint_timestamp_field,
        scheduling_mode: parameters.scheduling_mode,
        min_interval_seconds: parameters.min_interval_seconds,
        explain_queries: parameters.explain_queries,
      });

      const expectedResponse: HuntUpdateResponse = {
        name: 'string',
        display_name: 'string',
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
    const requestBody: HuntUpdateRequest = {
      display_name: 'string',
      cron: 'string',
      log_buffer: 0,
      global_target_table_name: 'string',
      global_source_table_name: 'string',
      customers: ['string'],
      rules: ['string'],
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

    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.hunts.hunt.put.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateHunt({ onSuccess, onError, name: 'name' }),
        { wrapper },
      );

      result.current.mutate({
        display_name: requestBody.display_name,
        cron: requestBody.cron,
        log_buffer: requestBody.log_buffer,
        global_target_table_name: requestBody.global_target_table_name,
        global_source_table_name: requestBody.global_source_table_name,
        customers: requestBody.customers,
        rules: requestBody.rules,
        customer_filters: requestBody.customer_filters,
        checkpoint_timestamp_field: requestBody.checkpoint_timestamp_field,
        scheduling_mode: requestBody.scheduling_mode,
        min_interval_seconds: requestBody.min_interval_seconds,
        explain_queries: requestBody.explain_queries,
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
