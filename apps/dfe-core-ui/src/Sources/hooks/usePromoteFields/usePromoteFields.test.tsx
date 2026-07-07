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
import { usePromoteFields } from '.';
import { PromoteFieldRequest, PromoteFieldResponse } from './types';
import { server } from './usePromoteFields.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.usePromoteFields', () => {
  const requestBody: PromoteFieldRequest = {
    json_path: ['string'],
    atomic: false,
    column_name: 'string',
    data_type: 'string',
    index_type: 'minmax',
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          usePromoteFields({
            onSuccess,
            onError,
            source_name: 'source',
            source_version: 'version',
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: PromoteFieldResponse = {
        source_name: 'source',
        schema_version: 'string',
        results: [
          {
            json_path: 'string',
            status: 'ok',
            column_name: 'string',
            data_type: 'string',
            index_type: 'string',
            copy_cel: 'string',
            error: 'string',
          },
        ],
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
      server.use(API_CONFIG_MOCKS.schemas.promoteField.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          usePromoteFields({
            onSuccess,
            onError,
            source_name: 'source',
            source_version: 'version',
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
