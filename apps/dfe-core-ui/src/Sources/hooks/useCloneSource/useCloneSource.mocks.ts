import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { setupServer } from 'msw/node';

const handlers = [
  API_CONFIG_MOCKS.sources.sourceVersion.get.success({
    mockedResponse: {
      source: 'source',
      display_name: 'display_name',
      enabled: true,
      current: 'string',
      selected: 'string',
      versions: ['string'],
      deployed_version: 'string',
      version: {
        date_time: 'string',
        header: {
          type: 'string',
          version: 'string',
        },
        schema: {
          meta_schema: 'string',
          meta_schema_version: 'string',
          derived_schema: 'string',
          additional_fields: 'string',
          ttl_days: 0,
          engine: 'string',
        },
        transform: {
          engine: 'string',
          config_file: 'string',
          env: {
            string: 'string',
          },
          files: ['string'],
        },
        fetcher: {
          source_type: 'string',
          base_url: 'string',
          auth: {
            type: 'string',
            token_url: 'string',
            client_id: 'string',
            client_secret: 'string',
            api_key: 'string',
          },
          poll_interval_secs: 0,
        },
        sigma: {
          taxonomy: 'string',
          custom_mappings: {
            string: 'string',
          },
        },
        field_mappings: ['string'],
        mapping_standards: ['string'],
        match: {
          field: 'string',
          value: 'string',
        },
      },
    },
  }),
  API_CONFIG_MOCKS.sources.default.post.success({
    mockedResponse: {
      source: 'source',
      message: 'ok',
      current: 'string',
      versions: ['string'],
    },
  }),
];

export const server = setupServer(...handlers);
