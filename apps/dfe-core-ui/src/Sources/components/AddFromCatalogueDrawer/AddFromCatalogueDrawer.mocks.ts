import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { OKTA_CATALOGUE_ENTRY } from '@/core/config/api/endpoints/generator/mocks/sources';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import {
  TSourceCatalogueItem,
  TSourceCataloguesResponse,
} from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const ADMIN: TAuthMeResponse = {
  org_id: 'org',
  user_id: 'user',
  roles: ['admin'],
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

/** An entry that compiles to two variants and arrives by receiver unless told otherwise. */
export const COREDNS_CATALOGUE_ENTRY: TSourceCatalogueItem = {
  ...OKTA_CATALOGUE_ENTRY,
  name: 'coredns-log',
  description: null,
  package: 'coredns',
  data_stream: 'log',
  dataset: 'coredns.log',
  intakes: ['beats', 'receiver'],
  default_intake: 'receiver',
  beats: { module: 'coredns', fileset: 'log' },
  variant: 'filebeat.coredns_log.default',
  variants: ['filebeat.coredns_log.default', 'filebeat.coredns_log.json'],
};

export const MISSING_VARIANT_REASON =
  "the deployed 'dfe-transform-elastic' does not ship transform variant 'filebeat.coredns_log.default'";

/** One catalogue page holding exactly these entries. */
export const catalogueOf = (
  ...entries: TSourceCatalogueItem[]
): TSourceCataloguesResponse => ({
  items: entries,
  total: entries.length,
  page: 1,
  per_page: 20,
  total_pages: 1,
  next_page: null,
  prev_page: null,
});

export const listCatalogue = (...entries: TSourceCatalogueItem[]) =>
  API_CONFIG_MOCKS.sources.catalogue.get.success({
    mockedResponse: catalogueOf(...entries),
  });

const fromCatalogueUrl = (entry: string) =>
  API_CONFIG_MOCKS.sources.fromCatalogue.mockedUrl.replace('{entry}', entry);

export const refuseCatalogueCreate = (body: object, status = 422) =>
  http.post(fromCatalogueUrl('okta'), () =>
    HttpResponse.json(body, { status }),
  );

/** Answer creates of *entry* as the engine does, keeping each body sent. */
export const recordCatalogueCreates = (entry: string) => {
  const bodies: unknown[] = [];
  const handler = http.post(fromCatalogueUrl(entry), async ({ request }) => {
    bodies.push(await request.json());
    return HttpResponse.json(
      {
        source: entry,
        message: 'created',
        current: '1.0.0',
        versions: ['1.0.0'],
      },
      { status: 201 },
    );
  });
  return { bodies, handler };
};

const handlers = [
  API_CONFIG_MOCKS.auth.me.get.success({ mockedResponse: ADMIN }),
  API_CONFIG_MOCKS.sources.catalogue.get.success(),
  API_CONFIG_MOCKS.sources.fromCatalogue.post.success(),
  // The sources list sits behind the drawer and refetches once a source lands.
  API_CONFIG_MOCKS.sources.default.get.success(),
  // The listed source's row fetches its columns and its flow once it renders.
  API_CONFIG_MOCKS.sources.sourceColumns.get.success({ source_name: 'test' }),
  API_CONFIG_MOCKS.sources.sourceFlow.get.success({ name: 'test' }),
];

export const server = setupServer(...handlers);
