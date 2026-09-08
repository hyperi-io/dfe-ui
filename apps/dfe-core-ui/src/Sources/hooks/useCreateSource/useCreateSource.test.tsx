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
import { useCreateSource } from '.';
import { TSourceCreateRequestBody, TSourceCreateResponse } from './types';
import { server } from './useCreateSource.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCreateSource', () => {
  const requestBody: TSourceCreateRequestBody = {
    source: 'source',
    display_name: 'string',
    description: 'string',
    enabled: true,
    header: {
      type: 'string',
      version: 'string',
    },
    schema: {
      meta_schema: '',
      meta_schema_version: '',
      engine: 'engine',
    },
    match: { field: 'string', operator: 'equals', value: 'string' },
    transform: {
      engine: 'engine',
      config_file: null,
    },
    fetcher: {
      source_type: 'crates_io',
      topic: 'own',
      config: { crates: ['dfe-fetcher'] },
    },
    state: 'active',
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateSource({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TSourceCreateResponse = {
        source: 'string',
        message: 'ok',
        current: 'string',
        versions: ['string'],
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
      server.use(API_CONFIG_MOCKS.sources.default.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateSource({ onSuccess, onError }),
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
        http.post('/api/v1/sources', () =>
          HttpResponse.json(
            { code: 'validation_error', message },
            { status: 422 },
          ),
        ),
      );
    });

    test('carries the message the engine gave back to the caller', async () => {
      const onError = vi.fn();

      const { result } = renderHook(() => useCreateSource({ onError }), {
        wrapper,
      });

      result.current.mutate({
        ...requestBody,
        match: null,
        fetcher: {
          source_type: 'crates_io',
          topic: 'own',
          config: { token: 'a-literal-token' },
        },
      });

      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(getApiErrorResponseBody(onError.mock.calls[0][0])?.message).toBe(
        message,
      );
    });
  });
});
