import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSystemSettings } from '.';
import { TSystemSettingsResponse } from './types';
import { server } from './useFetchSystemSettings.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSystemSettings', () => {
  test('should return system settings', async () => {
    const { result } = renderHook(() => useFetchSystemSettings(), { wrapper });

    const response: TSystemSettingsResponse = {
      clickhouse_host: 'clickhouse_host',
      clickhouse_database: 'clickhouse_database',
      clickhouse_data_database: 'clickhouse_data_database',
      clickhouse_default_ttl_days: 90,
      sources_dir: 'sources_dir',
      services_config_dir: 'services_config_dir',
      hunt_dir: 'hunt_dir',
      auth_enabled: true,
      auth_local_enabled: true,
      api_host: 'api_host',
      api_port: 1234,
      api_cors_origins: ['api_cors_origin'],
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
