import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { setupServer } from 'msw/node';

const handlers = [API_CONFIG_MOCKS.governance.adminPolicy.delete.success()];

export const server = setupServer(...handlers);
