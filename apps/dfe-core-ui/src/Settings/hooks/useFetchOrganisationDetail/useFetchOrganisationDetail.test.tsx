import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchOrganisationDetail } from '.';
import { TOrganisationDetail } from './types';
import { server } from './useFetchOrganisationDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchOrganisationDetail', () => {
  describe('org_name is provided', () => {
    test('should return organisation detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchOrganisationDetail({
            org_name: 'org_name',
          }),
        { wrapper },
      );

      const response: TOrganisationDetail = {
        name: 'org_name',
        display_name: 'string',
        org_ids: ['string'],
        enabled: true,
        created_at: 'string',
        updated_at: 'string',
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

  describe('org_name is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useFetchOrganisationDetail({ org_name: undefined }),
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

    test('should not fetch when org_name is null', async () => {
      const { result } = renderHook(
        () => useFetchOrganisationDetail({ org_name: null }),
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
