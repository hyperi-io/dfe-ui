import { TRoleCreateResponse } from '@/Settings/hooks/useCreateRole/types';
import { TRoleListResponse } from '@/Settings/hooks/useFetchInfiniteFilteredRoles/types';
import { TRoleScopesResponse } from '@/Settings/hooks/useFetchInfiniteFilteredRoleScopes/types';
import { TRoleDetail } from '@/Settings/hooks/useFetchRoleDetail/types';
import { TRoleUpdateResponse } from '@/Settings/hooks/useUpdateRole/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const roles = {
  default: {
    mockedUrl: '/api/v1/auth/roles',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              name: 'string',
              description: 'string',
              permissions: ['string'],
              scoped: false,
              resource_type: 'string',
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
        mockedResponse?: TRoleListResponse;
      } = {}) => {
        return http.get(roles.default.mockedUrl, () => {
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
        return http.get(roles.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          name: 'string',
          description: 'string',
          permissions: ['string'],
          scoped: false,
          resource_type: 'string',
        },
      }: {
        mockedResponse?: TRoleCreateResponse;
      } = {}) => {
        return http.post(roles.default.mockedUrl, () => {
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
        return http.post(roles.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  role: {
    mockedUrl: '/api/v1/auth/roles/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'string',
          description: 'string',
          permissions: ['string'],
          scoped: false,
          resource_type: 'string',
        },
        role_name = 'role_name',
      }: {
        mockedResponse?: TRoleDetail;
        role_name?: string;
      } = {}) => {
        return http.get(
          roles.role.mockedUrl.replace('{name}', role_name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
    put: {
      success: ({
        mockedResponse = {
          name: 'string',
          description: 'string',
          permissions: ['string'],
          scoped: false,
          resource_type: 'string',
        },
        role_name = 'role_name',
      }: {
        mockedResponse?: TRoleUpdateResponse;
        role_name?: string;
      } = {}) => {
        return http.put(
          roles.role.mockedUrl.replace('{name}', role_name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        role_name = 'role_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        role_name?: string;
      } = {}) => {
        return http.put(
          roles.role.mockedUrl.replace('{name}', role_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({
        status = 204,
        role_name = 'role_name',
      }: { status?: number; role_name?: string } = {}) => {
        return http.delete(
          roles.role.mockedUrl.replace('{name}', role_name),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        role_name = 'role_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        role_name?: string;
      } = {}) => {
        return http.delete(
          roles.role.mockedUrl.replace('{name}', role_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  scopes: {
    mockedUrl: '/api/v1/auth/roles/scopes',
    get: {
      success: ({
        mockedResponse = {
          scopes: ['string'],
          total: 0,
          page: 0,
          per_page: 0,
          total_pages: 0,
          wildcard: false,
          argo_namespace_prefix: 'string',
          notes: 'string',
        },
      }: {
        mockedResponse?: TRoleScopesResponse;
      } = {}) => {
        return http.get(roles.scopes.mockedUrl, () => {
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
        return http.get(roles.scopes.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
};
