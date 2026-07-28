import { TDeploymentsResponse } from '@/Services/hooks/deployments/useFetchInfiniteFilteredDeployments/types';
import { http, HttpResponse } from 'msw';
import { API_CONFIG_MOCKS } from '..';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const deployments = {
  default: {
    mockedUrl: '/api/v1/deployments',
    get: {
      success: ({
        mockedResponse = {
          items: [],
          total: 0,
          page: 1,
          per_page: 10,
          total_pages: 0,
          next_page: null,
          prev_page: null,
        },
      }: {
        mockedResponse?: TDeploymentsResponse;
      }) => {
        return http.get(API_CONFIG_MOCKS.deployments.default.mockedUrl, () => {
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
        return http.get(deployments.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
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
};
