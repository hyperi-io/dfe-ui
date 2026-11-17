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
import { useUpdateRule } from '.';
import { TRuleUpdateRequest, TRuleUpdateResponse } from './types';
import { server } from './useUpdateRule.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateRule', () => {
  const requestBody: TRuleUpdateRequest = {
    display_name: 'string',
    severity: 'string',
    cel_filter: 'string',
  };

  const name = 'name';

  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateRule({ onSuccess, onError, name }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TRuleUpdateResponse = {
        rule: {
          display_name: 'string',
          name: 'string',
          description: 'string',
          severity: 'string',
          where_clause: 'string',
          cel_filter: 'string',
          created_at: 'string',
        },
        sanitize_summary: {
          additionalProp1: {},
        },
        sql_errors: [
          {
            message: 'string',
            position: 0,
            suggestion: 'string',
          },
        ],
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
      server.use(API_CONFIG_MOCKS.rulesV2.rule.put.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateRule({ onSuccess, onError, name }),
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
