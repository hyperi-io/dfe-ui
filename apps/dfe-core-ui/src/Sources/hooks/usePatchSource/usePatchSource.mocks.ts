import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

const handlers = [API_CONFIG_MOCKS.sources.source.patch.success()];

export const server = setupServer(...handlers);
