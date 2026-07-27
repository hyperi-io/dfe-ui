import { TApiKeyCreateResponse } from '@/Settings/hooks/apiKeys/useCreateApiKey/types';
import { TApiKeysResponse } from '@/Settings/hooks/apiKeys/useFetchInfiniteFilteredApiKeys/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const apiKeys = {
  default: {
    mockedUrl: '/api/v1/auth/api-keys',
    get: {
      success: ({
        mockedResponse = {
          items: [],
          total: 0,
          page: 1,
          per_page: 10,
          total_pages: 1,
          next_page: 1,
          prev_page: 1,
        },
      }: {
        mockedResponse?: TApiKeysResponse;
      } = {}) => {
        return http.get(apiKeys.default.mockedUrl, () => {
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
        return http.get(apiKeys.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          name: 'string',
          short_token: 'string',
          enabled: true,
          groups: ['string'],
          description: 'string',
          created_at: 'string',
          full_key: 'string',
        },
      }: {
        mockedResponse?: TApiKeyCreateResponse;
      } = {}) => {
        return http.post(apiKeys.default.mockedUrl, () => {
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
        return http.post(apiKeys.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  apiKey: {
    mockedUrl: '/api/v1/auth/api-keys/{short_token}',
    delete: {
      success: () => {
        return http.delete(apiKeys.apiKey.mockedUrl, () => {
          return HttpResponse.json({});
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.delete(apiKeys.apiKey.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
