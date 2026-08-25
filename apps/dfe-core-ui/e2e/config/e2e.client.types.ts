import type { paths } from '@repo/dfe-engine-types/e2e';

export type E2EStatusResponse =
  paths['/api/e2e/status']['get']['responses']['200']['content']['application/json'];
export type SeedRequest =
  paths['/api/e2e/seed-static']['post']['requestBody']['content']['application/json'];
