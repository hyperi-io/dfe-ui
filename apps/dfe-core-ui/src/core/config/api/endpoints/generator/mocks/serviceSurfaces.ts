import { TServiceSurfaceDetailResponse } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaceDetail/types';
import { TServiceSurfaceListResponse } from '@/Services/hooks/serviceSurfaces/useFetchServiceSurfaces/types';
import { http, HttpResponse } from 'msw';

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
      }: {
        mockedResponse?: TServiceSurfaceDetailResponse;
      } = {}) => {
        return http.get(serviceSurfaces.surface.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
};
