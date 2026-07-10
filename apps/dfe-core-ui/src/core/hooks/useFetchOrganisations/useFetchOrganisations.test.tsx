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
} from 'vitest';
import { useFetchOrganisations } from '.';
import { TOrganisationListResponse } from './types';
import { server } from './useFetchOrganisations.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchOrganisations', () => {
  describe('onSuccess', () => {
    test('should return data', async () => {
      const { result } = renderHook(() => useFetchOrganisations(), { wrapper });

      expect(result.current).toEqual({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: expect.any(Function),
      });

      const expectedResponse: TOrganisationListResponse = [
        {
          name: 'string',
          display_name: 'string',
          org_ids: ['string'],
          enabled: true,
          created_at: 'string',
          updated_at: 'string',
        },
      ];

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          isLoading: false,
          error: null,
          refetch: expect.any(Function),
        });
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.orgs.default.get.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useFetchOrganisations(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });
});
