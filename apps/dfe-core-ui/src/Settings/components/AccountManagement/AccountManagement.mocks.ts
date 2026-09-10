import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { setupServer } from 'msw/node';

// An admin session: the account list sits behind account_read.
const ADMIN: TAuthMeResponse = {
  org_id: 'string',
  user_id: 'admin',
  roles: ['admin'],
  permissions: ['*'],
  groups: ['dfe-admins'],
};

const handlers = [
  API_CONFIG_MOCKS.auth.me.get.success({ mockedResponse: ADMIN }),
  API_CONFIG_MOCKS.auth.setupStatus.get.success(),
  API_CONFIG_MOCKS.accounts.default.get.success(),
];

export const server = setupServer(...handlers);
