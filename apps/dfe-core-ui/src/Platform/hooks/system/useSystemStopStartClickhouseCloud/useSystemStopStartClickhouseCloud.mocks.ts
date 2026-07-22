import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { setupServer } from 'msw/node';

const handlers = [
  API_CONFIG_MOCKS.system.clickhouseCloudStart.post.success(),
  API_CONFIG_MOCKS.system.clickhouseCloudStop.post.success(),
];

export const server = setupServer(...handlers);
