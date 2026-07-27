import {
  RESOURCE_TYPES,
  SCHEMA_FIELD_TYPES,
} from '@/core/components/CreateSchemaForm/fieldType.constants';
import { TCreateSchemaResponse } from '@/core/hooks/useCreateSchema/types';
import { TElasticConvertResponse } from '@/core/hooks/useElasticConvert/types';
import { TSchemaListResponse } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { TSchemaCreateVersionResponse } from '@/Schemas/hooks/useCreateSchemaVersion/types';
import { TMetaSchemaDetailResponse } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { TMetaSchemaUpdateResponse } from '@/Schemas/hooks/useUpdateSchema/types';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { TPromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const schemas = {
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
              resource_type: RESOURCE_TYPES.CORE,
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
        mockedResponse?: TSchemaListResponse;
      } = {}) => {
        return http.get(schemas.default.mockedUrl, () => {
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
        return http.get(schemas.default.mockedUrl, () => {
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
        mockedResponse?: TSchemaCreateVersionResponse;
        schema_path?: string;
      } = {}) => {
        return http.post(
          schemas.schemaVersions.mockedUrl.replace(
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
        mockedResponse?: TValidationError;
        status?: number;
        schema_path?: string;
      } = {}) => {
        return http.post(
          schemas.schemaVersions.mockedUrl.replace(
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
          resource_type: RESOURCE_TYPES.CORE,
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
                  _field_type: SCHEMA_FIELD_TYPES.BASE,
                },
              ],
            },
          },
        },
        schema_path = 'path',
      }: {
        mockedResponse?: TCreateSchemaResponse;
        schema_path?: string;
      } = {}) => {
        return http.post(
          schemas.schema.mockedUrl.replace('{schema_path}', schema_path),
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
        mockedResponse?: TValidationError;
        status?: number;
        schema_path?: string;
      } = {}) => {
        return http.post(
          schemas.schema.mockedUrl.replace('{schema_path}', schema_path),
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
        mockedResponse?: TMetaSchemaUpdateResponse;
        schema_path?: string;
      } = {}) => {
        return http.patch(
          schemas.schema.mockedUrl.replace('{schema_path}', schema_path),
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
        mockedResponse?: TValidationError;
        status?: number;
        schema_path?: string;
      } = {}) => {
        return http.patch(
          schemas.schema.mockedUrl.replace('{schema_path}', schema_path),
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
          schemas.schema.mockedUrl.replace('{schema_path}', schema_path),
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
        mockedResponse?: TValidationError;
        status?: number;
        schema_path?: string;
      } = {}) => {
        return http.delete(
          schemas.schema.mockedUrl.replace('{schema_path}', schema_path),
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
          resource_type: RESOURCE_TYPES.CORE,
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
                  _field_type: SCHEMA_FIELD_TYPES.BASE,
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
        mockedResponse?: TMetaSchemaDetailResponse;
        schema_path?: string;
      } = {}) => {
        return http.get(
          schemas.schemaDetail.mockedUrl.replace('{schema_path}', schema_path),
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
        mockedResponse?: TValidationError;
        status?: number;
        schema_path?: string;
      } = {}) => {
        return http.get(
          schemas.schemaDetail.mockedUrl.replace('{schema_path}', schema_path),
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
            _field_type: SCHEMA_FIELD_TYPES.ELASTIC_IMPORT,
          },
        ],
      }: {
        mockedResponse?: TElasticConvertResponse;
      } = {}) => {
        return http.post(schemas.elasticConvert.mockedUrl, () => {
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
        return http.post(schemas.elasticConvert.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  sampleRows: {
    mockedUrl: '/api/v1/schemas/{source_name}/sample-rows',
    get: {
      success: ({
        mockedResponse = {
          source_name: 'source',
          table: 'string',
          match_field: 'string',
          match_value: 'string',
          columns: ['string'],
          rows: [{ string: 'string' }],
        },
        source_name = 'source',
      }: {
        mockedResponse?: TSampleRowsResponse;
        source_name?: string;
      } = {}) => {
        return http.get(
          schemas.sampleRows.mockedUrl.replace('{source_name}', source_name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  jsonPaths: {
    mockedUrl: '/api/v1/schemas/{source_name}/json-paths',
    get: {
      success: ({
        mockedResponse = {
          source_name: 'source',
          table: 'string',
          json_column: 'string',
          paths: [
            {
              path: 'string',
              types: ['string'],
              is_consistent: true,
              promoted_to: 'string',
              column: {
                name: 'string',
                type: 'string',
                attribute: ['string'],
                use_case: 'string',
                expr: 'string',
                comment: 'string',
                _field_type: SCHEMA_FIELD_TYPES.PROMOTED,
              },
              coverage_pct: 100,
            },
          ],
        },
        source_name = 'source',
      }: {
        mockedResponse?: TJsonPathsResponse;
        source_name?: string;
      } = {}) => {
        return http.get(
          schemas.jsonPaths.mockedUrl.replace('{source_name}', source_name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  promoteField: {
    mockedUrl: '/api/v1/schemas/{source_name}/promote-field',
    post: {
      success: ({
        mockedResponse = {
          source_name: 'source',
          schema_version: 'string',
          results: [
            {
              json_path: 'string',
              status: 'ok',
              column_name: 'string',
              data_type: 'string',
              index_type: 'string',
              copy_cel: 'string',
              error: 'string',
            },
          ],
        },
        source_name = 'source',
      }: {
        mockedResponse?: TPromoteFieldResponse;
        source_name?: string;
      } = {}) => {
        return http.post(
          schemas.promoteField.mockedUrl.replace('{source_name}', source_name),
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
          schemas.promoteField.mockedUrl.replace('{source_name}', source_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
