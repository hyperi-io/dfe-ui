import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { setupServer } from 'msw/node';

export const ADMIN_MOCKED_RESPONSE: TAuthMeResponse = {
  org_id: 'string',
  user_id: 'string',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
};

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.setupStatus.get.success(),
  API_CONFIG_MOCKS.schemas.default.get.success(),
);
