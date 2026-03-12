/* eslint-disable no-console */
import { components } from '@dfe/dfe-engine-types';
import { http, HttpResponse } from 'msw';

export const API_CONFIG_MOCKS = Object.freeze({
  auth: {
    login: {
      mockedUrl: '/api/v1/auth/login',
      post: {
        success: ({
          mockedResponse = {
            access_token: 'string',
            token_type: 'bearer',
            expires_in: 0,
            user_id: 'string',
            roles: ['string'],
          },
        }: {
          mockedResponse?: components['schemas']['TokenResponse'];
        } = {}) =>
          http.post(API_CONFIG_MOCKS.auth.login.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
      },
    },
    refresh: {
      mockedUrl: '/api/v1/auth/refresh',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    me: {
      mockedUrl: '/api/v1/auth/me',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    permissions: {
      mockedUrl: '/api/v1/auth/permissions',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  sources: {
    default: {
      mockedUrl: '/api/v1/sources',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                source: 'string',
                display_name: 'string',
                description: 'string',
                enabled: true,
                header_type: 'string',
                has_transform: false,
                has_fetcher: false,
                mapping_standards: ['string'],
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
          mockedResponse?: components['schemas']['PaginatedResponse_SourceSummary_'];
        } = {}) =>
          http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = {
            detail: [
              {
                loc: ['string', 0],
                msg: 'string',
                type: 'string',
                input: 'string',
                ctx: {},
              },
            ],
          },
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    source: {
      mockedUrl: (name: string) => `/api/v1/sources/${name}`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      put: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    bulk: {
      mockedUrl: '/api/v1/sources/bulk',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/sources/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  services: {
    default: {
      mockedUrl: '/api/v1/services',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    instance: {
      mockedUrl: (service: string, instance: string) =>
        `/api/v1/services/${service}/${instance}`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      put: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    validate: {
      mockedUrl: (service: string, instance: string) =>
        `/api/v1/services/${service}/${instance}/validate`,
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    history: {
      mockedUrl: (service: string, instance: string) =>
        `/api/v1/services/${service}/${instance}/history`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/services/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  deployments: {
    default: {
      mockedUrl: '/api/v1/deployments',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    deployment: {
      mockedUrl: (service: string, instance: string) =>
        `/api/v1/deployments/${service}/${instance}`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      put: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    validate: {
      mockedUrl: (service: string, instance: string) =>
        `/api/v1/deployments/${service}/${instance}/validate`,
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    history: {
      mockedUrl: (service: string, instance: string) =>
        `/api/v1/deployments/${service}/${instance}/history`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    applySize: {
      mockedUrl: (service: string, instance: string, size: string) =>
        `/api/v1/deployments/${service}/${instance}/size/${size}`,
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/deployments/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  fieldMaps: {
    default: {
      mockedUrl: '/api/v1/field-maps',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    standard: {
      mockedUrl: (standard: string) => `/api/v1/field-maps/${standard}`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    source: {
      mockedUrl: (standard: string, source: string) =>
        `/api/v1/field-maps/${standard}/${source}`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    seed: {
      mockedUrl: '/api/v1/field-maps/seed',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  rules: {
    default: {
      mockedUrl: '/api/v1/rules',
      post: {
        success: ({
          mockedResponse = {
            rule: {
              rule_id: 'string',
              name: 'string',
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
              explain_plan: 'string',
              explain_duration_ms: 0,
              window_minutes: 60,
              warnings: ['string'],
            },
          },
        }: {
          mockedResponse?: components['schemas']['RuleCreateResponse'];
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = {
            detail: [
              {
                loc: ['string', 0],
                msg: 'string',
                type: 'string',
                input: 'string',
                ctx: {},
              },
            ],
          },
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.default.mockedUrl, () => {
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
          mockedResponse?: components['schemas']['SqlValidationResponse'];
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.validate.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = {
            detail: [
              {
                loc: ['string', 0],
                msg: 'string',
                type: 'string',
                input: 'string',
                ctx: {},
              },
            ],
          },
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) =>
          http.post(API_CONFIG_MOCKS.rules.validate.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          }),
      },
    },
  },
  alerts: {
    destinations: {
      mockedUrl: '/api/v1/alerts/destinations',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    destination: {
      mockedUrl: (name: string) => `/api/v1/alerts/destinations/${name}`,
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
      put: {
        success: () => {
          console.error('Not implemented');
        },
      },
      delete: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  system: {
    version: {
      mockedUrl: '/api/v1/system/version',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    settings: {
      mockedUrl: '/api/v1/system/settings',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
});
/* eslint-enable no-console */
