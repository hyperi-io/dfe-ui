import { TGitOpsAutoMergeResponse } from '@/Platform/hooks/gitops/useFetchGitOpsAutoMerge/types';
import { TGitOpsLogResponse } from '@/Platform/hooks/gitops/useFetchGitOpsLog/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const gitops = {
  autoMerge: {
    mockedUrl: '/api/v1/gitops/auto-merge',
    get: {
      success: ({
        mockedResponse = {
          stored: true,
          effective: true,
          allowed: true,
          reason: 'string',
        },
      }: {
        mockedResponse?: TGitOpsAutoMergeResponse;
      } = {}) => {
        return http.get(gitops.autoMerge.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
    put: {
      success: ({
        mockedResponse = {
          stored: true,
          effective: true,
          allowed: true,
          reason: 'string',
        },
      }: {
        mockedResponse?: TGitOpsAutoMergeResponse;
      } = {}) => {
        return http.put(gitops.autoMerge.mockedUrl, () => {
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
        return http.put(gitops.autoMerge.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  log: {
    mockedUrl: '/api/v1/gitops/log',
    get: {
      success: ({
        mockedResponse = {
          entries: [
            {
              sha: 'string',
              timestamp: 0,
              ctype: 'string',
              scope: 'string',
              summary: 'string',
              actor: 'string',
              role: 'string',
              action: 'string',
              request_id: 'string',
              files: ['string'],
              resources: ['string'],
              conforming: true,
              state: 'string',
            },
          ],
        },
      }: {
        mockedResponse?: TGitOpsLogResponse;
      } = {}) => {
        return http.get(gitops.log.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
};
