import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { setupServer } from 'msw/node';

export const server = setupServer(
  API_CONFIG_MOCKS.backingServices.overlayVar.put.success({
    name: 'clickhouse-cluster',
    path: 'clickhouse.resources.requests.cpu',
  }),
);
