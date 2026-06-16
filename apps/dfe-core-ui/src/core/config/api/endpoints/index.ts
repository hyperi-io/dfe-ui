import type { paths } from '@repo/dfe-engine-types';

export const API_CONFIG = Object.freeze({
  auth: {
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    permissions: '/api/v1/auth/permissions',
  },
  sources: {
    default: '/api/v1/sources',
    source: '/api/v1/sources/{name}',
    sourceColumns: '/api/v1/sources/{name}/columns',
    sourceBuild: '/api/v1/sources/{name}/build',
    sourceVersion: '/api/v1/sources/{name}/versions',
    bulk: '/api/v1/sources/bulk',
    seed: '/api/v1/sources/seed',
  },
  services: {
    default: '/api/v1/services',
    instance: '/api/v1/services/{service}/{instance}',
    validate: '/api/v1/services/{service}/{instance}/validate',
    history: '/api/v1/services/{service}/{instance}/history',
    seed: '/api/v1/services/seed',
  },
  deployments: {
    default: '/api/v1/deployments',
    deployment: '/api/v1/deployments/{service}/{instance}',
    validate: '/api/v1/deployments/{service}/{instance}/validate',
    history: '/api/v1/deployments/{service}/{instance}/history',
    applySize: '/api/v1/deployments/{service}/{instance}/size/{size}',
    seed: '/api/v1/deployments/seed',
  },
  fieldMaps: {
    default: '/api/v1/field-maps',
    standard: '/api/v1/field-maps/{standard}',
    source: '/api/v1/field-maps/{standard}/{source}',
    seed: '/api/v1/field-maps/seed',
  },
  rules: {
    default: '/api/v1/rules',
    validate: '/api/v1/rules/validate',
  },
  alerts: {
    destinations: '/api/v1/alerts/destinations',
    destination: '/api/v1/alerts/destinations/{name}',
  },
  system: {
    version: '/api/v1/system/version',
    settings: '/api/v1/system/settings',
  },
  transforms: {
    compile: '/api/v1/transforms/compile',
    test: '/api/v1/transforms/test',
  },
  schemas: {
    default: '/api/v1/schemas',
    schemaVersions: '/api/v1/schemas/definitions/{schema_path}/versions',
    schema: '/api/v1/schemas/definitions/{schema_path}',
    schemaDetail: '/api/v1/schemas/definitions/{schema_path}/versions/columns',
    elasticConvert: '/api/v1/schemas/elastic-converter',
  },
} as const satisfies Record<string, Record<string, keyof paths>>);
