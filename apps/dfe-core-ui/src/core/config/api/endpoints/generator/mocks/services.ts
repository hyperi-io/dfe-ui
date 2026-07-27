import { TFetchServiceDetailResponse } from '@/_Services/hooks/useFetchServiceDetail/types';
import { TServiceListResponse } from '@/core/hooks/useFetchInfiniteFilteredServices/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const services = {
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
        mockedResponse?: TServiceListResponse;
      } = {}) => {
        return http.get(services.default.mockedUrl, () => {
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
        return http.get(services.default.mockedUrl, () => {
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
          config: {},
        },
        service = 'service',
        instance = 'instance',
      }: {
        mockedResponse?: TFetchServiceDetailResponse;
        service?: string;
        instance?: string;
      } = {}) => {
        return http.get(
          services.instance.mockedUrl
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
        mockedResponse?: TValidationError;
        status?: number;
        service?: string;
        instance?: string;
      } = {}) => {
        return http.get(
          services.instance.mockedUrl
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
};
