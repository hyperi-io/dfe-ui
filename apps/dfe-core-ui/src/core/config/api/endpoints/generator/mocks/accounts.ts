import { TAccountResetPasswordResponse } from '@/core/hooks/useAccountResetPassword/types';
import { TAccountCreateResponse } from '@/core/hooks/useCreateAccount/types';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { TAccountsResponse } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { TAccountUpdateResponse } from '@/Settings/hooks/accounts/useUpdateAccount/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const accounts = {
  default: {
    mockedUrl: '/api/v1/auth/accounts',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              username: 'string',
              enabled: true,
              groups: ['string'],
              created_at: 'string',
              updated_at: 'string',
              email: 'string',
              phone: 'string',
              name: 'string',
            },
          ],
          total: 1,
          page: 1,
          per_page: 10,
          total_pages: 1,
          next_page: 1,
          prev_page: 1,
        },
      }: {
        mockedResponse?: TAccountsResponse;
      } = {}) => {
        return http.get(accounts.default.mockedUrl, () => {
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
        return http.get(accounts.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          username: 'string',
          enabled: true,
          groups: ['string'],
          created_at: 'string',
          updated_at: 'string',
          email: 'string',
          phone: 'string',
          name: 'string',
        },
      }: {
        mockedResponse?: TAccountCreateResponse;
      } = {}) => {
        return http.post(accounts.default.mockedUrl, () => {
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
        return http.post(accounts.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  account: {
    mockedUrl: '/api/v1/auth/accounts/{username}',
    get: {
      success: ({
        mockedResponse = {
          username: 'string',
          enabled: true,
          groups: ['string'],
          created_at: 'string',
          updated_at: 'string',
          email: 'string',
          phone: 'string',
          name: 'string',
        },
        username = 'string',
      }: {
        mockedResponse?: TAccountDetailResponse;
        username?: string;
      } = {}) => {
        return http.get(
          accounts.account.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        username = 'string',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        username?: string;
      } = {}) => {
        return http.get(
          accounts.account.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    put: {
      success: ({
        mockedResponse = {
          username: 'string',
          enabled: true,
          groups: ['string'],
          created_at: 'string',
          updated_at: 'string',
          email: 'string',
          phone: 'string',
          name: 'string',
        },
        username = 'string',
      }: {
        mockedResponse?: TAccountUpdateResponse;
        username?: string;
      } = {}) => {
        return http.put(
          accounts.account.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        username = 'string',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        username?: string;
      } = {}) => {
        return http.put(
          accounts.account.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({
        status = 204,
        username = 'string',
      }: { status?: number; username?: string } = {}) => {
        return http.delete(
          accounts.account.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        username = 'string',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        username?: string;
      } = {}) => {
        return http.delete(
          accounts.account.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  resetPassword: {
    mockedUrl: '/api/v1/auth/accounts/{username}/reset-password',
    post: {
      success: ({
        mockedResponse = {
          message: 'password reset',
          git: {
            enabled: false,
            auto_merge: false,
            committed: false,
            merged: false,
          },
        },
        username = 'string',
      }: {
        mockedResponse?: TAccountResetPasswordResponse;
        username?: string;
      } = {}) => {
        return http.post(
          accounts.resetPassword.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        username = 'string',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        username?: string;
      } = {}) => {
        return http.post(
          accounts.resetPassword.mockedUrl.replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
