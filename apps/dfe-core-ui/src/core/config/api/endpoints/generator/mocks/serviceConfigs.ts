import { TServiceConfigListResponse } from '@/Services/hooks/useFetchInfiniteFilteredServiceConfigs/types';
import { TFetchServiceConfigDetailResponse } from '@/Services/hooks/useFetchServiceConfigDetail/types';
import { TServiceConfigUpdateResponse } from '@/Services/hooks/useUpdateServiceConfig/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const serviceConfigs = {
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
        mockedResponse?: TServiceConfigListResponse;
      } = {}) => {
        return http.get(serviceConfigs.default.mockedUrl, () => {
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
        return http.get(serviceConfigs.default.mockedUrl, () => {
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
        mockedResponse?: TFetchServiceConfigDetailResponse;
        service?: string;
        instance?: string;
      } = {}) => {
        return http.get(
          serviceConfigs.instance.mockedUrl
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
          serviceConfigs.instance.mockedUrl
            .replace('{service}', service)
            .replace('{instance}', instance),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    put: {
      success: ({
        mockedResponse = {
          service: 'string',
          instance: 'string',
          config: {},
        },
        service = 'string',
        instance = 'string',
      }: {
        mockedResponse?: TServiceConfigUpdateResponse;
        service?: string;
        instance?: string;
      } = {}) => {
        return http.put(
          serviceConfigs.instance.mockedUrl
            .replace('{service}', service)
            .replace('{instance}', instance),
          () => {
            return HttpResponse.json(
              JSON.parse(JSON.stringify(mockedResponse)),
            );
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
        return http.put(
          serviceConfigs.instance.mockedUrl
            .replace('{service}', service)
            .replace('{instance}', instance),
          () => {
            return HttpResponse.json(mockedResponse, { status });
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
