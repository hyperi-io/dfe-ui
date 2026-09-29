import { TRuleListResponse } from '@/core/hooks/useFetchInfiniteFilteredRules/types';
import { TRuleCreateResponse } from '@/Rules/hooks/useCreateRule/types';
import { TRuleDetail } from '@/Rules/hooks/useFetchRuleDetail/types';
import { TRuleUpdateResponse } from '@/Rules/hooks/useUpdateRule/types';
import { TSqlValidationResponse } from '@/Rules/hooks/useValidateRule/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const rules = {
  rule: {
    mockedUrl: '/api/v1/rules/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'string',
          display_name: 'string',
          severity: 'string',
          source: 'string',
          source_db: 'string',
          source_table: 'string',
          where_clause: 'string',
          cel_filter: 'string',
          original_sql: 'string',
          hunt_name: 'string',
          created_at: 'string',
        },
        name = 'name',
      }: {
        mockedResponse?: TRuleDetail;
        name?: string;
      } = {}) => {
        return http.get(rules.rule.mockedUrl.replace('{name}', name), () => {
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
        return http.get(rules.rule.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    put: {
      success: ({
        mockedResponse = {
          rule: {
            name: 'string',
            display_name: 'string',
            severity: 'string',
            source_db: 'string',
            source_table: 'string',
            where_clause: 'string',
            cel_filter: 'string',
            original_sql: 'string',
            hunt_name: 'string',
            source: 'string',
            warnings: ['string'],
            created_at: 'string',
          },
          sanitize_summary: {
            additionalProp1: {},
          },

          sql_errors: [
            {
              message: 'string',
              position: 0,
              suggestion: 'string',
            },
          ],
          cost_estimate: {
            estimated_rows: 0,
            rows_in_window: 0,
            projected_per_day: 0,
            match_ratio: 0,
            band: 'ok',
            window_minutes: 60,
            warnings: ['string'],
          },
        },
        name = 'name',
      }: {
        mockedResponse?: TRuleUpdateResponse;
        name?: string;
      } = {}) => {
        return http.put(rules.rule.mockedUrl.replace('{name}', name), () => {
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
        return http.put(rules.rule.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    delete: {
      success: ({ name = 'name' }: { name?: string } = {}) => {
        return http.delete(rules.rule.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json({});
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
        return http.delete(rules.rule.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  default: {
    mockedUrl: '/api/v1/rules',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              name: 'string',
              display_name: 'string',
              severity: 'string',
              source: 'string',
              source_db: 'string',
              source_table: 'string',
              hunt_name: 'string',
              created_at: 'string',
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
        mockedResponse?: TRuleListResponse;
      } = {}) => {
        return http.get(rules.default.mockedUrl, () => {
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
        return http.get(rules.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          rule: {
            name: 'string',
            display_name: 'string',
            severity: 'string',
            source_db: 'string',
            source_table: 'string',
            where_clause: 'string',
            cel_filter: 'string',
            original_sql: 'string',
            hunt_name: 'string',
            source: 'string',
            warnings: ['string'],
            created_at: 'string',
          },
          sanitize_summary: {
            additionalProp1: {},
          },
          sql_errors: [
            {
              message: 'string',
              position: 0,
              suggestion: 'string',
            },
          ],
          cost_estimate: {
            estimated_rows: 0,
            rows_in_window: 0,
            projected_per_day: 0,
            match_ratio: 0,
            band: 'ok',
            window_minutes: 60,
            warnings: ['string'],
          },
        },
      }: {
        mockedResponse?: TRuleCreateResponse;
      } = {}) =>
        http.post(rules.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        }),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) =>
        http.post(rules.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        }),
    },
  },
  validate: {
    mockedUrl: '/api/v1/rules/validate',
    post: {
      success: ({
        mockedResponse = {
          valid: true,
          errors: [
            {
              message: 'string',
              position: 0,
              suggestion: 'string',
            },
          ],
        },
      }: {
        mockedResponse?: TSqlValidationResponse;
      } = {}) =>
        http.post(rules.validate.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        }),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) =>
        http.post(rules.validate.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        }),
    },
  },
};
