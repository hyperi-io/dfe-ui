/* eslint-disable no-console */
import { components } from '@repo/dfe-engine-types';
import { http, HttpResponse } from 'msw';

const DEFAULT_VALIDATION_ERROR = {
  detail: [
    {
      loc: ['string', 0],
      msg: 'string',
      type: 'string',
      input: 'string',
      ctx: {},
    },
  ],
  message: 'An unexpected error occurred',
};

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
                name: 'string',
                display_name: 'string',
                description: 'string',
                enabled: true,
                current: 'string',
                versions: ['string'],
                deployed_version: 'string',
                updated_at: 'string',
                header_type: 'string',
                has_transform: false,
                has_fetcher: false,
                mapping_standards: ['string'],
              },
            ],
            objects: {
              items: [],
              children: {},
            },
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
        }: {
          mockedResponse?: components['schemas']['PaginatedSourceSummaryResponse'];
        } = {}) =>
          http.get(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          }),
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
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
        success: ({
          mockedResponse = {
            source: 'string',
            message: 'ok',
            current: 'string',
            versions: ['string'],
          },
        }: {
          mockedResponse?: components['schemas']['SourceResponse'];
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.sources.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    source: {
      mockedUrl: '/api/v1/sources/{name}',
      get: {
        success: ({
          mockedResponse = {
            source: 'source',
            enabled: true,
            display_name: 'string',
            description: 'string',
            current: 'string',
            match: {
              field: 'string',
              value: 'string',
            },
            transform: {
              engine: 'string',
            },
            versions: {
              string: {
                date_time: 'string',
                header: {
                  type: 'string',
                  version: 'string',
                },
              },
            },
          },
          name = 'source',
        }: {
          mockedResponse?: components['schemas']['Source'];
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            source: 'string',
            message: 'ok',
            current: 'string',
            versions: ['string'],
          },
          name = 'source',
        }: {
          mockedResponse?: components['schemas']['SourceResponse'];
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({ name = 'source' }: { name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json({});
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          name?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.sources.source.mockedUrl.replace('{name}', name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    sourceColumns: {
      mockedUrl: '/api/v1/sources/{name}/columns',
      get: {
        success: ({
          mockedResponse = {
            items: [],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
          },
          source_name = 'source',
        }: {
          mockedResponse?: components['schemas']['dfe_engine__api__pagination__PaginatedResponse_SchemaColumn___2'];
          source_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceColumns.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          source_name = 'source',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          source_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceColumns.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    sourceBuild: {
      mockedUrl: '/api/v1/sources/{name}/build',
      post: {
        success: ({
          mockedResponse = {
            source_name: 'source',
            version: 'string',
            columns: [],
            ddl: {
              source_name: 'source',
              create_table: 'string',
              views: {
                view1: 'string',
                view2: 'string',
              },
            },
          },
          source_name = 'source',
        }: {
          mockedResponse?: components['schemas']['SchemaBuildResult'];
          source_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.sourceBuild.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          source_name = 'source',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          source_name?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.sources.sourceBuild.mockedUrl.replace(
              '{name}',
              source_name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    sourceVersion: {
      mockedUrl: '/api/v1/sources/{name}/versions',
      get: {
        success: ({
          mockedResponse = {
            source: 'source',
            display_name: 'string',
            description: 'string',
            enabled: true,
            current: 'string',
            deployed_version: 'string',
            selected: 'string',
            versions: ['string'],
            version: {
              date_time: 'string',
              header: {
                type: 'string',
                version: 'string',
              },
              schema: {
                meta_schema: 'string',
                meta_schema_version: 'string',
                derived_schema: 'string',
                additional_fields: 'string',
                ttl_days: 0,
                engine: 'string',
              },
              mapping_standards: ['string'],
              sigma: {
                taxonomy: 'string',
                custom_mappings: {
                  string: 'string',
                },
              },
              field_mappings: ['string'],
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
              transform: {
                engine: 'string',
                config_file: 'string',
                env: {
                  string: 'string',
                },
                files: ['string'],
              },
              match: {
                field: 'string',
                value: 'string',
              },
            },
          },
          name = 'source',
        }: {
          mockedResponse?: components['schemas']['SourceVersionGetResponse'];
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceVersion.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          name = 'source',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.sources.sourceVersion.mockedUrl.replace(
              '{name}',
              name,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
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
        success: ({
          mockedResponse = {
            items: [
              {
                service: 'string',
                instance: 'string',
                updated_at: 'string',
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
          mockedResponse?: components['schemas']['PaginatedResponse_ServiceConfigSummary_'];
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.services.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.services.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    instance: {
      mockedUrl: '/api/v1/services/{service}/{instance}',
      get: {
        success: ({
          mockedResponse = {
            service: 'service',
            instance: 'instance',
            updated_at: '2021-01-01T00:00:00Z',
          },
          service = 'service',
          instance = 'instance',
        }: {
          mockedResponse?: object;
          service?: string;
          instance?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.services.instance.mockedUrl
              .replace('{service}', service)
              .replace('{instance}', instance),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          service = 'string',
          instance = 'string',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          service?: string;
          instance?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.services.instance.mockedUrl
              .replace('{service}', service)
              .replace('{instance}', instance),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
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
      mockedUrl: '/api/v1/services/{service}/{instance}/validate',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    history: {
      mockedUrl: '/api/v1/services/{service}/{instance}/history',
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
      mockedUrl: '/api/v1/deployments/{service}/{instance}',
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
      mockedUrl: '/api/v1/deployments/{service}/{instance}/validate',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    history: {
      mockedUrl: '/api/v1/deployments/{service}/{instance}/history',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    applySize: {
      mockedUrl: '/api/v1/deployments/{service}/{instance}/size/{size}',
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
        success: ({
          mockedResponse = {
            items: [
              {
                standard: 'string',
                source: 'string',
                is_default: false,
                version: 'string',
                mapping_count: 0,
                updated_at: 'string',
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
          mockedResponse?: components['schemas']['PaginatedResponse_FieldMapSummary_'];
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            standard: 'string',
            source: 'string',
            version: 'string',
            description: 'string',
            inherits: 'string',
            mappings: {
              additionalProp1: 'string',
              additionalProp2: 'string',
              additionalProp3: 'string',
            },
          },
        }: {
          mockedResponse?: components['schemas']['FieldMap'];
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.fieldMaps.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    standard: {
      mockedUrl: '/api/v1/field-maps/{standard}',
      get: {
        success: ({
          mockedResponse = {
            standard: 'standard',
            source: null,
            version: 'string',
            description: 'string',
            inherits: 'string',
            mappings: {
              additionalProp1: 'string',
              additionalProp2: 'string',
              additionalProp3: 'string',
            },
          },
          standard = 'standard',
        }: {
          mockedResponse?: components['schemas']['FieldMap'];
          standard?: string;
          source?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.fieldMaps.standard.mockedUrl.replace(
              '{standard}',
              standard,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
      },
    },
    source: {
      mockedUrl: '/api/v1/field-maps/{standard}/{source}',
      get: {
        success: ({
          mockedResponse = {
            standard: 'standard',
            source: 'source',
            version: 'string',
            description: 'string',
            inherits: 'string',
            mappings: {
              additionalProp1: 'string',
              additionalProp2: 'string',
              additionalProp3: 'string',
            },
          },
          standard = 'standard',
          source = 'source',
        }: {
          mockedResponse?: components['schemas']['FieldMap'];
          standard?: string;
          source?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.fieldMaps.source.mockedUrl
              .replace('{standard}', standard)
              .replace('{source}', source),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
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
          mockedResponse = DEFAULT_VALIDATION_ERROR,
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
          mockedResponse = DEFAULT_VALIDATION_ERROR,
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
      mockedUrl: '/api/v1/alerts/destinations/{name}',
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
  transforms: {
    compile: {
      mockedUrl: '/api/v1/transforms/compile',
      post: {
        success: ({
          mockedResponse = {
            wasm_base64: 'string',
            wasm_bytes: 0,
          },
        }: {
          mockedResponse?: components['schemas']['CompileResponse'];
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.transforms.compile.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.transforms.compile.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    test: {
      mockedUrl: '/api/v1/transforms/test',
      post: {
        success: ({
          mockedResponse = {
            emitted: [
              {
                key: 'string',
                value: 'string',
                headers: {
                  additionalProp1: 'string',
                  additionalProp2: 'string',
                  additionalProp3: 'string',
                },
              },
            ],
            duration_ms: 0,
            wasm_memory_bytes: 0,
          },
        }: {
          mockedResponse?: components['schemas']['dfe_engine__api__v1__transforms__TestResponse'];
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.transforms.test.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.transforms.test.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
  },
  schemas: {
    default: {
      mockedUrl: '/api/v1/schemas',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                current: 'string',
                versions: ['string'],
                updated_at: 'string',
                column_count: 0,
              },
            ],
            total: 0,
            page: 0,
            per_page: 0,
            total_pages: 0,
            next_page: 0,
            prev_page: 0,
            objects: {
              items: [],
              children: {
                string: {
                  items: [],
                  children: {},
                },
              },
            },
          },
        }: {
          mockedResponse?: components['schemas']['PaginatedSchemaSummaryResponse'];
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.schemas.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.schemas.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    schemaVersions: {
      mockedUrl: '/api/v1/schemas/definitions/{schema_path}/versions',
      post: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            versions: ['string'],
          },
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['MetaSchemaVersionWriteResponse'];
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schemaVersions.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schemaVersions.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    schema: {
      mockedUrl: '/api/v1/schemas/definitions/{schema_path}',
      post: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            versions: {
              string: {
                date: 'string',
                type: 'string',
                summary: 'string',
                columns: [
                  {
                    name: 'string',
                    type: 'string',
                    attribute: ['string'],
                    use_case: 'string',
                    expr: 'string',
                  },
                ],
              },
            },
          },
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['MetaSchema-Output'];
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      patch: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            versions: ['string'],
          },
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['MetaSchemaVersionWriteResponse'];
          schema_path?: string;
        } = {}) => {
          return http.patch(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.patch(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          schema_path = 'path',
        }: { status?: number; schema_path?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.schemas.schema.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    schemaDetail: {
      mockedUrl: '/api/v1/schemas/definitions/{schema_path}/versions/columns',
      get: {
        success: ({
          mockedResponse = {
            path: 'string',
            current: 'string',
            selected: 'string',
            versions: ['1.0.0'],
            version: {
              date: 'string',
              type: 'string',
              summary: 'string',
              columns: {
                items: [
                  {
                    name: 'string',
                    type: 'string',
                    attribute: ['string'],
                    use_case: 'string',
                    expr: 'string',
                  },
                ],
                total: 1,
                page: 1,
                per_page: 25,
                total_pages: 1,
                next_page: null,
                prev_page: null,
              },
            },
          },
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['MetaSchemaGetResponse'];
          schema_path?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          schema_path = 'path',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          schema_path?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.schemas.schemaDetail.mockedUrl.replace(
              '{schema_path}',
              schema_path,
            ),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
    elasticConvert: {
      mockedUrl: '/api/v1/schemas/elastic-converter',
      post: {
        success: ({
          mockedResponse = [
            {
              name: 'string',
              type: 'string',
              attribute: ['string'],
              use_case: 'string',
              expr: 'string',
            },
          ],
        }: {
          mockedResponse?: components['schemas']['dfe_engine__schema__models__SchemaColumn-Output'][];
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.elasticConvert.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.post(
            API_CONFIG_MOCKS.schemas.elasticConvert.mockedUrl,
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  orgs: {
    default: {
      mockedUrl: '/api/v1/orgs',
      get: {
        success: ({
          mockedResponse = [
            {
              name: 'string',
              display_name: 'string',
              org_ids: ['string'],
              enabled: true,
              dedicated_database: true,
              created_at: 'string',
              updated_at: 'string',
            },
          ],
        }: {
          mockedResponse?: components['schemas']['OrgResponse'][];
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
      post: {
        success: ({
          mockedResponse = {
            name: 'org_name',
            display_name: 'string',
            org_ids: ['string'],
            enabled: true,
            dedicated_database: true,
            created_at: 'string',
            updated_at: 'string',
          },
        }: {
          mockedResponse?: components['schemas']['OrgResponse'];
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.post(API_CONFIG_MOCKS.orgs.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    org: {
      mockedUrl: '/api/v1/orgs/{name}',
      get: {
        success: ({
          mockedResponse = {
            name: 'org_name',
            display_name: 'string',
            org_ids: ['string'],
            enabled: true,
            dedicated_database: true,
            created_at: 'string',
            updated_at: 'string',
          },
          org_name = 'org_name',
        }: {
          mockedResponse?: components['schemas']['OrgResponse'];
          org_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          org_name = 'org_name',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          org_name?: string;
        } = {}) => {
          return http.get(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      put: {
        success: ({
          mockedResponse = {
            name: 'org_name',
            display_name: 'string',
            org_ids: ['string'],
            enabled: true,
            dedicated_database: true,
            created_at: 'string',
            updated_at: 'string',
          },
          org_name = 'org_name',
        }: {
          mockedResponse?: components['schemas']['OrgResponse'];
          org_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse);
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          org_name = 'org_name',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          org_name?: string;
        } = {}) => {
          return http.put(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
      delete: {
        success: ({
          status = 204,
          org_name = 'org_name',
        }: { status?: number; org_name?: string } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json({}, { status });
            },
          );
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
          org_name = 'org_name',
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
          org_name?: string;
        } = {}) => {
          return http.delete(
            API_CONFIG_MOCKS.orgs.org.mockedUrl.replace('{name}', org_name),
            () => {
              return HttpResponse.json(mockedResponse, { status });
            },
          );
        },
      },
    },
  },
  groups: {
    default: {
      mockedUrl: '/api/v1/auth/groups',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    group: {
      mockedUrl: '/api/v1/auth/groups/{name}',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    groupMembers: {
      mockedUrl: '/api/v1/auth/groups/{name}/members',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    groupMember: {
      mockedUrl: '/api/v1/auth/groups/{name}/members/{username}',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  accounts: {
    default: {
      mockedUrl: '/api/v1/auth/accounts',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    account: {
      mockedUrl: '/api/v1/auth/accounts/{username}',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    resetPassword: {
      mockedUrl: '/api/v1/auth/accounts/{username}/reset-password',
      post: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
  },
  roles: {
    default: {
      mockedUrl: '/api/v1/auth/roles',
      get: {
        success: ({
          mockedResponse = {
            items: [
              {
                name: 'string',
                description: 'string',
                permissions: ['string'],
                scoped: false,
                resource_type: 'string',
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
          mockedResponse?: components['schemas']['PaginatedResponse_RoleResponse_'];
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.roles.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.roles.default.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
    role: {
      mockedUrl: '/api/v1/auth/roles/{name}',
      get: {
        success: () => {
          console.error('Not implemented');
        },
      },
    },
    scopes: {
      mockedUrl: '/api/v1/auth/roles/scopes',
      get: {
        success: ({
          mockedResponse = {
            scopes: ['string'],
            wildcard: false,
            argo_namespace_prefix: 'string',
            notes: 'string',
          },
        }: {
          mockedResponse?: components['schemas']['CasbinScopesResponse'];
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.roles.scopes.mockedUrl, () => {
            return HttpResponse.json(mockedResponse);
          });
        },
        error: ({
          mockedResponse = DEFAULT_VALIDATION_ERROR,
          status = 422,
        }: {
          mockedResponse?: components['schemas']['HTTPValidationError'];
          status?: number;
        } = {}) => {
          return http.get(API_CONFIG_MOCKS.roles.scopes.mockedUrl, () => {
            return HttpResponse.json(mockedResponse, { status });
          });
        },
      },
    },
  },
});
/* eslint-enable no-console */
