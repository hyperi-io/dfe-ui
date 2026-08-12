import { TGroupsResponse } from '@/core/hooks/useFetchInfiniteFilteredGroups/types';
import { TAddGroupMemberResponse } from '@/Settings/hooks/groups/useAddGroupMember/types';
import { TGroupCreateResponse } from '@/Settings/hooks/groups/useCreateGroup/types';
import { TGroupDetailResponse } from '@/Settings/hooks/groups/useFetchGroupDetail/types';
import { TRemoveGroupMemberResponse } from '@/Settings/hooks/groups/useRemoveGroupMember/types';
import { TGroupUpdateResponse } from '@/Settings/hooks/groups/useUpdateGroup/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const groups = {
  default: {
    mockedUrl: '/api/v1/auth/groups',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              name: 'string',
              description: 'string',
              roles: ['string'],
              members: ['string'],
              scope: 'string',
            },
          ],
          total: 25,
          page: 1,
          per_page: 10,
          total_pages: 3,
          next_page: 2,
          prev_page: 0,
        },
      }: {
        mockedResponse?: TGroupsResponse;
      } = {}) => {
        return http.get(groups.default.mockedUrl, () => {
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
        return http.get(groups.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          name: 'group_name',
          description: 'string',
          roles: ['string'],
          members: ['string'],
          scope: 'string',
        },
      }: {
        mockedResponse?: TGroupCreateResponse;
      } = {}) => {
        return http.post(groups.default.mockedUrl, () => {
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
        return http.post(groups.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  group: {
    mockedUrl: '/api/v1/auth/groups/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'group_name',
          description: 'string',
          roles: ['string'],
          members: ['string'],
          scope: 'string',
        },
        group_name = 'group_name',
      }: {
        mockedResponse?: TGroupDetailResponse;
        group_name?: string;
      } = {}) => {
        return http.get(
          groups.group.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        group_name = 'group_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        group_name?: string;
      } = {}) => {
        return http.get(
          groups.group.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    put: {
      success: ({
        mockedResponse = {
          name: 'group_name',
          description: 'string',
          roles: ['string'],
          members: ['string'],
          scope: 'string',
        },
        group_name = 'group_name',
      }: {
        mockedResponse?: TGroupUpdateResponse;
        group_name?: string;
      } = {}) => {
        return http.put(
          groups.group.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        group_name = 'group_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        group_name?: string;
      } = {}) => {
        return http.put(
          groups.group.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({
        status = 204,
        group_name = 'group_name',
      }: { status?: number; group_name?: string } = {}) => {
        return http.delete(
          groups.group.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        group_name = 'group_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        group_name?: string;
      } = {}) => {
        return http.delete(
          groups.group.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  groupMembers: {
    mockedUrl: '/api/v1/auth/groups/{name}/members',
    get: {
      success: () => {
        console.error('Not implemented');
      },
    },
    post: {
      success: ({
        mockedResponse = {
          name: 'group_name',
          description: 'string',
          roles: ['string'],
          members: ['string'],
          scope: 'string',
        },
        group_name = 'group_name',
      }: {
        mockedResponse?: TAddGroupMemberResponse;
        group_name?: string;
      } = {}) => {
        return http.post(
          groups.groupMembers.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        group_name = 'group_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        group_name?: string;
      } = {}) => {
        return http.post(
          groups.groupMembers.mockedUrl.replace('{name}', group_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
  groupMember: {
    mockedUrl: '/api/v1/auth/groups/{name}/members/{username}',
    get: {
      success: () => {
        console.error('Not implemented');
      },
    },
    delete: {
      success: ({
        mockedResponse = {
          name: 'group_name',
          description: 'string',
          roles: ['string'],
          members: ['string'],
          scope: 'string',
        },
        group_name = 'group_name',
        username = 'string',
      }: {
        mockedResponse?: TRemoveGroupMemberResponse;
        group_name?: string;
        username?: string;
      } = {}) => {
        return http.delete(
          groups.groupMember.mockedUrl
            .replace('{name}', group_name)
            .replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        group_name = 'group_name',
        username = 'string',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        group_name?: string;
        username?: string;
      } = {}) => {
        return http.delete(
          groups.groupMember.mockedUrl
            .replace('{name}', group_name)
            .replace('{username}', username),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
