import { TFeatureFlagsResponse } from '@/core/hooks/useFetchFeatureFlags/types';
import { TClientConfigResponse } from '@/Platform/hooks/clientConfig/useFetchClientConfig/types';
import { http, HttpResponse } from 'msw';
import {
  DEFAULT_VALIDATION_ERROR,
  TValidationError,
} from './endpoints.generator.mocks.types';

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
  features: {
    mockedUrl: '/api/v1/config/features',
    get: {
      success: ({
        mockedResponse = { feature: true },
      }: { mockedResponse?: TFeatureFlagsResponse } = {}) => {
        return http.get(clientConfig.features.mockedUrl, () => {
          return HttpResponse.json(mockedResponse);
        });
      },
      error: ({
        mockedResponse = DEFAULT_VALIDATION_ERROR,
        status = 500,
      }: { mockedResponse?: TValidationError; status?: number } = {}) => {
        return http.get(clientConfig.features.mockedUrl, () =>
          HttpResponse.json(mockedResponse, { status }),
        );
      },
    },
  },
};
