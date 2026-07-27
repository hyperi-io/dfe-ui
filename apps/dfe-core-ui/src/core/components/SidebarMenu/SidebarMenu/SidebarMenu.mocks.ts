import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { setupServer } from 'msw/node';

const ADMIN_MOCKED_RESPONSE: TAuthMeResponse = {
  org_id: 'string',
  user_id: 'string',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
};

const handlers = [
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
];

export const server = setupServer(...handlers);
