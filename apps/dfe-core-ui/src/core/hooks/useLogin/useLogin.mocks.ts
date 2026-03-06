import { setupServer } from 'msw/node';

import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';

const handlers = [API_CONFIG_MOCKS.auth.login.post.success()];

export const server = setupServer(...handlers);
