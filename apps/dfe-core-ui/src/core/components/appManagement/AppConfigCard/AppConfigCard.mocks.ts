import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { setupServer } from 'msw/node';

export const SERVICE = 'dfe-loader';
export const INSTANCE = 'default';
export const CONFIG_URL = `/api/v1/apps/${SERVICE}/${INSTANCE}/config`;

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

export const authHandler = API_CONFIG_MOCKS.auth.me.get.success({
  mockedResponse: ADMIN_MOCKED_RESPONSE,
});

export const server = setupServer(
  authHandler,
  API_CONFIG_MOCKS.apps.config.get.success({
    service: SERVICE,
    instance: INSTANCE,
  }),
);
