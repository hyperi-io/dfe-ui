import { TSourceListResponse } from '@/core/hooks/useFetchInfiniteFilteredSources/types';
import { TSourceBuildResponse } from '@/Sources/hooks/useBuildSource/types';
import { TSourceCreateResponse } from '@/Sources/hooks/useCreateSource/types';
import { TSourceDeployResponse } from '@/Sources/hooks/useDeploySource/types';
import { TSourceColumnsResponse } from '@/Sources/hooks/useFetchInfiniteSourceColumns/types';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { TSourcePatchResponse } from '@/Sources/hooks/usePatchSource/types';
import { TSourcePlanResponse } from '@/Sources/hooks/usePlanSource/types';
import { TSourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const sources = {
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
              state: 'active',
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
        mockedResponse?: TSourceListResponse;
      } = {}) =>
        http.get(sources.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        }),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.get(sources.default.mockedUrl, () => {
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
        mockedResponse?: TSourceCreateResponse;
      } = {}) => {
        return http.post(sources.default.mockedUrl, () => {
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
        return http.post(sources.default.mockedUrl, () => {
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
          versions: ['1.0.0'],
          selected: '1.0.0',
          previous_deployed_versions: ['1.0.0'],
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
              operator: 'equals',
              value: 'string',
            },
          },
        },
        name = 'source',
      }: {
        mockedResponse?: TSourceVersionDetail;
        name?: string;
      } = {}) => {
        return http.get(
          sources.source.mockedUrl.replace('{name}', name),
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
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.get(
          sources.source.mockedUrl.replace('{name}', name),
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
        mockedResponse?: TSourceUpdateResponse;
        name?: string;
      } = {}) => {
        return http.put(
          sources.source.mockedUrl.replace('{name}', name),
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
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.put(
          sources.source.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    patch: {
      success: ({
        mockedResponse = {
          source: 'string',
          message: 'ok',
          current: 'string',
          versions: ['string'],
        },
        name = 'source',
      }: {
        mockedResponse?: TSourcePatchResponse;
        name?: string;
      } = {}) => {
        return http.patch(
          sources.source.mockedUrl.replace('{name}', name),
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
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.patch(
          sources.source.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({ name = 'source' }: { name?: string } = {}) => {
        return http.delete(
          sources.source.mockedUrl.replace('{name}', name),
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
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.delete(
          sources.source.mockedUrl.replace('{name}', name),
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
        mockedResponse?: TSourceColumnsResponse;
        source_name?: string;
      } = {}) => {
        return http.get(
          sources.sourceColumns.mockedUrl.replace('{name}', source_name),
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
        mockedResponse?: TValidationError;
        status?: number;
        source_name?: string;
      } = {}) => {
        return http.get(
          sources.sourceColumns.mockedUrl.replace('{name}', source_name),
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
        mockedResponse?: TSourceBuildResponse;
        source_name?: string;
      } = {}) => {
        return http.post(
          sources.sourceBuild.mockedUrl.replace('{name}', source_name),
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
        mockedResponse?: TValidationError;
        status?: number;
        source_name?: string;
      } = {}) => {
        return http.post(
          sources.sourceBuild.mockedUrl.replace('{name}', source_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  sourceVersion: {
    mockedUrl: '/api/v1/sources/{name}/versions/{version}',
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
              operator: 'equals',
              value: 'string',
            },
          },
        },
        name = 'source',
        version = '1.0.0',
      }: {
        mockedResponse?: TSourceVersionDetail;
        name?: string;
        version?: string;
      } = {}) => {
        return http.get(
          sources.sourceVersion.mockedUrl
            .replace('{name}', name)
            .replace('{version}', version),
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
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.get(
          sources.sourceVersion.mockedUrl.replace('{name}', name),
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
  plan: {
    mockedUrl: '/api/v1/sources/{name}/plan',
    get: {
      success: ({
        mockedResponse = {
          source_name: 'string',
          version: 'string',
          planned_at: 'string',
          table_exists: true,
          validation_errors: ['string'],
          statements: ['string'],
          ddl: {
            source_name: 'string',
            create_table: 'string',
            views: {
              view1: 'string',
              view2: 'string',
            },
          },
          ready: true,
        },
        name = 'source',
      }: {
        mockedResponse?: TSourcePlanResponse;
        name?: string;
      } = {}) => {
        return http.get(sources.plan.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          source_name: 'string',
          version: 'string',
          planned_at: 'string',
          table_exists: true,
          validation_errors: ['string'],
          statements: ['string'],
          ddl: {
            source_name: 'string',
            create_table: 'string',
            views: {
              view1: 'string',
              view2: 'string',
            },
          },
          ready: true,
        },
        name = 'source',
      }: {
        mockedResponse?: TSourcePlanResponse;
        name?: string;
      } = {}) => {
        return http.post(sources.plan.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'source',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.post(sources.plan.mockedUrl.replace('{name}', name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  deploy: {
    mockedUrl: '/api/v1/sources/{name}/deploy',
    post: {
      success: ({
        mockedResponse = {
          source_name: 'string',
          version: 'string',
          dry_run: false,
          applied: true,
          create_table: 'string',
          statements_applied: 0,
        },
        name = 'source',
      }: {
        mockedResponse?: TSourceDeployResponse;
        name?: string;
      } = {}) => {
        return http.post(
          sources.deploy.mockedUrl.replace('{name}', name),
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
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.post(
          sources.deploy.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
