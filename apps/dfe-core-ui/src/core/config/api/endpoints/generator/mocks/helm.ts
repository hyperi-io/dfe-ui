import { THelmFilesResponse } from '@/Platform/hooks/helm/useFetchHelmFiles/types';
import { THelmFileVariablesResponse } from '@/Platform/hooks/helm/useFetchHelmFileVariables/types';
import { TUpdateHelmFileVariableResponse } from '@/Platform/hooks/helm/useUpdateHelmFileVariable/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const helm = {
  listFiles: {
    mockedUrl: '/api/v1/helm/files',
    get: {
      success: ({
        mockedResponse = ['string'],
      }: {
        mockedResponse?: THelmFilesResponse;
      } = {}) => {
        return http.get(helm.listFiles.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  fileVariables: {
    mockedUrl: '/api/v1/helm/files/{name}/vars',
    get: {
      success: ({
        mockedResponse = [
          {
            test: ['test'],
          },
        ],
        name = 'name',
      }: {
        mockedResponse?: THelmFileVariablesResponse;
        name?: string;
      } = {}) => {
        return http.get(
          helm.fileVariables.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  fileVariable: {
    mockedUrl: '/api/v1/helm/files/{name}/vars/{path}',
    put: {
      success: ({
        mockedResponse = {
          changed: true,
          commit_sha: 'string',
          auto_merged: true,
          review_required: true,
          pr_url: 'string',
        },
        name = 'name',
        path = 'path',
      }: {
        mockedResponse?: TUpdateHelmFileVariableResponse;
        name?: string;
        path?: string;
      } = {}) => {
        return http.put(
          helm.fileVariable.mockedUrl
            .replace('{name}', name)
            .replace('{path}', path),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
        path = 'path',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
        path?: string;
      } = {}) => {
        return http.put(
          helm.fileVariable.mockedUrl
            .replace('{name}', name)
            .replace('{path}', path),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({
        status = 204,
        name = 'name',
        path = 'path',
      }: { status?: number; name?: string; path?: string } = {}) => {
        return http.delete(
          helm.fileVariable.mockedUrl
            .replace('{name}', name)
            .replace('{path}', path),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'name',
        path = 'path',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
        path?: string;
      } = {}) => {
        return http.delete(
          helm.fileVariable.mockedUrl
            .replace('{name}', name)
            .replace('{path}', path),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
