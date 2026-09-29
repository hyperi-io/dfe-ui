import { TAlertCreateResponse } from '@/Hunts/hooks/useCreateAlert/types';
import { TAlertDetailResponse } from '@/Hunts/hooks/useFetchAlertDetail/types';
import { TAlertListResponse } from '@/Hunts/hooks/useFetchInfiniteFilteredAlerts/types';
import { TAlertUpdateResponse } from '@/Hunts/hooks/useUpdateAlert/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const alerts = {
  destinations: {
    mockedUrl: '/api/v1/alerts/destinations',
    get: {
      success: ({
        mockedResponse = {
          items: [
            {
              name: 'string',
              description: 'string',
              enabled: true,
              url_scheme: 'string',
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
        mockedResponse?: TAlertListResponse;
      } = {}) => {
        return http.get(alerts.destinations.mockedUrl, () => {
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
        return http.get(alerts.destinations.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
    post: {
      success: ({
        mockedResponse = {
          name: 'string',
          url: 'string',
          description: 'string',
          enabled: true,
          url_scheme: '',
        },
      }: {
        mockedResponse?: TAlertCreateResponse;
      } = {}) => {
        return http.post(alerts.destinations.mockedUrl, () => {
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
        return http.post(alerts.destinations.mockedUrl, () => {
          return HttpResponse.json(mockedResponse, { status });
        });
      },
    },
  },
  destination: {
    mockedUrl: '/api/v1/alerts/destinations/{name}',
    get: {
      success: ({
        mockedResponse = {
          name: 'string',
          url: 'string',
          description: 'string',
          enabled: true,
          url_scheme: '',
        },
        name = 'name',
      }: {
        mockedResponse?: TAlertDetailResponse;
        name?: string;
      } = {}) => {
        return http.get(
          alerts.destination.mockedUrl.replace('{name}', name),
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
        return http.get(
          alerts.destination.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    put: {
      success: ({
        mockedResponse = {
          name: 'string',
          url: 'string',
          description: 'string',
          enabled: true,
          url_scheme: '',
        },
        name = 'alert_name',
      }: {
        mockedResponse?: TAlertUpdateResponse;
        name?: string;
      } = {}) => {
        return http.put(
          alerts.destination.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'alert_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.put(
          alerts.destination.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
    delete: {
      success: ({
        status = 204,
        name = 'alert_name',
      }: { status?: number; name?: string } = {}) => {
        return http.delete(
          alerts.destination.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json({}, { status });
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'alert_name',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.delete(
          alerts.destination.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
