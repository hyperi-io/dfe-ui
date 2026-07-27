import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

const handlers = [
  API_CONFIG_MOCKS.system.clickhouseCloudStart.post.success(),
  API_CONFIG_MOCKS.system.clickhouseCloudStop.post.success(),
];

export const server = setupServer(...handlers);
