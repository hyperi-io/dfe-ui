import { TFetchPermissionsResponse } from '@/core/hooks/_useFetchPermissions/types';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { TLoginResponse } from '@/core/hooks/useLogin/types';
import { TRefreshTokenResponse } from '@/core/hooks/useRefreshToken/types';
import { TRetireAdminResponse } from '@/core/hooks/useRetireAdmin/types';
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
          default_credentials: false,
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
          default_credentials: false,
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
  setupStatus: {
    mockedUrl: '/api/v1/auth/setup-status',
    get: {
      success: ({
        mockedResponse = {
          initial_setup: {
            complete: false,
            current_step: null,
            steps: [],
            pending_steps: [],
            completed_steps: [],
            step_details: [],
          },
          oidc_providers: [],
          organisations: [],
          default_credentials: false,
          deploy_kind: 'local',
          credential_fetch_command: '',
          default_ttl_days: 90,
          admin_username: 'admin',
          admin_retired: false,
          retire_admin_available: false,
        },
      }: {
        mockedResponse?: TFetchSetupStatusResponse;
      } = {}) => {
        return http.get(auth.setupStatus.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  retireAdmin: {
    mockedUrl: '/api/v1/auth/setup/retire-admin',
    post: {
      success: ({
        mockedResponse = {
          initial_setup: {
            complete: true,
            current_step: null,
            steps: [],
            pending_steps: [],
            completed_steps: [],
            step_details: [],
          },
          oidc_providers: [],
          organisations: [],
          default_credentials: false,
          deploy_kind: 'local',
          credential_fetch_command: '',
          default_ttl_days: 90,
          admin_username: 'admin',
          admin_retired: true,
          retire_admin_available: false,
        },
      }: {
        mockedResponse?: TRetireAdminResponse;
      } = {}) => {
        return http.post(auth.retireAdmin.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 409,
      }: {
        mockedResponse?: TValidationError;
        status?: number;
      } = {}) => {
        return http.post(auth.retireAdmin.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
