import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
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
import { useTriggerHunt } from '.';
import { TTriggerResponse } from './types';
import { server } from './useTriggerHunt.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useTriggerHunt', () => {
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useTriggerHunt({ onSuccess, onError, name: 'name' }),
        { wrapper },
      );

      result.current.mutate();

      const expectedResponse: TTriggerResponse = {
        hunt_name: 'string',
        queued: true,
        requested_fire: 0,
        poll_seconds: 0,
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          data: expectedResponse,
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

  describe('the hunt it queued a run for', () => {
    test('has its detail and run state read again, and no other hunt does', async () => {
      server.use(
        API_CONFIG_MOCKS.hunts.huntRun.post.success({ name: 'audit' }),
      );
      const builder = buildTestWrapper().withReactQuery();
      const { result } = renderHook(() => useTriggerHunt({ name: 'audit' }), {
        wrapper: builder.wrapper,
      });
      const queryClient = builder.queryClient;
      if (!queryClient) {
        throw new Error('the query client is set once the wrapper mounts');
      }
      const detail = QUERY_KEYS.hunts.hunt({ name: 'audit' });
      const runState = [...detail, 'run-state'];
      const other = QUERY_KEYS.hunts.hunt({ name: 'other' });
      [detail, runState, other].forEach((key) =>
        queryClient.setQueryData(key, {}),
      );

      result.current.mutate();

      await waitFor(() => {
        expect(queryClient.getQueryState(detail)?.isInvalidated).toBe(true);
      });
      expect(queryClient.getQueryState(runState)?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(other)?.isInvalidated).toBe(false);
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.hunts.huntRun.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useTriggerHunt({ onSuccess, onError, name: 'name' }),
        { wrapper },
      );

      result.current.mutate();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
