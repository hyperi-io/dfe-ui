import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchDefaultDriftSources } from '.';
import { TDefaultDriftSources } from './types';
import { server } from './useFetchDefaultDriftSources.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchDefaultDriftSources', () => {
  describe('source_name is provided', async () => {
    test('should return data', async () => {
      const { result } = renderHook(() => useFetchDefaultDriftSources(), {
        wrapper,
      });

      const response: TDefaultDriftSources = {
        sources: [
          {
            source: 'string',
            core: true,
            drifted: ['string'],
            ttl_days: { stored: 'string', default: 'string' },
            common_header_type: { stored: 'string', default: 'string' },
            common_header_version: { stored: 'string', default: 'string' },
            engine: { stored: 'string', default: 'string' },
          },
        ],
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
});
