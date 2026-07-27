import { TClientConfigResponse } from '@/Platform/hooks/clientConfig/useFetchClientConfig/types';
import { http, HttpResponse } from 'msw';

export const clientConfig = {
  default: {
    mockedUrl: '/api/v1/config/client',
    get: {
      success: ({
        mockedResponse = {
          api_base: 'api_base',
          hyperdx: { enabled: true, url: 'url' },
          auth_mode: 'auth_mode',
          features: { feature: true },
        },
      }: { mockedResponse?: TClientConfigResponse } = {}) => {
        return http.get(clientConfig.default.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
    },
  },
};
