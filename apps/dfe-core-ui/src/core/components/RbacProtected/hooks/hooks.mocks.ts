import { setupServer } from 'msw/node';

import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { AuthMe } from './types';

export const ADMIN_MOCKED_RESPONSE: AuthMe = {
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
