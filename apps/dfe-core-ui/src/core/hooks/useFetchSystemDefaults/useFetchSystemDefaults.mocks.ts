import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

const handlers = [
  API_CONFIG_MOCKS.system.defaults.get.success({
    mockedResponse: {
      ttl_days: {
        effective: 90,
        stored: null,
        origin: 'deployment',
        deployment_default: 90,
        maximum: 36500,
      },
      common_header_type: {
        effective: 'common-header/timeseries',
        stored: null,
        origin: 'deployment',
        deployment_default: 'common-header/timeseries',
      },
      common_header_version: {
        effective: '1.0.1',
        stored: null,
        origin: 'deployment',
        deployment_default: '1.0.1',
      },
      engine: {
        effective: 'MergeTree',
        stored: null,
        origin: 'deployment',
        deployment_default: 'MergeTree',
      },
      editable: true,
    },
  }),
];

export const server = setupServer(...handlers);
