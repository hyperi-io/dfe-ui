import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchGroupDetail } from '.';
import { TGroupDetailResponse } from './types';
import { server } from './useFetchGroupDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGroupDetail', () => {
  describe('group_name is provided', () => {
    test('should return group detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchGroupDetail({
            group_name: 'group_name',
          }),
        { wrapper },
      );

      const response: TGroupDetailResponse = {
        name: 'group_name',
        description: 'string',
        roles: ['string'],
        members: ['string'],
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: response,
          isLoading: false,
          error: null,
        });
      });
    });
  });

  describe('group_name is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useFetchGroupDetail({ group_name: undefined }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
        });
      });
    });

    test('should not fetch when group_name is null', async () => {
      const { result } = renderHook(
        () => useFetchGroupDetail({ group_name: null }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
        });
      });
    });
  });
});
