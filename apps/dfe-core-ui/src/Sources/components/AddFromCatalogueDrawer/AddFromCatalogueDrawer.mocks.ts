import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { setupServer } from 'msw/node';

const ADMIN: TAuthMeResponse = {
  org_id: 'org',
  user_id: 'user',
  roles: ['admin'],
  permissions: ['*'],
  groups: ['group'],
};

const handlers = [
  API_CONFIG_MOCKS.auth.me.get.success({ mockedResponse: ADMIN }),
  API_CONFIG_MOCKS.sources.catalogue.get.success(),
  API_CONFIG_MOCKS.sources.fromCatalogue.post.success(),
  // The sources list sits behind the drawer and refetches once a source lands.
  API_CONFIG_MOCKS.sources.default.get.success(),
];

export const server = setupServer(...handlers);
