import { paths } from '@hyperi/dfe-engine-types';
import { KeysWithSubstring, ReplaceParams } from './type.utils';

/** Union of all path keys that contain `{param}` placeholders. */
type DynamicPathPattern = KeysWithSubstring<paths, '{'>;

/** `{param}` placeholders resolved to `${string}` template literals for runtime matching. */
type DynamicPathResolved = ReplaceParams<DynamicPathPattern>;

/** Ensures path builder return type matches a known path pattern so typos (e.g. services123) error. */
function pathBuilder<P extends DynamicPathResolved>(
  fn: (...args: string[]) => P,
): (...args: string[]) => P {
  return fn;
}

const config = {
  auth: {
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    permissions: '/api/v1/auth/permissions',
  },
  sources: {
    default: '/api/v1/sources',
    source: pathBuilder((name: string) => `/api/v1/sources/${name}`),
    bulk: '/api/v1/sources/bulk',
    seed: '/api/v1/sources/seed',
  },
  services: {
    default: '/api/v1/services',
    instance: pathBuilder(
      (service: string, instance: string) =>
        `/api/v1/services/${service}/${instance}`,
    ),
    validate: pathBuilder(
      (service: string, instance: string) =>
        `/api/v1/services/${service}/${instance}/validate`,
    ),
    history: pathBuilder(
      (service: string, instance: string) =>
        `/api/v1/services/${service}/${instance}/history`,
    ),
    seed: '/api/v1/services/seed',
  },
  deployments: {
    default: '/api/v1/deployments',
    deployment: pathBuilder(
      (service: string, instance: string) =>
        `/api/v1/deployments/${service}/${instance}`,
    ),
    validate: pathBuilder(
      (service: string, instance: string) =>
        `/api/v1/deployments/${service}/${instance}/validate`,
    ),
    history: pathBuilder(
      (service: string, instance: string) =>
        `/api/v1/deployments/${service}/${instance}/history`,
    ),
    applySize: pathBuilder(
      (service: string, instance: string, size: string) =>
        `/api/v1/deployments/${service}/${instance}/size/${size}`,
    ),
    seed: '/api/v1/deployments/seed',
  },
  fieldMaps: {
    default: '/api/v1/field-maps',
    standard: pathBuilder(
      (standard: string) => `/api/v1/field-maps/${standard}`,
    ),
    source: pathBuilder(
      (standard: string, source: string) =>
        `/api/v1/field-maps/${standard}/${source}`,
    ),
    seed: '/api/v1/field-maps/seed',
  },
  rules: {
    default: '/api/v1/rules',
    validate: '/api/v1/rules/validate',
  },
  alerts: {
    destinations: '/api/v1/alerts/destinations',
    destination: pathBuilder(
      (name: string) => `/api/v1/alerts/destinations/${name}`,
    ),
  },
  system: {
    version: '/api/v1/system/version',
    settings: '/api/v1/system/settings',
  },
} satisfies {
  [key: string]: {
    [key: string]:
      | keyof paths
      | ((...args: string[]) => keyof paths | DynamicPathResolved);
  };
};

export const API_CONFIG = Object.freeze(config);
