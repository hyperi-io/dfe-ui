import { TRepositoryObjectDetailResponse } from '@/Platform/hooks/repository/useFetchRepositoryObjectDetail/types';
import { TRepositoryObjectsResponse } from '@/Platform/hooks/repository/useFetchRepositoryObjects/types';
import { TRepositoryPreferencesResponse } from '@/Platform/hooks/repository/useFetchRepositoryPreferences/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const repository = {
  preferences: {
    mockedUrl: '/api/v1/repository/preferences',
    get: {
      success: ({
        mockedResponse = {
          preferences: {
            key: 'value',
          },
          etag: 'etag',
        },
      }: {
        mockedResponse?: TRepositoryPreferencesResponse;
      } = {}) => {
        return http.get(repository.preferences.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
    patch: {
      success: ({
        mockedResponse = {
          preferences: {
            key: 'value',
          },
          etag: 'etag',
        },
      }: { mockedResponse?: TRepositoryPreferencesResponse } = {}) => {
        return http.patch(repository.preferences.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.patch(repository.preferences.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  objects: {
    mockedUrl: '/api/v1/repository/objects/{scope}/{scope_id}/{namespace}',
    get: {
      success: ({
        mockedResponse = [
          {
            key: 'key',
            content_type: 'content_type',
            size: 100,
            updated_by: 'updated_by',
            updated_at: 'updated_at',
            etag: 'etag',
          },
        ],
        scope = 'scope',
        scope_id = 'scope_id',
        namespace = 'namespace',
      }: {
        mockedResponse?: TRepositoryObjectsResponse;
        scope?: string;
        scope_id?: string;
        namespace?: string;
      } = {}) => {
        return http.get(
          repository.objects.mockedUrl
            .replace('{scope}', scope)
            .replace('{scope_id}', scope_id)
            .replace('{namespace}', namespace),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  object: {
    mockedUrl:
      '/api/v1/repository/objects/{scope}/{scope_id}/{namespace}/{key}',
    get: {
      success: ({
        mockedResponse = {
          key: 'key',
          content_type: 'content_type',
          size: 100,
          updated_by: 'updated_by',
          updated_at: 'updated_at',
          etag: 'etag',
        },
        scope = 'scope',
        scope_id = 'scope_id',
        namespace = 'namespace',
        key = 'key',
      }: {
        mockedResponse?: TRepositoryObjectDetailResponse;
        scope?: string;
        scope_id?: string;
        namespace?: string;
        key?: string;
      } = {}) => {
        return http.get(
          repository.object.mockedUrl
            .replace('{scope}', scope)
            .replace('{scope_id}', scope_id)
            .replace('{namespace}', namespace)
            .replace('{key}', key),
          () => {
            return HttpResponse.json(
              JSON.parse(JSON.stringify(mockedResponse)),
            );
          },
        );
      },
    },
    put: {
      success: ({
        mockedResponse = {
          scope: 'scope',
          scope_id: 'scope_id',
          namespace: 'namespace',
          key: 'key',
          content_type: 'content_type',
          size: 100,
          updated_by: 'updated_by',
          updated_at: 'updated_at',
          etag: 'etag',
        },
        scope = 'scope',
        scope_id = 'scope_id',
        namespace = 'namespace',
        key = 'key',
      }: {
        mockedResponse?: TRepositoryObjectDetailResponse;
        scope?: string;
        scope_id?: string;
        namespace?: string;
        key?: string;
      } = {}) => {
        return http.put(
          repository.object.mockedUrl
            .replace('{scope}', scope)
            .replace('{scope_id}', scope_id)
            .replace('{namespace}', namespace)
            .replace('{key}', key),
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
        scope = 'scope',
        scope_id = 'scope_id',
        namespace = 'namespace',
        key = 'key',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        scope?: string;
        scope_id?: string;
        namespace?: string;
        key?: string;
      } = {}) => {
        return http.put(
          repository.object.mockedUrl
            .replace('{scope}', scope)
            .replace('{scope_id}', scope_id)
            .replace('{namespace}', namespace)
            .replace('{key}', key),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({
        status = 204,
        scope = 'scope',
        scope_id = 'scope_id',
        namespace = 'namespace',
        key = 'key',
      }: {
        status?: number;
        scope?: string;
        scope_id?: string;
        namespace?: string;
        key?: string;
      } = {}) => {
        return http.delete(
          repository.object.mockedUrl
            .replace('{scope}', scope)
            .replace('{scope_id}', scope_id)
            .replace('{namespace}', namespace)
            .replace('{key}', key),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        scope = 'scope',
        scope_id = 'scope_id',
        namespace = 'namespace',
        key = 'key',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        scope?: string;
        scope_id?: string;
        namespace?: string;
        key?: string;
      } = {}) => {
        return http.delete(
          repository.object.mockedUrl
            .replace('{scope}', scope)
            .replace('{scope_id}', scope_id)
            .replace('{namespace}', namespace)
            .replace('{key}', key),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
