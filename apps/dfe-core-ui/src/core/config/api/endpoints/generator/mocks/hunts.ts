import { THuntListResponse } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { THuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { THuntEngineStatus } from '@/Hunts/hooks/useFetchEngineStatus/types';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { THuntExecutionsResponse } from '@/Hunts/hooks/useFetchHuntExecutions/types';
import { TTriggerResponse } from '@/Hunts/hooks/useTriggerHunt/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const hunts = {
  default: {
    mockedUrl: '/api/v1/hunts',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              display_name: 'string',
              name: 'string',
              source_table: 'string',
              target_table: 'string',
              customer: 'string',
              cron: 'string',
              rules: ['string'],
              running: false,
              too_aggressive: false,
              run_requested: false,
              enabled: true,
              auto_disabled_at: null,
              auto_disabled_reason: '',
              error: '',
            },
          ],
          total_size: 0,
          next_page_token: null,
        },
      }: {
        mockedResponse?: THuntListResponse;
      } = {}) => {
        return http.get(hunts.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.get(hunts.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          display_name: 'string',
          name: 'string',
          cron: 'string',
          log_buffer: 0,
          global_target_table_name: 'string',
          global_source_table_name: 'string',
          customers: ['string'],
          rules: [
            {
              rule_name: 'string',
              target_table_name: 'string',
              source: 'string',
              initial_checkpoint_lookback_minutes: 0,
            },
          ],
          customer_tenant_ids: {
            string: ['string'],
          },
          checkpoint_timestamp_field: 'string',
          scheduling_mode: 'string',
          min_interval_seconds: 0,
          explain_queries: false,
          enabled: true,
          auto_disabled_reason: '',
          error: '',
        },
      }: {
        mockedResponse?: THuntCreateResponse;
      } = {}) => {
        return http.post(hunts.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.post(hunts.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  engineStatus: {
    mockedUrl: '/api/v1/hunts/status',
    get: {
      success: ({
        mockedResponse = {
          running: true,
          runners: 1,
          hunt_count: 1,
          scheduling_mode: 'string',
        },
      }: {
        mockedResponse?: THuntEngineStatus;
      } = {}) => {
        return http.get(hunts.engineStatus.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  hunt: {
    mockedUrl: '/api/v1/hunts/{name}',
    get: {
      success: ({
        mockedResponse = {
          display_name: 'string',
          name: 'string',
          cron: 'string',
          log_buffer: 0,
          global_target_table_name: 'string',
          global_source_table_name: 'string',
          customers: ['string'],
          rules: [
            {
              rule_name: 'string',
              target_table_name: 'string',
              source: 'string',
              initial_checkpoint_lookback_minutes: 0,
            },
          ],
          customer_tenant_ids: {
            string: ['string'],
          },
          checkpoint_timestamp_field: 'string',
          scheduling_mode: 'string',
          min_interval_seconds: 0,
          enabled: true,
          auto_disabled_reason: '',
          error: '',
        },
        name = 'name',
      }: {
        mockedResponse?: THuntDetailResponse;
        name?: string;
      } = {}) => {
        return http.get(hunts.hunt.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
    put: {
      success: ({
        mockedResponse = {
          name: 'string',
          display_name: 'string',
          cron: 'string',
          log_buffer: 0,
          global_target_table_name: 'string',
          global_source_table_name: 'string',
          customers: ['string'],
          rules: [
            {
              rule_name: 'string',
              target_table_name: 'string',
              source: 'string',
              initial_checkpoint_lookback_minutes: 0,
            },
          ],
          customer_tenant_ids: {
            string: ['string'],
          },
          checkpoint_timestamp_field: 'string',
          scheduling_mode: 'string',
          min_interval_seconds: 0,
          enabled: true,
          auto_disabled_reason: '',
          error: '',
        },
        name = 'name',
      }: {
        mockedResponse?: THuntDetailResponse;
        name?: string;
      } = {}) => {
        return http.put(hunts.hunt.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.put(hunts.hunt.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    delete: {
      success: ({
        status = 204,
        name = 'name',
      }: { status?: number; name?: string } = {}) => {
        return http.delete(hunts.hunt.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json({}, { status });
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.delete(hunts.hunt.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  huntRun: {
    mockedUrl: '/api/v1/hunts/{name}/run',
    post: {
      success: ({
        mockedResponse = {
          hunt_name: 'string',
          queued: true,
          requested_fire: 0,
          poll_seconds: 0,
        },
        name = 'name',
      }: {
        mockedResponse?: TTriggerResponse;
        name?: string;
      } = {}) => {
        return http.post(
          hunts.huntRun.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.post(
          hunts.huntRun.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  huntExecutions: {
    mockedUrl: '/api/v1/hunts/{name}/executions',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              execution_id: 'execution_id',
              fire: 1,
              status: 'status',
              rows_returned: 1,
              execution_time_ms: 1000,
              cost_window_minutes: 10,
              cost_estimate: {
                estimated_rows: 1000,
                rows_in_window: 1000,
                projected_per_day: 1000,
                match_ratio: 1000,
                band: 'warn',
                window_minutes: 10,
                duration_ms: 1000,
              },
            },
          ],
          total_size: 1,
          next_page_token: null,
        },
        name = 'name',
      }: {
        mockedResponse?: THuntExecutionsResponse;
        name?: string;
      } = {}) => {
        return http.get(
          hunts.huntExecutions.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
};
