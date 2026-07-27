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
import { useUpdateHelmFileVariable } from '.';
import {
  THelmFileVariableRequest,
  TUpdateHelmFileVariableResponse,
} from './types';
import { server } from './useUpdateHelmFileVariable.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateHelmFileVariable', () => {
  const requestBody: THelmFileVariableRequest = {
    value: 'string',
  };
  const name = 'name';
  const path = 'path';
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateHelmFileVariable({
            name,
            path,
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TUpdateHelmFileVariableResponse = {
        changed: true,
        commit_sha: 'string',
        auto_merged: true,
        review_required: true,
        pr_url: 'string',
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
      server.use(API_CONFIG_MOCKS.helm.fileVariable.put.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateHelmFileVariable({
            name,
            path,
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
    });
  });
});
