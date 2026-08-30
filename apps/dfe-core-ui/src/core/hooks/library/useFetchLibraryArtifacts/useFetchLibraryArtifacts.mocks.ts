import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

export const server = setupServer(
  API_CONFIG_MOCKS.library.default.get.success(),
);
