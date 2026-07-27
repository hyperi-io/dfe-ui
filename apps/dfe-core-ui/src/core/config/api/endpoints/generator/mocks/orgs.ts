import { TOrganisationListResponse } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { TOrganisationCreateResponse } from '@/Settings/hooks/organisations/useCreateOrganisation/types';
import { TOrganisationDetail } from '@/Settings/hooks/organisations/useFetchOrganisationDetail/types';
import { TOrganisationUpdateResponse } from '@/Settings/hooks/organisations/useUpdateOrganisation/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const orgs = {
  default: {
    mockedUrl: '/api/v1/orgs',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              name: 'string',
              display_name: 'string',
              org_ids: ['string'],
              enabled: true,
              created_at: 'string',
              updated_at: 'string',
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
        mockedResponse?: TOrganisationListResponse;
      } = {}) => {
        return http.get(orgs.default.mockedUrl, () => {
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
        return http.get(orgs.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          name: 'org_name',
          display_name: 'string',
          org_ids: ['string'],
          enabled: true,
          created_at: 'string',
          updated_at: 'string',
        },
      }: {
        mockedResponse?: TOrganisationCreateResponse;
      } = {}) => {
        return http.post(orgs.default.mockedUrl, () => {
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
        return http.post(orgs.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  org: {
    mockedUrl: '/api/v1/orgs/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'org_name',
          display_name: 'string',
          org_ids: ['string'],
          enabled: true,
          created_at: 'string',
          updated_at: 'string',
        },
        org_name = 'org_name',
      }: {
        mockedResponse?: TOrganisationDetail;
        org_name?: string;
      } = {}) => {
        return http.get(orgs.org.mockedUrl.replace('{name}', org_name), () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        org_name = 'org_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        org_name?: string;
      } = {}) => {
        return http.get(orgs.org.mockedUrl.replace('{name}', org_name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    put: {
      success: ({
        mockedResponse = {
          name: 'org_name',
          display_name: 'string',
          org_ids: ['string'],
          enabled: true,
          created_at: 'string',
          updated_at: 'string',
        },
        org_name = 'org_name',
      }: {
        mockedResponse?: TOrganisationUpdateResponse;
        org_name?: string;
      } = {}) => {
        return http.put(orgs.org.mockedUrl.replace('{name}', org_name), () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        org_name = 'org_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        org_name?: string;
      } = {}) => {
        return http.put(orgs.org.mockedUrl.replace('{name}', org_name), () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    delete: {
      success: ({
        status = 204,
        org_name = 'org_name',
      }: { status?: number; org_name?: string } = {}) => {
        return http.delete(
          orgs.org.mockedUrl.replace('{name}', org_name),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        org_name = 'org_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        org_name?: string;
      } = {}) => {
        return http.delete(
          orgs.org.mockedUrl.replace('{name}', org_name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
