import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

// The held-IDs notice lists hunts and organisations to name them by display name.
const handlers = [
  API_CONFIG_MOCKS.orgs.default.get.success(),
  API_CONFIG_MOCKS.hunts.default.get.success(),
];

export const server = setupServer(...handlers);
