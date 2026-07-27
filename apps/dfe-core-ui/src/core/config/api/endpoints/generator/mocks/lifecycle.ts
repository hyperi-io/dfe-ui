import { TLifecycleResponse } from '@/Platform/hooks/lifecycle/useFetchLifecycle/types';
import { TUpdateLifecycleResponse } from '@/Platform/hooks/lifecycle/useUpdateLifecycle/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const lifecycle = {
  default: {
    mockedUrl: '/api/v1/lifecycle',
    get: {
      success: ({
        mockedResponse = [
          {
            name: 'string',
            tier: 'string',
            state: 'string',
          },
        ],
      }: {
        mockedResponse?: TLifecycleResponse;
      } = {}) => {
        return http.get(lifecycle.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  lifecycle: {
    mockedUrl: '/api/v1/lifecycle/{name}',
    post: {
      success: ({
        mockedResponse = {
          name: 'string',
          state: 'string',
          changed: true,
          commit_sha: 'string',
          pending_reconcile: true,
        },
        name = 'name',
      }: {
        mockedResponse?: TUpdateLifecycleResponse;
        name?: string;
      } = {}) => {
        return http.post(
          lifecycle.lifecycle.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.post(
          lifecycle.lifecycle.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
