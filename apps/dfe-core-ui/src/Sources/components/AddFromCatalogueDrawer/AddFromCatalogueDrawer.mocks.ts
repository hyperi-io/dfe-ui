import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { setupServer } from 'msw/node';

const ADMIN: TAuthMeResponse = {
  org_id: 'org',
  user_id: 'user',
  roles: ['admin'],
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

const handlers = [
  API_CONFIG_MOCKS.auth.me.get.success({ mockedResponse: ADMIN }),
  API_CONFIG_MOCKS.sources.catalogue.get.success(),
  API_CONFIG_MOCKS.sources.fromCatalogue.post.success(),
  // The sources list sits behind the drawer and refetches once a source lands.
  API_CONFIG_MOCKS.sources.default.get.success(),
  // The listed source's row fetches its columns and its flow once it renders.
  API_CONFIG_MOCKS.sources.sourceColumns.get.success({ source_name: 'test' }),
  API_CONFIG_MOCKS.sources.sourceFlow.get.success({ name: 'test' }),
];

export const server = setupServer(...handlers);
