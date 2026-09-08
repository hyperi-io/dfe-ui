import { THuntListResponse } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { THuntCreateResponse } from '@/Hunts/hooks/useCreateHunt/types';
import { THuntEngineStatus } from '@/Hunts/hooks/useFetchEngineStatus/types';
import { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
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
            },
          ],
          total: 0,
          page: 0,
          per_page: 0,
          total_pages: 0,
          next_page: 0,
          prev_page: 0,
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
          customer_filters: {
            string: {
              filters: ['string'],
            },
          },
          checkpoint_timestamp_field: 'string',
          scheduling_mode: 'string',
          min_interval_seconds: 0,
          explain_queries: false,
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
          customer_filters: {
            string: {
              filters: ['string'],
            },
          },
          checkpoint_timestamp_field: 'string',
          scheduling_mode: 'string',
          min_interval_seconds: 0,
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
          customer_filters: {
            string: {
              filters: ['string'],
            },
          },
          checkpoint_timestamp_field: 'string',
          scheduling_mode: 'string',
          min_interval_seconds: 0,
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
};
