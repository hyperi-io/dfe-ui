import { TCreateFieldMapResponse } from '@/core/hooks/useCreateFieldMap/types';
import {
  TFetchStandardFieldMapResponse,
  TSourceFieldMapResponse,
} from '@/core/hooks/useFetchFieldMapDetail/types';
import { TFieldMapListResponse } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const fieldMaps = {
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
        mockedResponse?: TFieldMapListResponse;
      } = {}) => {
        return http.get(fieldMaps.default.mockedUrl, () => {
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
        return http.get(fieldMaps.default.mockedUrl, () => {
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
        mockedResponse?: TCreateFieldMapResponse;
      } = {}) => {
        return http.post(fieldMaps.default.mockedUrl, () => {
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
        return http.post(fieldMaps.default.mockedUrl, () => {
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
        mockedResponse?: TFetchStandardFieldMapResponse;
        standard?: string;
        source?: string;
      } = {}) => {
        return http.get(
          fieldMaps.standard.mockedUrl.replace('{standard}', standard),
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
        mockedResponse?: TSourceFieldMapResponse;
        standard?: string;
        source?: string;
      } = {}) => {
        return http.get(
          fieldMaps.source.mockedUrl
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
};
