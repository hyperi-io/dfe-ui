import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSourceDetail } from '.';
import { TSourceVersionDetail } from './types';
import { server } from './useFetchSourceDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSourceDetail', () => {
  describe('source_name is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () =>
          useFetchSourceDetail({
            source_name: 'source',
            source_version: '1.0.0',
          }),
        { wrapper },
      );

      const response: TSourceVersionDetail = {
        source: 'source',
        enabled: true,
        display_name: 'string',
        description: 'string',
        versions: ['string'],
        current: 'string',
        deployed_version: 'string',
        selected: 'string',
        state: 'active',
        version: {
          date_time: 'string',
          header: {
            type: 'string',
            version: 'string',
          },
          schema: {
            meta_schema: 'string',
            meta_schema_version: 'string',
            ttl_days: 0,
            engine: 'string',
          },
          transform: {
            engine: 'string',
            config_file: 'string',
            env: {
              string: 'string',
            },
            files: ['string'],
          },
          fetcher: {
            source_type: 'string',
            base_url: 'string',
            auth: {
              type: 'string',
              token_url: 'string',
              client_id: 'string',
              client_secret: 'string',
              api_key: 'string',
            },
            poll_interval_secs: 0,
          },
          match: {
            field: 'string',
            operator: 'equals',
            value: 'string',
          },
        },
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
