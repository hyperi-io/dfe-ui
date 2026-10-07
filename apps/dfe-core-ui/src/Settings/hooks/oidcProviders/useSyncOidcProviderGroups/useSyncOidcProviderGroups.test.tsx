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
import { useSyncOidcProviderGroups } from '.';
import { TSyncOidcProviderGroupsResponse } from './types';
import { server } from './useSyncOidcProviderGroups.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useSyncOidcProviderGroups', () => {
  const name = 'name';
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useSyncOidcProviderGroups({
            name,
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate();

      const expectedResponse: TSyncOidcProviderGroupsResponse = {
        created: 1,
        updated: 1,
        total: 1,
        groups_skipped: 0,
        error: null,
        skipped: null,
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

  describe('a skipped sync', () => {
    test('passes the reason through', async () => {
      const skipped =
        "groups mode is 'manual': group membership is managed in DFE, so there is no directory to sync";
      server.use(
        API_CONFIG_MOCKS.oidcProviders.syncGroups.post.success({
          mockedResponse: {
            created: 0,
            updated: 0,
            total: 0,
            groups_skipped: 0,
            error: null,
            skipped,
          },
        }),
      );
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () => useSyncOidcProviderGroups({ name, onSuccess }),
        { wrapper },
      );

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.data?.skipped).toBe(skipped);
      });
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ skipped }),
      );
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.oidcProviders.syncGroups.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useSyncOidcProviderGroups({
            name,
            onSuccess,
            onError,
          }),
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
