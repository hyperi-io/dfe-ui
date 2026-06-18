import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchRoleDetail } from '.';
import { RoleDetail } from './types';
import { server } from './useFetchRoleDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchRoleDetail', () => {
  describe('role_name is provided', () => {
    test('should return role detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchRoleDetail({
            role_name: 'role_name',
          }),
        { wrapper },
      );

      const response: RoleDetail = {
        name: 'string',
        description: 'string',
        permissions: ['string'],
        scoped: false,
        resource_type: 'string',
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

  describe('role_name is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useFetchRoleDetail({ role_name: undefined }),
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

    test('should not fetch when role_name is null', async () => {
      const { result } = renderHook(
        () => useFetchRoleDetail({ role_name: null }),
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
