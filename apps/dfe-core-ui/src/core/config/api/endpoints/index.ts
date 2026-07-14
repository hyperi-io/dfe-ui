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
    sourceVersion: '/api/v1/sources/{name}/versions/{version}',
    bulk: '/api/v1/sources/bulk',
    seed: '/api/v1/sources/seed',
    plan: '/api/v1/sources/{name}/plan',
    deploy: '/api/v1/sources/{name}/deploy',
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
    rule: '/api/v1/rules/{name}',
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
    sampleRows: '/api/v1/schemas/{source_name}/sample-rows',
    jsonPaths: '/api/v1/schemas/{source_name}/json-paths',
    promoteField: '/api/v1/schemas/{source_name}/promote-field',
  },
  orgs: {
    default: '/api/v1/orgs',
    org: '/api/v1/orgs/{name}',
  },
  groups: {
    default: '/api/v1/auth/groups',
    group: '/api/v1/auth/groups/{name}',
    groupMembers: '/api/v1/auth/groups/{name}/members',
    groupMember: '/api/v1/auth/groups/{name}/members/{username}',
  },
  accounts: {
    default: '/api/v1/auth/accounts',
    account: '/api/v1/auth/accounts/{username}',
    resetPassword: '/api/v1/auth/accounts/{username}/reset-password',
  },
  roles: {
    default: '/api/v1/auth/roles',
    role: '/api/v1/auth/roles/{name}',
    scopes: '/api/v1/auth/roles/scopes',
  },
  hunts: {
    default: '/api/v1/hunts',
    engineStatus: '/api/v1/hunts/status',
    hunt: '/api/v1/hunts/{name}',
    huntRun: '/api/v1/hunts/{name}/run',
  },
  oidc: {
    login: '/api/v1/auth/oidc/{provider}/login',
    callback: '/api/v1/auth/oidc/{provider}/callback',
  },
  oidc_providers: {
    default: '/api/v1/auth/oidc-providers',
    provider: '/api/v1/auth/oidc-providers/{name}',
    sync: '/api/v1/auth/oidc-providers/{name}/sync',
    test: '/api/v1/auth/oidc-providers/{name}/test',
  },
} as const satisfies Record<string, Record<string, keyof paths>>);
