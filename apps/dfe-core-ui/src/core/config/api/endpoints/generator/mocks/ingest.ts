import { TCompatBinding } from '@/Sources/hooks/useFetchCompat/types';
import { TCompatProfileSummary } from '@/Sources/hooks/useFetchCompatProfiles/types';
import { TRuleBlock } from '@/Sources/hooks/useFetchRuleBlocks/types';
import { TRuleOrderResponse } from '@/Sources/hooks/useReorderRuleBlocks/types';
import { http, HttpResponse } from 'msw';

const MOCK_RULES_ETAG = '"order-1"';
const MOCK_COMPAT_ETAG = '"compat-1"';

const block = (
  overrides: Partial<TRuleBlock> & Pick<TRuleBlock, 'id' | 'position'>,
): TRuleBlock => ({
  target: '_source',
  kind: 'source',
  name: overrides.id.replace(/^source\./, ''),
  pinned: false,
  compiled: true,
  rules: [],
  warnings: [],
  ...overrides,
});

const MOCK_RULE_BLOCKS: TRuleBlock[] = [
  block({ id: 'source.cisco-ios', position: 1 }),
  block({ id: 'source.okta', position: 2 }),
  block({
    id: 'compat.dfe-legacy-2x',
    position: 3,
    kind: 'profile',
    name: 'dfe-legacy-2x',
    version: '1.0.0',
  }),
  block({
    id: 'default',
    position: 4,
    kind: 'default',
    name: '',
    pinned: true,
  }),
  block({
    id: 'default',
    position: 1,
    target: '_org_id',
    kind: 'default',
    name: '',
    pinned: true,
  }),
];

const MOCK_COMPAT_PROFILES: TCompatProfileSummary[] = [
  {
    id: 'dfe-legacy-2x',
    resource_type: 'core',
    current: '1.0.0',
    versions: ['1.0.0'],
    title: 'DFE 2.0 and 2.1 senders',
    description: 'Reads the org and category a DFE 2.0 or 2.1 collector sends.',
    covers: [{ platform: 'dfe', version: '>=2.0 <2.2' }],
    targets: ['_source', '_org_id'],
    opt_in: [],
  },
  {
    id: 'elastic-agent',
    resource_type: 'core',
    current: '1.0.0',
    versions: ['1.0.0'],
    title: 'Elastic Agent and Beats',
    description: 'Maps data_stream.dataset to the source.',
    covers: [{ platform: 'elastic-agent', version: null }],
    targets: ['_source', '_org_id'],
    opt_in: ['org-from-namespace'],
  },
];

const orderResponse = (blocks: TRuleBlock[]): TRuleOrderResponse => ({
  dry_run: false,
  reload: 'hot',
  apps_synced: [],
  restart_required: [],
  target: '_source',
  blocks,
});

export const ingest = {
  rules: {
    mockedUrl: '/api/v1/ingest/rules',
    get: {
      success: ({
        blocks = MOCK_RULE_BLOCKS,
        etag = MOCK_RULES_ETAG,
      }: { blocks?: TRuleBlock[]; etag?: string | null } = {}) =>
        http.get(ingest.rules.mockedUrl, () =>
          HttpResponse.json(
            { items: blocks, next_page_token: null, total_size: blocks.length },
            { headers: etag ? { ETag: etag } : {} },
          ),
        ),
      error: ({ status = 500 }: { status?: number } = {}) =>
        http.get(ingest.rules.mockedUrl, () =>
          HttpResponse.json(
            { code: 'internal_error', message: 'An unexpected error occurred' },
            { status },
          ),
        ),
    },
  },
  rulesOrder: {
    mockedUrl: '/api/v1/ingest/rules/order',
    post: {
      success: ({
        blocks = MOCK_RULE_BLOCKS,
      }: { blocks?: TRuleBlock[] } = {}) =>
        http.post(ingest.rulesOrder.mockedUrl, () =>
          HttpResponse.json(orderResponse(blocks)),
        ),
      error: ({
        status = 409,
        body = {
          code: 'order_conflict',
          message:
            'The _source blocks are not the ones listed: send every one of them',
          context: {
            target: '_source',
            blocks: ['source.cisco-ios', 'source.okta', 'source.syslog'],
          },
        },
      }: { status?: number; body?: Record<string, unknown> } = {}) =>
        http.post(ingest.rulesOrder.mockedUrl, () =>
          HttpResponse.json(body, { status }),
        ),
    },
  },
  compat: {
    mockedUrl: '/api/v1/ingest/compat',
    get: {
      success: ({
        profiles = [],
        etag = MOCK_COMPAT_ETAG,
      }: { profiles?: TCompatBinding[]; etag?: string | null } = {}) =>
        http.get(ingest.compat.mockedUrl, () =>
          HttpResponse.json(
            { profiles },
            { headers: etag ? { ETag: etag } : {} },
          ),
        ),
    },
    put: {
      success: () =>
        http.put(ingest.compat.mockedUrl, async ({ request }) => {
          const body = (await request.json()) as { profiles: TCompatBinding[] };
          return HttpResponse.json({
            dry_run: false,
            reload: 'hot',
            apps_synced: [],
            restart_required: [],
            profiles: body.profiles,
          });
        }),
      error: ({
        status = 412,
        body = {
          code: 'etag_mismatch',
          message: 'If-Match does not match the current ETag',
          context: { etag: '"compat-2"' },
        },
      }: { status?: number; body?: Record<string, unknown> } = {}) =>
        http.put(ingest.compat.mockedUrl, () =>
          HttpResponse.json(body, { status }),
        ),
    },
  },
  compatProfiles: {
    mockedUrl: '/api/v1/ingest/compat-profiles',
    get: {
      success: ({
        profiles = MOCK_COMPAT_PROFILES,
      }: { profiles?: TCompatProfileSummary[] } = {}) =>
        http.get(ingest.compatProfiles.mockedUrl, () =>
          HttpResponse.json({
            items: profiles,
            next_page_token: null,
            total_size: profiles.length,
          }),
        ),
    },
  },
};
