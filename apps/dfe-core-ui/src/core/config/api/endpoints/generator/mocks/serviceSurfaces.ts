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
      success: () => {
        return console.error('Not implemented');
      },
    },
  },
};
