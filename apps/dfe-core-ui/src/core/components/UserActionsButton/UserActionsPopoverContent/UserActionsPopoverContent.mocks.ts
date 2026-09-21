import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

const handlers = [
  API_CONFIG_MOCKS.auth.me.get.success(),
  API_CONFIG_MOCKS.auth.permissions.get.success(),
  API_CONFIG_MOCKS.accounts.me.get.success(),
];

export const server = setupServer(...handlers);
