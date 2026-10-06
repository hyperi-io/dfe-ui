import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { setupServer } from 'msw/node';

const ADMIN_MOCKED_RESPONSE: TAuthMeResponse = {
  org_id: 'string',
  user_id: 'string',
  roles: ['role'],
  permissions: ['*'],
  groups: ['group'],
  external: false,
  blocked: false,
  disabled_at: '',
  blocked_at: '',
  password_change_required: false,
  hyperdx_role: 'string',
  hyperdx_identity: 'string',
};

const transformApp = ({
  engine,
  instances,
  offered = true,
}: {
  engine: string;
  instances: string[];
  offered?: boolean;
}): TAppCatalogueEntry => ({
  service: `dfe-transform-${engine}`,
  scale_deployed: true,
  multiplicity: 'per_config',
  has_compiled_routing: true,
  routing_scope: 'instance',
  optional: false,
  offered,
  transform_engine: engine,
  file_sets: [],
  instances,
});

/** vrl deployed for the source, vector free, elastic not offered here. */
export const TRANSFORM_APPS: TAppCatalogueEntry[] = [
  transformApp({ engine: 'vrl', instances: ['syslog'] }),
  transformApp({ engine: 'vector', instances: [] }),
  transformApp({ engine: 'elastic', instances: [], offered: false }),
];

export const SYSLOG_ON_VRL: TSourceVersionDetail = {
  source: 'syslog',
  resource_type: 'custom',
  display_name: 'syslog',
  description: '',
  enabled: true,
  current: '1.0.0',
  deployed_version: '1.0.0',
  selected: '1.0.0',
  versions: ['1.0.0'],
  state: 'active',
  version: {
    origin: 'receiver',
    date_time: '2026-09-01',
    archive: false,
    schema: {
      meta_schema: 'ecs',
      meta_schema_version: '8.11',
      ttl_days: 0,
      engine: 'MergeTree',
    },
    transform: { engine: 'vrl', config_file: 'vrl.yaml', env: {}, files: [] },
    match: { field: 'event.dataset', operator: 'equals', value: 'syslog' },
  },
};

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.apps.default.get.success({
    mockedResponse: TRANSFORM_APPS,
  }),
);
