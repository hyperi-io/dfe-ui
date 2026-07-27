import { TApiKeyCreateResponse } from '@/Settings/hooks/apiKeys/useCreateApiKey/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const apiKeys = {
  default: {
    mockedUrl: '/api/v1/auth/api-keys',
    get: {
      success: () => {
        return console.error('Not implemented');
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
    get: {
      success: () => {
        return console.error('Not implemented');
      },
    },
  },
};
