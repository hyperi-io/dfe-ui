import { ApiError } from '@/core/config/api/client';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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
import { useUpdateRetention } from '.';
import {
  TUpdateSystemRetentionRequest,
  TUpdateSystemRetentionResponse,
} from './types';
import { server } from './useUpdateRetention.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateRetention', () => {
  const requestBody: TUpdateSystemRetentionRequest = {
    default_ttl_days: 30,
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateRetention({
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TUpdateSystemRetentionResponse = {
        stored: 30,
        effective: 30,
        origin: 'override',
        deployment_default: 90,
        reconcile: {
          summary: '0 database(s) created, 1 table(s) altered',
          tables_altered: ['dfe.main'],
          sources_reconciled: 0,
          sources_skipped: 0,
        },
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          reset: expect.any(Function),
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
    describe('422 on a negative value', () => {
      beforeEach(() => {
        server.use(API_CONFIG_MOCKS.system.retention.put.error());
      });
      test('should call onError', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const { result } = renderHook(
          () =>
            useUpdateRetention({
              onSuccess,
              onError,
            }),
          { wrapper },
        );

        result.current.mutate({ default_ttl_days: -1 });

        await waitFor(() => {
          expect(onError).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(onSuccess).not.toHaveBeenCalled();
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect((result.current.error as ApiError).status).toBe(422);
      });
    });

    describe('502 when the override is stored but the reconcile failed', () => {
      beforeEach(() => {
        server.use(API_CONFIG_MOCKS.system.retention.put.reconcileFailed());
      });
      test('should call onError with the engine message', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const { result } = renderHook(
          () =>
            useUpdateRetention({
              onSuccess,
              onError,
            }),
          { wrapper },
        );

        result.current.mutate(requestBody);

        await waitFor(() => {
          expect(onError).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(onSuccess).not.toHaveBeenCalled();
        });

        const error = result.current.error as ApiError;
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(502);
        expect(error.message).toContain('ClickHouse reconcile failed');
      });
    });
  });
});
