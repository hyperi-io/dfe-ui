import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { useSystemDefaultsStore } from '@/core/stores/systemDefaultsStore';
import { setupServer } from 'msw/node';

export const ADMIN_MOCKED_RESPONSE: TAuthMeResponse = {
  org_id: 'string',
  user_id: 'string',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
  external: false,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  password_change_required: false,
  hyperdx_role: 'string',
  hyperdx_identity: 'string',
};

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.setupStatus.get.success(),
  API_CONFIG_MOCKS.system.settings.get.success(),
  API_CONFIG_MOCKS.system.defaults.get.success({
    mockedResponse: {
      ttl_days: {
        effective: 90,
        stored: null,
        origin: 'deployment',
        deployment_default: 90,
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
  API_CONFIG_MOCKS.schemas.default.get.success(),
  API_CONFIG_MOCKS.sources.engines.get.success(),
);

export const resetSystemDefaultsStore = () => {
  useSystemDefaultsStore.getState().reset();
};
