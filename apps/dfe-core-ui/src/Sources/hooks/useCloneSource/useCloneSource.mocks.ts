import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { setupServer } from 'msw/node';

const handlers = [
  API_CONFIG_MOCKS.sources.source.get.success(),
  API_CONFIG_MOCKS.sources.default.post.success({
    mockedResponse: { source: 'source', message: 'ok' },
  }),
];

export const server = setupServer(...handlers);
