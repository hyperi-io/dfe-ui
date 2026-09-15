import { TSystemRetentionResponse } from '@/Platform/hooks/system/useFetchRetention/types';
import { TSystemClickhouseStatusResponse } from '@/Platform/hooks/system/useFetchSystemClickhouseStatus/types';
import { TSystemSettingsResponse } from '@/Platform/hooks/system/useFetchSystemSettings/types';
import { TSystemStartStopClickhouseCloudResponse } from '@/Platform/hooks/system/useSystemStopStartClickhouseCloud/types';
import { TUpdateSystemRetentionResponse } from '@/Platform/hooks/system/useUpdateRetention/types';
import { TSystemVersionResponse } from '@/core/hooks/useFetchSystemVersion/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const system = {
  version: {
    mockedUrl: '/api/v1/system/version',
    get: {
      success: ({
        mockedResponse = {
          stack: '2.2.0-rc.13',
          engine: '1.19.15',
          // Null unless the deploy repo pins a UI version off the stack, which
          // is why the console falls back to its own build version.
          ui: null,
          source: 'deploy-repo',
          python_version: 'python_version',
          apps: {
            'dfe-core-ui': '1.0.0',
            'dfe-core-api': '1.0.0',
            'dfe-core-db': '1.0.0',
            'dfe-core-auth': '1.0.0',
            'dfe-core-storage': '1.0.0',
            'dfe-core-messaging': '1.0.0',
          },
        },
      }: { mockedResponse?: TSystemVersionResponse } = {}) => {
        return http.get(system.version.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  settings: {
    mockedUrl: '/api/v1/system/settings',
    get: {
      success: ({
        mockedResponse = {
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
        },
      }: { mockedResponse?: TSystemSettingsResponse } = {}) => {
        return http.get(system.settings.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  retention: {
    mockedUrl: '/api/v1/system/retention',
    get: {
      success: ({
        mockedResponse = {
          stored: null,
          effective: 90,
          origin: 'deployment',
          deployment_default: 90,
        },
      }: { mockedResponse?: TSystemRetentionResponse } = {}) => {
        return http.get(system.retention.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
    put: {
      success: ({
        mockedResponse = {
          stored: 30,
          effective: 30,
          origin: 'override',
          deployment_default: 90,
          reconcile: {
            summary: '0 database(s) created, 1 table(s) altered',
            tables_altered: ['dfe.main'],
            sources_reconciled: 0,
            sources_skipped: 0,
          },
        },
      }: { mockedResponse?: TUpdateSystemRetentionResponse } = {}) => {
        return http.put(system.retention.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.put(system.retention.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
      reconcileFailed: ({
        message = 'override stored; ClickHouse reconcile failed: clickhouse down',
      }: { message?: string } = {}) => {
        return http.put(system.retention.mockedUrl, () => {
          return HttpResponse.json(
            { code: 'reconcile_failed', message },
            { status: 502 },
          );
        });
      },
    },
  },
  clickhouseCloud: {
    mockedUrl: '/api/v1/system/clickhouse-cloud',
    get: {
      success: ({
        mockedResponse = {
          configured: true,
          id: 'id',
          name: 'name',
          state: 'state',
          is_running: true,
        },
      }: { mockedResponse?: TSystemClickhouseStatusResponse } = {}) => {
        return http.get(system.clickhouseCloud.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  clickhouseCloudStart: {
    mockedUrl: '/api/v1/system/clickhouse-cloud/start',
    post: {
      success: ({
        mockedResponse = {
          configured: true,
          id: 'id',
          name: 'start',
          state: 'state',
          is_running: true,
        },
      }: {
        mockedResponse?: TSystemStartStopClickhouseCloudResponse;
      } = {}) => {
        return http.post(system.clickhouseCloudStart.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.post(system.clickhouseCloudStart.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  clickhouseCloudStop: {
    mockedUrl: '/api/v1/system/clickhouse-cloud/stop',
    post: {
      success: ({
        mockedResponse = {
          configured: true,
          id: 'id',
          name: 'stop',
          state: 'state',
          is_running: true,
        },
      }: {
        mockedResponse?: TSystemStartStopClickhouseCloudResponse;
      } = {}) => {
        return http.post(system.clickhouseCloudStop.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.post(system.clickhouseCloudStop.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
