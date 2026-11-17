import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

const handlers = [API_CONFIG_MOCKS.rules.rule.get.success()];

export const server = setupServer(...handlers);
