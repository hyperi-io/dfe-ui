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
import { useSystemStopStartClickhouseCloud } from '.';
import { TSystemStartStopClickhouseCloudResponse } from './types';
import { server } from './useSystemStopStartClickhouseCloud.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useSystemStopStartClickhouseCloud', () => {
  describe('action: stop', () => {
    const requestAction = 'stop';
    describe('onSuccess', () => {
      test('should call onSuccess', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const { result } = renderHook(
          () =>
            useSystemStopStartClickhouseCloud({
              onSuccess,
              onError,
            }),
          { wrapper },
        );

        result.current.mutate(requestAction);

        const expectedResponse: TSystemStartStopClickhouseCloudResponse = {
          configured: true,
          id: 'id',
          name: 'stop',
          state: 'state',
          is_running: true,
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
        server.use(API_CONFIG_MOCKS.system.clickhouseCloudStop.post.error());
      });
      test('should call onError', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const { result } = renderHook(
          () =>
            useSystemStopStartClickhouseCloud({
              onSuccess,
              onError,
            }),
          { wrapper },
        );

        result.current.mutate(requestAction);

        await waitFor(() => {
          expect(onError).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(onSuccess).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('action: start', () => {
    const requestAction = 'start';
    describe('onSuccess', () => {
      test('should call onSuccess', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const { result } = renderHook(
          () =>
            useSystemStopStartClickhouseCloud({
              onSuccess,
              onError,
            }),
          { wrapper },
        );

        result.current.mutate(requestAction);

        const expectedResponse: TSystemStartStopClickhouseCloudResponse = {
          configured: true,
          id: 'id',
          name: 'start',
          state: 'state',
          is_running: true,
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
        server.use(API_CONFIG_MOCKS.system.clickhouseCloudStart.post.error());
      });
      test('should call onError', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const { result } = renderHook(
          () =>
            useSystemStopStartClickhouseCloud({
              onSuccess,
              onError,
            }),
          { wrapper },
        );

        result.current.mutate(requestAction);

        await waitFor(() => {
          expect(onError).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(onSuccess).not.toHaveBeenCalled();
        });
      });
    });
  });
});
