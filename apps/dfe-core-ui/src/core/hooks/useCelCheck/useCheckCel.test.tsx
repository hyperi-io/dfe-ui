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
import { useCheckCel } from '.';
import { TCheckCelRequest, TCheckCelResponse } from './types';
import { server } from './useCheckCel.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCheckCel', () => {
  const requestBody: TCheckCelRequest = {
    expression: 'string',
    check_profile: true,
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() => useCheckCel({ onSuccess, onError }), {
        wrapper,
      });

      result.current.mutate(requestBody);

      const expectedResponse: TCheckCelResponse = {
        valid: true,
        errors: ['string'],
        tier: 'tier1',
        tier_label: 'string',
        fields: ['string'],
        op_kind: 'string',
        op_field: 'string',
        op_value: 'string',
        description: 'string',
        opt_in_required: 'string',
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          mutate: expect.any(Function),
          reset: expect.any(Function),
          isPending: false,
          error: null,
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
      server.use(API_CONFIG_MOCKS.cel.check.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() => useCheckCel({ onSuccess, onError }), {
        wrapper,
      });

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
