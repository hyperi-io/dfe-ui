import { TFetchPermissionsResponse } from '@/core/hooks/_useFetchPermissions/types';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { TLoginResponse } from '@/core/hooks/useLogin/types';
import { TRefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const auth = {
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
        mockedResponse?: TLoginResponse;
      } = {}) =>
        http.post(auth.login.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        }),
    },
  },
  refresh: {
    mockedUrl: '/api/v1/auth/refresh',
    post: {
      success: ({
        mockedResponse = {
          access_token: 'refreshed-token',
          token_type: 'bearer',
          expires_in: 3600,
          user_id: 'string',
          roles: ['string'],
        },
      }: {
        mockedResponse?: TRefreshTokenResponse;
      } = {}) =>
        http.post(auth.refresh.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        }),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 401,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.post(auth.refresh.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  me: {
    mockedUrl: '/api/v1/auth/me',
    get: {
      success: ({
        mockedResponse = {
          org_id: 'string',
          user_id: 'string',
          roles: ['string'],
          permissions: ['string'],
          groups: ['string'],
        },
      }: {
        mockedResponse?: TAuthMeResponse;
      } = {}) =>
        http.get(auth.me.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        }),
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.get(auth.me.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  permissions: {
    mockedUrl: '/api/v1/auth/permissions',
    get: {
      success: ({
        mockedResponse = {
          roles: ['string'],
          permissions: ['string'],
        },
      }: {
        mockedResponse?: TFetchPermissionsResponse;
      } = {}) => {
        return http.get(auth.permissions.mockedUrl, () => {
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
        return http.get(auth.permissions.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
