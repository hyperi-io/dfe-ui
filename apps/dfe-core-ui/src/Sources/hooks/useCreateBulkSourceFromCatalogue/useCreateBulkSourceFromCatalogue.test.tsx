import { getApiErrorResponseBody } from '@/core/config/api/client';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
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
import { useCreateBulkSourceFromCatalogue } from '.';
import {
  TCatalogueBulkSourceRequestBody,
  TCatalogueBulkSourceResponse,
} from './types';
import { server } from './useCreateBulkSourceFromCatalogue.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCreateSource', () => {
  const requestBody: TCatalogueBulkSourceRequestBody = {
    entries: [
      {
        entry: 'okta',
        intake: 'okta',
        name: 'okta',
        transform: 'default',
        transport: 'bus',
        archive: false,
      },
    ],
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateBulkSourceFromCatalogue({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TCatalogueBulkSourceResponse = {
        created: [
          {
            entry: 'okta',
            source: 'okta',
            current: '1.0.0',
            versions: ['1.0.0'],
          },
        ],
        failed: [
          {
            entry: 'not_okta',
            source: 'not_okta',
            code: 'source_error',
            message: 'source error',
          },
        ],
        apps_synced: [],
        apps_sync_error: null,
        restart_required: ['okta'],
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
      server.use(API_CONFIG_MOCKS.sources.fromCatalogue.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateBulkSourceFromCatalogue({ onSuccess, onError }),
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

  describe('when the engine refuses a literal credential in the stanza', () => {
    // The engine owns that rule; the console has to name the key it refused.
    const message =
      'fetcher.config.token must be an env: or vault: reference, not a literal';

    beforeEach(() => {
      server.use(
        http.post(API_CONFIG_MOCKS.sources.fromCatalogue.mockedUrl, () =>
          HttpResponse.json(
            { code: 'validation_error', message },
            { status: 422 },
          ),
        ),
      );
    });

    test('carries the message the engine gave back to the caller', async () => {
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateBulkSourceFromCatalogue({ onError }),
        {
          wrapper,
        },
      );

      result.current.mutate({
        ...requestBody,
        entries: [
          {
            ...requestBody.entries[0],
            intake: 'not_okta',
          },
        ],
      });

      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(getApiErrorResponseBody(onError.mock.calls[0][0])?.message).toBe(
        message,
      );
    });
  });
});
