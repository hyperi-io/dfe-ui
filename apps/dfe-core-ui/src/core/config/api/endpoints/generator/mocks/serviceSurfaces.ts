import { TServiceSurfaceDetailResponse } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaceDetail/types';
import { TServiceSurfaceListResponse } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaces/types';
import { TRefreshServiceSurfaceMetricsResponse } from '@/Services/hooks/serviceSurfaces/useRefreshServiceSurfaceMetrics/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

export const serviceSurfaces = {
  default: {
    mockedUrl: '/api/v1/service-surfaces',
    get: {
      success: ({
        mockedResponse = [
          {
            service: 'string',
            config_count: 0,
            metrics_count: 0,
            manifest_url: 'string',
            description: 'string',
          },
        ],
      }: {
        mockedResponse?: TServiceSurfaceListResponse;
      } = {}) => {
        return http.get(serviceSurfaces.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
  surface: {
    mockedUrl: '/api/v1/service-surfaces/{name}',
    get: {
      success: ({
        mockedResponse = {
          service: 'string',
          description: 'string',
          manifest_url: 'string',
          discovered_at: 'string',
          config_surface: {
            string: {
              type: 'string',
              description: 'string',
              default: 'string',
            },
          },
          metrics_surface: [
            {
              name: 'string',
              type: 'string',
              description: 'string',
              unit: 'string',
              labels: ['string'],
              group: 'string',
            },
          ],
        },
        name = 'string',
      }: {
        mockedResponse?: TServiceSurfaceDetailResponse;
        name?: string;
      } = {}) => {
        return http.get(
          serviceSurfaces.surface.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
    },
  },
  refreshMetrics: {
    mockedUrl: '/api/v1/service-surfaces/{name}/metrics/refresh',
    post: {
      success: ({
        mockedResponse = {
          service: 'string',
          refreshed: true,
          discovered_at: 'string',
          metrics_count: 0,
        },
        name = 'string',
      }: {
        mockedResponse?: TRefreshServiceSurfaceMetricsResponse;
        name?: string;
      } = {}) => {
        return http.post(
          serviceSurfaces.refreshMetrics.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse);
          },
        );
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 422,
        name = 'string',
      }: {
        mockedResponse?: TValidationError;
        status?: number;
        name?: string;
      } = {}) => {
        return http.post(
          serviceSurfaces.refreshMetrics.mockedUrl.replace('{name}', name),
          () => {
            return HttpResponse.json(mockedResponse, { status });
          },
        );
      },
    },
  },
};
