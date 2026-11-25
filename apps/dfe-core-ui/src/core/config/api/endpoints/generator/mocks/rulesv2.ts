import { TRuleCreateResponse } from '@/core/hooks/useCreateRuleV2/types';
import { TRuleListResponse as TRuleListResponseV2 } from '@/core/hooks/useFetchInfiniteFilteredRulesV2/types';
import { TSqlValidationResponse } from '@/core/hooks/useValidateRuleV2/types';
import { TRuleDetail } from '@/RulesV2/hooks/useFetchRuleDetail/types';
import { TTriggerOnDemandRuleResponse } from '@/RulesV2/hooks/useTriggerOnDemandRule/types';
import { TRuleUpdateResponse } from '@/RulesV2/hooks/useUpdateRule/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const rulesV2 = {
  rule: {
    mockedUrl: '/api/v1/rules-v2/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'string',
          display_name: 'string',
          severity: 'string',
          description: 'string',
          where_clause: 'string',
          cel_filter: 'string',
          created_at: 'string',
          original_sql: 'string',
        },
        name = 'name',
      }: {
        mockedResponse?: TRuleDetail;
        name?: string;
      } = {}) => {
        return http.get(rulesV2.rule.mockedUrl.replace('{name}', name), () => {
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
        return http.get(rulesV2.rule.mockedUrl.replace('{name}', name), () => {
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
            description: 'string',
            where_clause: 'string',
            cel_filter: 'string',
            created_at: 'string',
            original_sql: 'string',
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
        },
        name = 'name',
      }: {
        mockedResponse?: TRuleUpdateResponse;
        name?: string;
      } = {}) => {
        return http.put(rulesV2.rule.mockedUrl.replace('{name}', name), () => {
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
        return http.put(rulesV2.rule.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    delete: {
      success: ({ name = 'name' }: { name?: string } = {}) => {
        return http.delete(
          rulesV2.rule.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json({});
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
        return http.delete(
          rulesV2.rule.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  default: {
    mockedUrl: '/api/v1/rules-v2',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              name: 'string',
              display_name: 'string',
              severity: 'string',
              description: 'string',
              created_at: 'string',
            },
          ],
          total_size: 0,
          next_page_token: null,
        },
      }: {
        mockedResponse?: TRuleListResponseV2;
      } = {}) => {
        return http.get(rulesV2.default.mockedUrl, () => {
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
        return http.get(rulesV2.default.mockedUrl, () => {
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
            description: 'string',
            where_clause: 'string',
            cel_filter: 'string',
            created_at: 'string',
            original_sql: 'string',
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
        },
      }: {
        mockedResponse?: TRuleCreateResponse;
      } = {}) =>
        http.post(rulesV2.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        }),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) =>
        http.post(rulesV2.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        }),
    },
  },
  validate: {
    mockedUrl: '/api/v1/rules-v2/validate',
    post: {
      success: ({
        mockedResponse = {
          valid: true,
          errors: [],
        },
      }: {
        mockedResponse?: TSqlValidationResponse;
      } = {}) => {
        return http.post(rulesV2.validate.mockedUrl, () => {
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
        return http.post(rulesV2.validate.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  run: {
    mockedUrl: '/api/v1/rules-v2/{name}/run',
    post: {
      success: ({
        mockedResponse = {
          source: 'string',
          source_db: 'string',
          source_table: 'string',
          cost_window_minutes: 0,
          cost_estimate: {
            estimated_rows: 0,
            rows_in_window: 0,
            projected_per_day: 0,
            match_ratio: 0,
            band: 'warn',
            window_minutes: 0,
          },
          execution_time_ms: 0,
          truncated: false,
        },
        name = 'name',
      }: {
        mockedResponse?: TTriggerOnDemandRuleResponse;
        name?: string;
      } = {}) => {
        return http.post(rulesV2.run.mockedUrl.replace('{name}', name), () => {
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
        return http.post(rulesV2.run.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
