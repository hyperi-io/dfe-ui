import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

// The form sits inside the field-maps provider, which lists on mount.
export const server = setupServer(
  API_CONFIG_MOCKS.fieldMaps.default.get.success(),
);
