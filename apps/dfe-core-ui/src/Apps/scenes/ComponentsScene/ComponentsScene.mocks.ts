import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { setupServer } from 'msw/node';

const ADMIN_MOCKED_RESPONSE: TAuthMeResponse = {
  org_id: 'string',
  user_id: 'string',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
  external: false,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
};

const receiver = { service: 'dfe-receiver', instance: 'default' };

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.apps.default.get.success(),
  API_CONFIG_MOCKS.apps.status.get.success(receiver),
  API_CONFIG_MOCKS.apps.metrics.get.success(receiver),
  API_CONFIG_MOCKS.apps.metricsSeries.get.success(receiver),
  API_CONFIG_MOCKS.apps.scaling.get.success(receiver),
  API_CONFIG_MOCKS.apps.history.get.success(receiver),
  API_CONFIG_MOCKS.backingServices.default.get.success(),
);
