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
import { usePlanSource } from '.';
import { SourcePlanRequest, SourcePlanResponse } from './types';
import { server } from './usePlanSource.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.usePlanSource', () => {
  const requestBody: SourcePlanRequest = {
    name: 'source',
    version: 'string',
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          usePlanSource({
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

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
          isPending: false,
          error: null,
          mutate: expect.any(Function),
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
      server.use(API_CONFIG_MOCKS.sources.plan.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => usePlanSource({ onSuccess, onError }),
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
