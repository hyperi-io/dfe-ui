import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const PR_URL = 'https://github.com/acme/deploy/pull/7';

const SOURCE: TSourceVersionDetail = {
  source: 'shared-probe',
  resource_type: 'custom',
  display_name: 'Shared Probe',
  description: 'probe',
  enabled: true,
  current: '1.0.0',
  deployed_version: '1.0.0',
  selected: '1.0.0',
  versions: ['1.0.0'],
  state: 'active',
  current_table_topic_type: 'main',
  version: {
    origin: 'receiver',
    date_time: '2026-10-15',
    archive: false,
    header: { type: 'common-header/timeseries', version: '1.0.0' },
    schema: {
      meta_schema: null,
      meta_schema_version: null,
      ttl_days: 30,
      engine: '',
    },
    match: {
      field: 'data_stream.dataset',
      operator: 'equals',
      value: 'probe.log',
      negate: false,
    },
  },
};

/** What the engine answers a save with: held for review, or applied. */
export const saveAnswer = { heldForReview: true };

export const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.sources.default.get.success(),
  API_CONFIG_MOCKS.fieldMaps.default.get.success(),
  API_CONFIG_MOCKS.ingest.compatProfiles.get.success(),
  API_CONFIG_MOCKS.ingest.compat.get.success(),
  API_CONFIG_MOCKS.sources.sourceVersion.get.success({
    mockedResponse: SOURCE,
    name: 'shared-probe',
    version: '1.0.0',
  }),
  http.put('/api/v1/sources/shared-probe', () =>
    HttpResponse.json({
      source: 'shared-probe',
      message: 'updated',
      current: '1.0.0',
      versions: ['1.0.0'],
      review_required: saveAnswer.heldForReview,
      ...(saveAnswer.heldForReview && { pr_url: PR_URL }),
    }),
  ),
);
