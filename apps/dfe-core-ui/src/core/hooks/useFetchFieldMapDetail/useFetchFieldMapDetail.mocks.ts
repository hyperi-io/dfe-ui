import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

const handlers = [
  API_CONFIG_MOCKS.fieldMaps.source.get.success(),
  API_CONFIG_MOCKS.fieldMaps.standard.get.success(),
];

export const server = setupServer(...handlers);
