import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

// The form sits inside the field-maps provider, which lists on mount.
export const server = setupServer(
  API_CONFIG_MOCKS.fieldMaps.default.get.success(),
);

/** What the Table Settings, Transform and Views tabs read on an own-table source. */
export const ownTableHandlers = [
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.setupStatus.get.success(),
  API_CONFIG_MOCKS.system.settings.get.success(),
  API_CONFIG_MOCKS.system.defaults.get.success(),
  API_CONFIG_MOCKS.schemas.default.get.success(),
  API_CONFIG_MOCKS.sources.engines.get.success(),
  API_CONFIG_MOCKS.apps.default.get.success(),
];
